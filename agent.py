"""A bounded repair loop on a trusted arithmetic fixture, with explicit evidence."""
import argparse
import ast
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time
from uuid import uuid4

import neatlogs

ROOT = Path(__file__).resolve().parent
SOURCE = 'backoff.py'
CONFIG_KEYS = {'LITELLM_API_KEY', 'NEATLOGS_API_KEY', 'MODEL_BASE_URL', 'MODEL_NAME', 'AGY_MODEL'}
CORRECT_SOURCE = '''def retry_delay(attempt, base=1, cap=30):
    """Return the bounded delay for a zero-based retry attempt."""
    if attempt < 0 or base <= 0 or cap <= 0:
        raise ValueError("attempt must be nonnegative; base and cap must be positive")
    return min(base * 2 ** attempt, cap)
'''

def digest(text):
    return hashlib.sha256(text.encode()).hexdigest()

def write_json(path, value):
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(value, indent=2), encoding='utf8')
    os.replace(temporary, path)

def load_config():
    path = ROOT / 'config.private.json'
    if path.exists():
        config = json.loads(path.read_text(encoding='utf8'))
        if not isinstance(config, dict) or set(config) - CONFIG_KEYS:
            raise ValueError('Private config must contain only the documented configuration keys')
        for name, value in config.items():
            if not isinstance(value, str):
                raise ValueError('Configuration values must be strings')
            if value:
                os.environ.setdefault(name, value)

def validate_source(source):
    """Arithmetic-only AST boundary. General repository repair needs an OS sandbox."""
    if not isinstance(source, str) or len(source) > 10000:
        raise ValueError('Replacement must be at most 10,000 characters')
    tree = ast.parse(source)
    if len(tree.body) != 1 or not isinstance(tree.body[0], ast.FunctionDef):
        raise ValueError('Only the retry_delay function may be defined')
    function = tree.body[0]
    if function.name != 'retry_delay' or function.decorator_list:
        raise ValueError('Function name and undecorated shape are fixed')
    if [arg.arg for arg in function.args.args] != ['attempt', 'base', 'cap'] or function.args.vararg or function.args.kwarg:
        raise ValueError('Keep the original function parameters')
    allowed = (ast.Module, ast.FunctionDef, ast.arguments, ast.arg, ast.Return, ast.If, ast.Raise,
               ast.Expr, ast.Constant, ast.Name, ast.Load, ast.BinOp, ast.BoolOp, ast.UnaryOp,
               ast.Compare, ast.Call, ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv,
               ast.Mod, ast.Pow, ast.USub, ast.UAdd, ast.And, ast.Or, ast.Not, ast.Eq,
               ast.NotEq, ast.Lt, ast.LtE, ast.Gt, ast.GtE)
    for node in ast.walk(tree):
        if not isinstance(node, allowed):
            raise ValueError(f'Unsupported syntax: {type(node).__name__}')
        if isinstance(node, ast.Name) and node.id not in {'attempt', 'base', 'cap', 'min', 'max', 'ValueError'}:
            raise ValueError('Only arithmetic parameters and allowed builtins may be referenced')
        if isinstance(node, ast.Call) and (not isinstance(node.func, ast.Name) or node.func.id not in {'min', 'max', 'ValueError'}):
            raise ValueError('Only min, max and ValueError calls are allowed')

