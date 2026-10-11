"""Runnable assertions: recovery, rollback, immutable tests, resume and AST boundary."""
import json
import os
from pathlib import Path
import py_compile
import tempfile
from types import SimpleNamespace
from unittest.mock import patch

import agent

def rejected(callback):
    try:
        callback()
    except (ValueError, SyntaxError):
        return
    raise AssertionError('Expected trust-boundary rejection')

agent.neatlogs.init(workflow_name='neathack-offline-check')
try:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        (root / 'fixtures').mkdir()
        agent.shutil.copytree(agent.ROOT / 'fixtures/backoff', root / 'fixtures/backoff')
        with patch.object(agent, 'ROOT', root):
            run = agent.RepairRun('replay')
            baseline_source = (run.workspace / agent.SOURCE).read_text()
            immutable = (run.workspace / 'test_case.py').read_bytes()
            assert run.tests()['exit_code'] == 1
            rejected(lambda: run.action('finish', {'summary': 'False success'}))
            rejected(lambda: run.action('replace_source', {'path': '../test_case.py', 'content': agent.CORRECT_SOURCE, 'reason': 'Escape'}))
            for source in ['import os\n' + agent.CORRECT_SOURCE,
                           'def retry_delay(attempt, base=1, cap=30):\n    return __import__("os").system("whoami")\n',
                           'def retry_delay(attempt, base=1, cap=30):\n    while True:\n        pass\n',
                           agent.CORRECT_SOURCE.replace('base=1, cap=30', 'base=42, cap=17'),
                           agent.CORRECT_SOURCE.replace('cap=30)', 'cap=30, *, extra=1)'),
                           agent.CORRECT_SOURCE.replace('attempt, base=1', 'extra, /, attempt, base=1'),
                           agent.CORRECT_SOURCE.replace('attempt, base=1', 'attempt: min(1, 2), base=1')]:
                rejected(lambda source=source: agent.validate_source(source))
            contract = {'source': 'budget.py', 'function': 'remaining', 'parameters': ['limit', 'spent'], 'defaults': [0]}
            agent.validate_source('def remaining(limit, spent=0):\n    return max(limit - spent, 0)\n', contract)
            rejected(lambda: agent.validate_source('def remaining(limit, spent=1):\n    return max(limit - spent, 0)\n', contract))
            run.action('replace_source', {'path': agent.SOURCE, 'content': 'def retry_delay(attempt, base=1, cap=30):\n    return 0\n', 'reason': 'Failing candidate'})
            result = run.action('verify', {})
            assert result['exit_code'] == 1 and result['reverted_failed_candidate']
            assert (run.workspace / agent.SOURCE).read_text() == baseline_source
            assert (run.workspace / 'test_case.py').read_bytes() == immutable
            state = run.run(4)
            assert state['status'] == 'step_limit'
            restored = agent.RepairRun('replay', run.directory)
            assert restored.run(12)['status'] == 'verified'
            assert restored.tests()['exit_code'] == 0
            assert b'\r' not in (restored.directory / 'report.md').read_bytes()
            assert (run.workspace / 'test_case.py').read_bytes() == immutable
            events = [json.loads(line) for line in (run.directory / 'events.jsonl').read_text().splitlines()]
            assert any('error' in event['result'] for event in events)
            assert any(event['result'].get('reverted_failed_candidate') for event in events)
            rejected(lambda: agent.RepairRun('replay', root.parent))

            # Seed a valid timestamp/size bytecode cache, then change only min to max.
            # Fresh verification must execute the new source even though import would use stale bytecode.
            cached = agent.RepairRun('replay')
            source_path = cached.workspace / agent.SOURCE
            cached.action('replace_source', {'path': agent.SOURCE, 'content': agent.CORRECT_SOURCE, 'reason': 'Passing cache'})
            assert cached.action('verify', {})['exit_code'] == 0
            py_compile.compile(str(source_path), doraise=True)
            stamp = source_path.stat()
            bad = agent.CORRECT_SOURCE.replace('min(base * 2 ** attempt, cap)', 'max(base * 2 ** attempt, cap)')
            cached.action('replace_source', {'path': agent.SOURCE, 'content': bad, 'reason': 'Same-size changed source'})
            os.utime(source_path, (stamp.st_atime, stamp.st_mtime))
            result = cached.action('verify', {})
            assert result['exit_code'] == 1 and result['reverted_failed_candidate']
            assert source_path.read_text() == agent.CORRECT_SOURCE

            # A negative-cap semantic mutant previously passed the visible suite.
            cached.action('replace_source', {'path': agent.SOURCE,
                'content': agent.CORRECT_SOURCE.replace('cap <= 0', 'cap == 0'), 'reason': 'Negative-cap mutant'})
            result = cached.action('verify', {})
            assert result['exit_code'] == 1 and result['reverted_failed_candidate']
            assert 'retry_delay(0, 1, -1)' in result['stdout']

            drift = agent.RepairRun('replay')
            assert drift.run(12)['status'] == 'verified'
            (drift.workspace / agent.SOURCE).write_text('def retry_delay(attempt, base=1, cap=30):\n    return 0\n')
            resumed = agent.RepairRun('replay', drift.directory)
            assert resumed.run(12)['status'] != 'verified'
            assert resumed.state['verified_hash'] is None and resumed.tests()['exit_code'] == 1
            assert 'No current verified completion' in (resumed.directory / 'report.md').read_text()

            guarded = agent.RepairRun('replay')
            guarded_source = guarded.workspace / agent.SOURCE
            guarded_tests = guarded.workspace / 'test_case.py'
            with patch.object(agent.subprocess, 'run') as subprocess_run:
                guarded_tests.write_text('raise SystemExit(0)\n')
                rejected(guarded.tests)
                rejected(lambda: guarded.action('finish', {'summary': 'Changed tests'}))
                guarded_tests.write_bytes(immutable)
                guarded_source.write_text('import os\n' + agent.CORRECT_SOURCE)
                rejected(guarded.tests)
                subprocess_run.assert_not_called()

            interrupted = agent.RepairRun('agy')
            source_before = (interrupted.workspace / agent.SOURCE).read_text()
            with patch.object(interrupted, 'event', side_effect=KeyboardInterrupt):
                try:
                    interrupted.execute('replace_source', {'path': agent.SOURCE, 'content': agent.CORRECT_SOURCE, 'reason': 'Interrupted mutation'})
                except KeyboardInterrupt:
                    pass
                else:
                    raise AssertionError('Expected an injected interruption')
            assert (interrupted.workspace / agent.SOURCE).read_text() == agent.CORRECT_SOURCE
            assert 'pending_action' in json.loads((interrupted.directory / 'state.json').read_text())
            recovered = agent.RepairRun('agy', interrupted.directory)
            assert (recovered.workspace / agent.SOURCE).read_text() == source_before
            assert recovered.state['rollback'] is None and 'pending_action' not in recovered.state
            assert recovered.state['messages'][-1]['role'] == 'user'
            assert json.loads(recovered.state['messages'][-1]['content'].removeprefix('Action observation: '))['recovered_interruption']
            recovered.execute('inspect', {})
            committed = json.loads((recovered.directory / 'state.json').read_text())
            assert committed['messages'][-1]['role'] == 'user' and 'pending_action' not in committed

            interrupted_replay = agent.RepairRun('replay')
            assert interrupted_replay.run(2)['status'] == 'step_limit'
            with patch.object(interrupted_replay, 'event', side_effect=KeyboardInterrupt):
                try:
                    interrupted_replay.run(12)
                except KeyboardInterrupt:
                    pass
                else:
                    raise AssertionError('Expected an injected replay interruption')
            recovered_replay = agent.RepairRun('replay', interrupted_replay.directory)
            assert recovered_replay.run(12)['status'] == 'verified'

            interrupted_live = agent.RepairRun('live')
            interrupted_live.state['messages'] = [{'role': 'assistant', 'tool_calls': [{'id': 'interrupted-call',
                'type': 'function', 'function': {'name': 'inspect', 'arguments': '{}'}}]}]
            with patch.object(interrupted_live, 'event', side_effect=KeyboardInterrupt):
                try:
                    interrupted_live.execute('inspect', {}, 'interrupted-call')
                except KeyboardInterrupt:
                    pass
                else:
                    raise AssertionError('Expected an injected live interruption')
            recovered_live = agent.RepairRun('live', interrupted_live.directory)
            assert recovered_live.state['messages'][-1]['role'] == 'tool'
            assert recovered_live.state['messages'][-1]['tool_call_id'] == 'interrupted-call'

            action = {'name': 'inspect', 'arguments': {}}
            envelope = {'event': 'result', 'result': {'status': 'SUCCESS', 'structured_output': action}}
            finish_event = {'event': 'step_update', 'step_update': {'step_type': 'tool', 'tool_name': 'finish', 'tool_info': {'parameters': action}}}
            inference = SimpleNamespace(returncode=0, stdout=json.dumps(finish_event) + '\n' + json.dumps(envelope), stderr='')
            with patch.object(agent.shutil, 'which', lambda name: agent.sys.executable), patch.object(agent.subprocess, 'run', lambda *args, **kwargs: inference):
                assert restored.choose_agy() == action
                finish_event['step_update']['tool_name'] = 'run_command'
                inference.stdout = json.dumps(finish_event) + '\n' + json.dumps(envelope)
                rejected(restored.choose_agy)
                finish_event['step_update']['tool_name'] = 'finish'
                finish_event['step_update']['tool_info']['parameters'] = {'name': 'verify', 'arguments': {}}
                inference.stdout = json.dumps(finish_event) + '\n' + json.dumps(envelope)
                rejected(restored.choose_agy)

            # Real OpenAI client + mock HTTP transport exercises the provider contract,
            # tool-message round trips and SDK wrapper without network or account keys.
            import httpx
            import openai
            sequence = [('inspect', {}), ('replace_source', {'path': agent.SOURCE, 'content': agent.CORRECT_SOURCE, 'reason': 'Contract test'}),
                        ('verify', {}), ('finish', {'summary': 'Provider contract verified'})]
            requests = []
            def respond(request):
                payload = json.loads(request.content)
                name, arguments = sequence[len(requests)]
                requests.append(payload)
                return httpx.Response(200, json={'id': f'completion-{len(requests)}', 'object': 'chat.completion', 'created': 0,
                    'model': 'offline-contract', 'choices': [{'index': 0, 'finish_reason': 'tool_calls',
                    'message': {'role': 'assistant', 'content': None, 'tool_calls': [{'id': f'call-{len(requests)}', 'type': 'function',
                    'function': {'name': name, 'arguments': json.dumps(arguments)}}]}}]})
            client = openai.OpenAI(api_key='offline-contract-only', http_client=httpx.Client(transport=httpx.MockTransport(respond)))
            with patch.dict(agent.os.environ, {'LITELLM_API_KEY': 'offline-contract-only'}), patch.object(openai, 'OpenAI', lambda **kwargs: client):
                live = agent.RepairRun('live')
                assert live.run(8)['status'] == 'verified'
                assert len(requests) == 4 and any(message['role'] == 'tool' for message in requests[-1]['messages'])
            client.close()
    print('PASS: baseline failure, no false completion, path/AST guards, failed-candidate rollback, immutable tests, recovery and persisted resume')
    print('PASS: schema-only CLI finish accepted, environment tools/mismatched payload rejected, real SDK mock-HTTP tool-call contract')
    print('PASS: stale bytecode ignored, source drift invalidates completed runs, exact signatures, fresh trust checks, interrupted-action rollback and durable observations')
finally:
    agent.neatlogs.flush()
    agent.neatlogs.shutdown()
