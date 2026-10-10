"""Runnable assertions: recovery, rollback, immutable tests, resume and AST boundary."""
import json
from pathlib import Path
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
                           'def retry_delay(attempt, base=1, cap=30):\n    while True:\n        pass\n']:
                rejected(lambda source=source: agent.validate_source(source))
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
finally:
    agent.neatlogs.flush()
    agent.neatlogs.shutdown()
