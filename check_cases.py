"""Case isolation and evaluation recovery checks; Python assertions only."""
import json
from pathlib import Path
import tempfile
from unittest.mock import patch

import agent
from evaluate import RecoveryRun, summarize

agent.neatlogs.init(workflow_name='proofpatch-case-check')
try:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        agent.shutil.copytree(agent.ROOT / 'fixtures', root / 'fixtures')
        with patch.object(agent, 'ROOT', root):
            for case in agent.CASES:
                run = agent.RepairRun('replay', case=case)
                trusted = run.trusted_tests
                assert run.tests()['exit_code'] == 1
                assert run.run(4)['status'] == 'step_limit'
                restored = agent.RepairRun('replay', resume=run.directory)
                assert restored.state['case'] == case
                assert restored.run(12)['status'] == 'verified'
                assert restored.tests()['exit_code'] == 0
                assert (restored.workspace / 'test_case.py').read_bytes() == trusted
                try:
                    agent.RepairRun('replay', resume=run.directory, case=next(c for c in agent.CASES if c != case))
                except ValueError:
                    pass
                else:
                    raise AssertionError('Cross-case resume must fail')
                recovery = RecoveryRun('replay', case=case)
                recovery.state['baseline'] = recovery.tests()
                recovery.state['inject_worker_failure'] = True
                recovery.execute('replace_source', {'path': recovery.source, 'content': agent.REFERENCE_SOURCES[case], 'reason': 'Exercise controlled worker outage'})
                result = recovery.execute('verify', {})
                assert result['exit_code'] == 75 and result['reverted_failed_candidate']
                assert recovery.state['worker_failure_injected'] and recovery.tests()['exit_code'] == 1
                recovery.execute('replace_source', {'path': recovery.source, 'content': agent.REFERENCE_SOURCES[case], 'reason': 'Recover after worker outage'})
                assert recovery.execute('verify', {})['exit_code'] == 0
                assert recovery.execute('finish', {'summary': 'Verified recovery'})['status'] == 'verified'
                receipt = summarize(recovery, 0, False)
                assert receipt['controlled_worker_fault'] and receipt['rollbacks'] == 1
                assert receipt['test_sha256'] == recovery.state['test_sha256']
                json.dumps(receipt)
            # Provider timeouts consume no action and cannot create a false finish.
            retry_run = agent.RepairRun('agy', case='backoff')
            actions = [TimeoutError('Controlled provider timeout'),
                       {'name': 'inspect', 'arguments': {}},
                       {'name': 'replace_source', 'arguments': {'path': retry_run.source, 'content': agent.CORRECT_SOURCE, 'reason': 'Recover after provider timeout'}},
                       {'name': 'verify', 'arguments': {}},
                       {'name': 'finish', 'arguments': {'summary': 'Verified bounded retry'}}]
            with patch.object(retry_run, 'choose_agy', side_effect=actions):
                assert retry_run.run(8)['status'] == 'verified'
            assert retry_run.state['step'] == 4 and retry_run.state['provider_timeouts'] == 1
            exhausted = agent.RepairRun('agy')
            with patch.object(exhausted, 'choose_agy', side_effect=TimeoutError('Controlled repeated outage')):
                try:
                    exhausted.run(8)
                except TimeoutError:
                    pass
                else:
                    raise AssertionError('Provider retry ceiling must stop the run')
            assert exhausted.state['provider_timeouts'] == 3 and exhausted.state['step'] == 0
            assert exhausted.state['status'] != 'verified'
    print('PASS: all three case contracts, baseline failure, immutable tests, case-preserving resume, cross-case rejection, one-shot worker-failure rollback and verified recovery')
finally:
    agent.neatlogs.flush()
    agent.neatlogs.shutdown()