class RepairRun:
    def __init__(self, mode, resume=None):
        runs = ROOT / '.runs'
        runs.mkdir(exist_ok=True)
        if resume:
            self.directory = Path(resume).resolve()
            if self.directory.parent != runs.resolve() or self.directory.is_symlink():
                raise ValueError('Resume must name a direct run directory inside this project .runs')
            self.state = json.loads((self.directory / 'state.json').read_text(encoding='utf8'))
            if self.state['mode'] != mode:
                raise ValueError('Resume mode must match the original run')
        else:
            self.directory = runs / (datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ-') + uuid4().hex[:8])
            self.directory.mkdir()
            shutil.copytree(ROOT / 'fixtures/backoff', self.directory / 'workspace')
            self.state = {'mode': mode, 'step': 0, 'status': 'running', 'verified_hash': None,
                          'rollback': None, 'messages': [], 'started_utc': datetime.now(timezone.utc).isoformat()}
        self.workspace = self.directory / 'workspace'
        if self.workspace.is_symlink() or (self.workspace / SOURCE).is_symlink():
            raise ValueError('Workspace and source cannot be symlinks')
        trusted = (ROOT / 'fixtures/backoff/test_case.py').read_bytes()
        if (self.workspace / 'test_case.py').read_bytes() != trusted:
            raise ValueError('Fixture verification contract was changed')
        self.save()

    def save(self):
        write_json(self.directory / 'state.json', self.state)

    def event(self, name, result, duration):
        record = {'time_utc': datetime.now(timezone.utc).isoformat(), 'step': self.state['step'],
                  'name': name, 'duration_seconds': round(duration, 4), 'result': result}
        with (self.directory / 'events.jsonl').open('a', encoding='utf8') as stream:
            stream.write(json.dumps(record) + '\n')
        self.save()

    @neatlogs.span(kind='TOOL', tool_name='run_fixture_tests', capture_input=False)
    def tests(self):
        # Only this fresh, trusted arithmetic fixture is executable. No arbitrary repo commands.
        environment = {name: value for name, value in os.environ.items() if name not in CONFIG_KEYS}
        options = {'creationflags': subprocess.CREATE_NO_WINDOW} if os.name == 'nt' else {}
        try:
            process = subprocess.run([sys.executable, 'test_case.py'], cwd=self.workspace,
                                     env=environment, capture_output=True, timeout=10, **options)
            return {'exit_code': process.returncode, 'stdout': process.stdout.decode('utf8', errors='replace'),
                    'stderr': process.stderr.decode('utf8', errors='replace')}
        except subprocess.TimeoutExpired:
            return {'exit_code': 124, 'stdout': '', 'stderr': 'Fixed fixture test exceeded its 10-second limit'}

    @neatlogs.span(kind='TOOL', tool_name='repair_action', capture_input=False)
    def action(self, name, arguments):
        if not isinstance(arguments, dict):
            raise ValueError('Tool arguments must be a JSON object')
        source = self.workspace / SOURCE
        if name == 'inspect':
            if arguments:
                raise ValueError('inspect takes no arguments')
            return {'source': source.read_text(encoding='utf8'),
                    'tests': (self.workspace / 'test_case.py').read_text(encoding='utf8')}
        if name == 'replace_source':
            if set(arguments) != {'path', 'content', 'reason'} or arguments['path'] != SOURCE:
                raise ValueError('Only backoff.py can be replaced; path, content and reason are required')
            if not isinstance(arguments['reason'], str) or len(arguments['reason']) > 2000:
                raise ValueError('Provide a short repair reason')
            validate_source(arguments['content'])
            if self.state['rollback'] is None:
                self.state['rollback'] = source.read_text(encoding='utf8')
            temporary = source.with_suffix('.tmp')
            temporary.write_text(arguments['content'], encoding='utf8')
            os.replace(temporary, source)
            self.state['verified_hash'] = None
            return {'applied': True, 'sha256': digest(arguments['content']), 'reason': arguments['reason']}
        if name == 'verify':
            if arguments:
                raise ValueError('verify takes no arguments')
            result = self.tests()
            if result['exit_code'] == 0:
                self.state['verified_hash'] = digest(source.read_text(encoding='utf8'))
                self.state['rollback'] = None
            elif self.state['rollback'] is not None:
                source.write_text(self.state['rollback'], encoding='utf8')
                self.state['rollback'] = None
                self.state['verified_hash'] = None
                result['reverted_failed_candidate'] = True
            return result
        if name == 'finish':
            if set(arguments) != {'summary'} or not isinstance(arguments['summary'], str):
                raise ValueError('finish requires a string summary')
            if self.state['verified_hash'] != digest(source.read_text(encoding='utf8')):
                raise ValueError('A passing verification of the current source is required before finish')
            self.state['status'] = 'verified'
            self.state['summary'] = arguments['summary'][:2000]
            return {'status': 'verified', 'summary': self.state['summary']}
        raise ValueError('Unknown tool')

    def execute(self, name, arguments):
        started = time.monotonic()
        try:
            result = self.action(name, arguments)
        except (ValueError, SyntaxError) as error:
            result = {'error': str(error)}
        self.event(name, result, time.monotonic() - started)
        return result

    def choose_agy(self):
        """Use the existing signed-in CLI only as a structured model endpoint."""
        executable = shutil.which('agy') or str(Path.home() / 'AppData/Local/agy/bin/agy.exe')
        if not Path(executable).is_file():
            raise ValueError('Antigravity CLI is not installed or on PATH')
        provider = self.directory / 'provider'
        provider.mkdir(exist_ok=True)
        schema = {'type': 'object', 'properties': {'name': {'type': 'string', 'enum': [t['function']['name'] for t in TOOLS]},
                  'arguments': {'type': 'object'}}, 'required': ['name', 'arguments'], 'additionalProperties': False}
        schema_path = provider / 'schema.json'
        write_json(schema_path, schema)
        prompt = json.dumps({'instruction': 'Choose exactly one next repair action from the supplied conversation and tool schemas. Use no built-in tools, files, shell, web, subagents or questions. All needed context is supplied. Return only the structured next action; the application executes it and returns its observation.',
                             'conversation': self.state['messages'], 'available_actions': TOOLS})
        message = json.dumps({'event': 'user', 'message': {'content': prompt}}) + '\n'
        model = os.getenv('AGY_MODEL', 'gemini-3.1-pro-high')
        command = [executable, '--model', model, '--input-format', 'stream-json', '--output-format', 'stream-json',
                   '--json-schema', str(schema_path), '--disable-slash-commands', '--print-timeout', '90s']
        options = {'creationflags': subprocess.CREATE_NO_WINDOW} if os.name == 'nt' else {}
        with neatlogs.trace('choose-repair-action', kind='LLM') as span:
            span.set_attribute('llm.model_name', model)
            process = subprocess.run(command, input=message, text=True, encoding='utf8', capture_output=True,
                                     cwd=provider, timeout=105, **options)
            (provider / f'decision-{self.state["step"]}.ndjson').write_text(process.stdout, encoding='utf8')
            (provider / f'decision-{self.state["step"]}.stderr').write_text(process.stderr, encoding='utf8')
            events = [json.loads(line) for line in process.stdout.splitlines() if line.strip()]
            results = [e['result'] for e in events if e.get('event') == 'result']
            if process.returncode or len(results) != 1 or results[0].get('status') != 'SUCCESS':
                raise ValueError('CLI inference did not succeed; no repair action was executed')
            result = results[0]
            action = result.get('structured_output') or json.loads(result['response'])
            if set(action) != {'name', 'arguments'} or not isinstance(action['name'], str) or not isinstance(action['arguments'], dict):
                raise ValueError('CLI returned an invalid repair action')
            # The CLI sometimes emits its schema-only finish operation. Accept only
            # an exact match to final structured output; all environment tools fail closed.
            for event in events:
                step = event.get('step_update', {})
                if step.get('step_type') == 'tool' and not (
                        step.get('tool_name') == 'finish' and step.get('tool_info', {}).get('parameters') == action):
                    raise ValueError('CLI attempted an environment tool: ' + str(step.get('tool_name')))
            usage = result.get('usage') or {}
            for field, attr in [('input_tokens', 'llm.token_count.prompt'), ('output_tokens', 'llm.token_count.completion'), ('total_tokens', 'llm.token_count.total')]:
                if isinstance(usage.get(field), int):
                    span.set_attribute(attr, usage[field])
            span.set_attribute('input.value', prompt)
            span.set_attribute('output.value', json.dumps(action))
            self.event('model_decision', {'provider': 'Antigravity', 'model': model, 'action': action,
                       'usage': usage, 'duration_seconds': result.get('duration_seconds'), 'cost': 'not reported'}, 0)
            return action

    @neatlogs.span(kind='WORKFLOW', name='ci-repair', capture_input=False, capture_output=False)
    def run(self, max_steps=12):
        if self.state['status'] == 'verified':
            return self.state
        if not self.state['messages']:
            baseline = self.tests()
            self.event('baseline', baseline, 0)
            self.state['baseline'] = baseline
            self.state['messages'] = [
                {'role': 'system', 'content': 'Repair a trusted local retry-delay fixture. Inspect source and tests, replace only backoff.py, verify the result, recover from rejected edits or failing tests, then finish. Tests are immutable. Source allows only retry_delay(attempt, base=1, cap=30), arithmetic, if/return/raise, min/max/ValueError; no imports, attributes, assignments or loops. Verify rejects and rolls back failed candidates. Do not claim success without passing tests.'},
                {'role': 'user', 'content': 'Fix the failing retry-delay checks. Baseline: ' + json.dumps(baseline)}]
        if self.state['mode'] == 'replay':
            # A deterministic development check, explicitly not an LLM evaluation or AI demo.
            sequence = [('inspect', {}),
                        ('replace_source', {'path': '../test_case.py', 'content': CORRECT_SOURCE, 'reason': 'Exercise rejected path recovery'}),
                        ('replace_source', {'path': SOURCE, 'content': 'def retry_delay(attempt, base=1, cap=30):\n    return min(base * 2 ** attempt, cap)\n', 'reason': 'Exercise a semantically incomplete candidate'}),
                        ('verify', {}),
                        ('replace_source', {'path': SOURCE, 'content': CORRECT_SOURCE, 'reason': 'Enforce positive parameters and cap exponential delays'}),
                        ('verify', {}), ('finish', {'summary': 'Verified bounded exponential retry delays and invalid-input errors.'})]
            for name, args in sequence[self.state['step']:max_steps]:
                self.state['step'] += 1
                self.execute(name, args)
                if self.state['status'] == 'verified':
                    break
        elif self.state['mode'] == 'agy':
            while self.state['step'] < max_steps and self.state['status'] != 'verified':
                action = self.choose_agy()
                self.state['step'] += 1
                result = self.execute(action['name'], action['arguments'])
                self.state['messages'].append({'role': 'assistant', 'content': json.dumps(action)})
                self.state['messages'].append({'role': 'user', 'content': 'Action observation: ' + json.dumps(result)})
                self.save()
        else:
            from openai import OpenAI
            client = neatlogs.wrap(OpenAI(api_key=os.environ['LITELLM_API_KEY'],
                base_url=os.getenv('MODEL_BASE_URL', 'https://litellm.vision.aivar.app/v1'), max_retries=0, timeout=60))
            while self.state['step'] < max_steps and self.state['status'] != 'verified':
                response = client.chat.completions.create(model=os.getenv('MODEL_NAME', 'claude-haiku'),
                    messages=self.state['messages'], tools=TOOLS, parallel_tool_calls=False, max_tokens=2000)
                message = response.choices[0].message
                self.state['messages'].append(message.model_dump(exclude_none=True))
                self.state['step'] += 1
                calls = message.tool_calls or []
                if not calls:
                    self.state['messages'].append({'role': 'user', 'content': 'Use the tools. A passing verify and finish are required.'})
                for call in calls:
                    try:
                        args = json.loads(call.function.arguments)
                        result = self.execute(call.function.name, args)
                    except json.JSONDecodeError:
                        result = {'error': 'Tool arguments were not valid JSON'}
                        self.event('invalid_tool_arguments', result, 0)
                    self.state['messages'].append({'role': 'tool', 'tool_call_id': call.id, 'content': json.dumps(result)})
                self.save()
        if self.state['status'] != 'verified':
            self.state['status'] = 'step_limit'
        self.save()
        self.report()
        return self.state

    def report(self):
        events = [json.loads(line) for line in (self.directory / 'events.jsonl').read_text(encoding='utf8').splitlines()]
        before = self.state['baseline']['stdout'].strip().replace('\r\n', '\n')
        verifications = [event['result'] for event in events if event['name'] == 'verify']
        after = verifications[-1]['stdout'].strip().replace('\r\n', '\n') if verifications else 'Not verified'
        content = f'# CI recovery run\n\nMode: **{self.state["mode"]}**. Status: **{self.state["status"]}**.\n\n'
        if self.state['mode'] == 'replay':
            content += 'Scripted development replay; no live model inference.\n\n'
        content += f'## Before\n\n```text\n{before}\n```\n\n## After\n\n```text\n{after}\n```\n\n'
        content += f'Steps: {self.state["step"]}. Tool errors: {sum("error" in e["result"] for e in events)}. Failed candidates reverted: {sum(bool(e["result"].get("reverted_failed_candidate")) for e in events)}.\n\n'
        content += 'Evidence: state.json and events.jsonl. Only the trusted arithmetic fixture was edited and executed.\n'
        (self.directory / 'report.md').write_text(content, encoding='utf8', newline='\n')

def tool(name, description, properties):
    return {'type': 'function', 'function': {'name': name, 'description': description,
        'parameters': {'type': 'object', 'properties': properties, 'required': list(properties), 'additionalProperties': False}}}

TOOLS = [tool('inspect', 'Read source and immutable tests', {}),
         tool('replace_source', 'Replace the arithmetic fixture source', {name: {'type': 'string'} for name in ['path', 'content', 'reason']}),
         tool('verify', 'Run fixed tests; failing candidates are rolled back', {}),
         tool('finish', 'Finish only after current source passes verification', {'summary': {'type': 'string'}})]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--mode', choices=['replay', 'live', 'agy'], default='replay')
    parser.add_argument('--resume', type=Path)
    parser.add_argument('--max-steps', type=int, default=12)
    args = parser.parse_args()
    if not 1 <= args.max_steps <= 20:
        parser.error('max-steps must be between 1 and 20')
    load_config()
    if args.mode == 'live' and not os.getenv('LITELLM_API_KEY'):
        parser.error('Live mode needs a private LITELLM_API_KEY; configure locally, not in chat')
    neatlogs.init(workflow_name='neathack-ci-repair', tags=['neatHack', args.mode])
    run = None
    try:
        run = RepairRun(args.mode, args.resume)
        state = run.run(args.max_steps)
        print(json.dumps({'mode': args.mode, 'status': state['status'], 'steps': state['step'],
                          'report': str(run.directory / 'report.md'), 'neatlogs_export_configured': bool(os.getenv('NEATLOGS_API_KEY'))}, indent=2))
        return 0 if state['status'] == 'verified' else 1
    except Exception as error:
        if run is not None:
            run.state['status'] = 'error'
            run.state['error_type'] = type(error).__name__
            run.save()
            if 'baseline' in run.state:
                run.report()
        print('Run stopped: ' + type(error).__name__ + '. Inspect private run evidence before resuming.', file=sys.stderr)
        return 1
    finally:
        neatlogs.flush()
        neatlogs.shutdown()

if __name__ == '__main__':
    raise SystemExit(main())
