"""Trusted, immutable synthetic pagination contract: no framework needed."""
from pagination import next_offset

cases = [
    ((0,), {}, 100),
    ((950,), {}, 1000),
    ((1000,), {}, None),
    ((1001,), {}, None),
    ((0,), {'total': 7}, 7),
    ((0, 10), {}, 10),
    ((0, 10, 0), {}, None),
    ((0, 1, 1), {}, 1),
    ((1, 1, 1), {}, None),
    ((1, 10, 12), {}, 11),
    ((11, 10, 12), {}, 12),
    ((11, 1, 12), {}, 12),
    ((12, 1, 12), {}, None),
    ((0, 1000, 1000), {}, 1000),
    ((0, 1001, 1000), {}, 1000),
    ((0, 100, 99), {}, 99),
]
invalid = [((-1,), {}), ((0, 0), {}), ((0, -1), {}),
           ((0, 1, -1), {}), ((-1, 0, -1), {}), ((2, 0, 1), {})]
failures = []
for args, kwargs, expected in cases:
    try:
        actual = next_offset(*args, **kwargs)
        assert actual == expected, f'expected {expected}, got {actual}'
    except Exception as error:
        failures.append(f'next_offset{args} {kwargs}: {type(error).__name__}: {error}')
for args, kwargs in invalid:
    try:
        next_offset(*args, **kwargs)
    except ValueError:
        pass
    except Exception as error:
        failures.append(f'next_offset{args} {kwargs}: expected ValueError, got {type(error).__name__}')
    else:
        failures.append(f'next_offset{args} {kwargs}: expected ValueError')
for failure in failures:
    print('FAIL ' + failure)
count = len(cases) + len(invalid)
print(f'{count - len(failures)}/{count} fixture checks passed')
raise SystemExit(bool(failures))
