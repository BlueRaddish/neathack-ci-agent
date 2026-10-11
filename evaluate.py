"""Small declared synthetic evaluation; never a production CI benchmark."""
import argparse
from datetime import datetime, timezone
import json
import hashlib
import os
from pathlib import Path
import time

import neatlogs

import agent


class RecoveryRun(agent.RepairRun):
    """A controlled worker outage tests the model's recovery, not its first patch."""
    def tests(self):
        if (self.state.get('inject_worker_failure') and self.state.get('rollback') is not None
                and not self.state.get('worker_failure_injected')):
            self.state['worker_failure_injected'] = True
            self.save()
            result = {'exit_code': 75, 'stdout': '',
                      'stderr': 'Controlled evaluation fault: CI worker unavailable. Retry with a fresh candidate.',
                      'injected_fault': 'one transient worker outage; not a model-proposed code defect'}
            self.event('injected_worker_failure', result, 0)
            return result
        return super().tests()


def summarize(run, elapsed, interrupted):
    events = [json.loads(line) for line in (run.directory / 'events.jsonl').read_text(encoding='utf8').splitlines()]
    verifications = [e['result'] for e in events if e['name'] == 'verify']
    decisions = [e['result'] for e in events if e['name'] == 'model_decision']
    usage = {}
    for decision in decisions:
        for key, value in decision.get('usage', {}).items():
            if isinstance(value, int):
                usage[key] = usage.get(key, 0) + value
    return {'case': run.state.get('case', 'backoff'), 'mode': run.state['mode'],
            'run_id': run.directory.name, 'status': run.state['status'],
            'steps': run.state['step'], 'elapsed_seconds': round(elapsed, 2),
            'baseline': run.state['baseline'], 'final_verification': verifications[-1] if verifications else None,
            'source_sha256': run.state['verified_hash'],
            'test_sha256': hashlib.sha256(run.trusted_tests).hexdigest(),
            'rollbacks': sum(bool(e['result'].get('reverted_failed_candidate')) for e in events),
            'tool_errors': sum('error' in e['result'] for e in events),
            'intentional_interruption': interrupted, 'controlled_worker_fault': bool(run.state.get('worker_failure_injected')),
            'model': decisions[-1].get('model') if decisions else None, 'usage': usage,
            'cost': 'Provider CLI did not report monetary cost',
            'events': events,
            'repaired_source': (run.workspace / run.source).read_text(encoding='utf8')}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--mode', choices=['replay', 'agy', 'live'], default='agy')
    parser.add_argument('--cases', nargs='+', choices=['backoff', 'pagination', 'budget'], default=['backoff', 'pagination', 'budget'])
    parser.add_argument('--worker-fault', action='store_true')
    parser.add_argument('--interrupt-after', type=int, default=0)
    parser.add_argument('--output', type=Path, default=agent.ROOT / 'evidence/evaluation.json')
    args = parser.parse_args()
    if not 0 <= args.interrupt_after < 12:
        parser.error('interrupt-after must be 0..11')
    agent.load_config()
    neatlogs.init(workflow_name='proofpatch-evaluation', tags=['neatHack', args.mode, 'declared-synthetic-evaluation'])
    receipt = {'time_utc': datetime.now(timezone.utc).isoformat(), 'scope': 'Fresh synthetic arithmetic policies; not a benchmark or arbitrary repository repair',
               'fault_label': 'Controlled transient CI worker outage' if args.worker_fault else None,
               'neatlogs_export_configured': bool(os.getenv('NEATLOGS_API_KEY')), 'results': []}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    try:
        for case in args.cases:
            run = RecoveryRun(args.mode, case=case)
            run.state['inject_worker_failure'] = args.worker_fault
            run.save()
            started = time.monotonic()
            interrupted = False
            try:
                run.run(args.interrupt_after or 12)
                if args.interrupt_after and run.state['status'] != 'verified':
                    interrupted = True
                    run.event('intentional_checkpoint_resume', {'checkpoint_step': run.state['step'],
                              'method': 'New RepairRun instance from persisted state; no fake process crash'}, 0)
                    run = RecoveryRun(args.mode, resume=run.directory, case=case)
                    run.run(12)
                # An independent fresh process rechecks the final exact source.
                independent = run.tests()
                if run.state['status'] == 'verified' and independent['exit_code'] != 0:
                    raise ValueError('Independent final verification disagrees with finished status')
                run.event('independent_final_verification', independent, 0)
                result = summarize(run, time.monotonic() - started, interrupted)
                result['independent_final_verification'] = independent
            except Exception as error:
                run.state['status'] = 'error'
                run.state['error_type'] = type(error).__name__
                run.save()
                result = {'case': case, 'status': 'error', 'run_id': run.directory.name,
                          'error_type': type(error).__name__, 'elapsed_seconds': round(time.monotonic() - started, 2),
                          'steps': run.state['step'], 'baseline': run.state.get('baseline'),
                          'test_sha256': run.state['test_sha256']}
                # Error details stay in the private run; public output retains the failed case.
            receipt['results'].append(result)
            agent.write_json(args.output, receipt)
            print(json.dumps({k: result.get(k) for k in ['case', 'status', 'steps', 'rollbacks', 'intentional_interruption', 'run_id']}), flush=True)
        return 0 if all(r['status'] == 'verified' for r in receipt['results']) else 1
    finally:
        neatlogs.flush()
        neatlogs.shutdown()


if __name__ == '__main__':
    raise SystemExit(main())
