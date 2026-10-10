"""Trusted, immutable fixture contract: no framework needed."""
from backoff import retry_delay

cases = [(0, 1, 30, 1), (1, 1, 30, 2), (5, 1, 30, 30), (10, 1, 30, 30),
         (0, 2, 30, 2), (3, 2, 30, 16), (5, 2, 30, 30), (2, 1, 3, 3)]
failures = []
for attempt, base, cap, expected in cases:
    actual = retry_delay(attempt, base, cap)
    if actual != expected:
        failures.append(f'retry_delay({attempt}, {base}, {cap}): expected {expected}, got {actual}')
for args in [(-1, 1, 30), (0, 0, 30), (0, 1, 0), (0, -1, 30)]:
    try:
        retry_delay(*args)
    except ValueError:
        pass
    else:
        failures.append(f'retry_delay{args}: expected ValueError')
for failure in failures:
    print('FAIL ' + failure)
print(f'{12 - len(failures)}/12 fixture checks passed')
raise SystemExit(bool(failures))
