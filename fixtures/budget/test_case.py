"""Trusted, immutable synthetic budget contract: no framework needed."""
from budget import available_budget

cases = [
    ((100,), {}, 100),
    ((100, 25), {}, 75),
    ((100, 25, 10), {}, 65),
    ((100, 0, 100), {}, 0),
    ((100, 100, 0), {}, 0),
    ((100, 101, 0), {}, 0),
    ((100, 50, 51), {}, 0),
    ((0,), {}, 0),
    ((0, 0, 0), {}, 0),
    ((1, 0, 0), {}, 1),
    ((1, 0, 1), {}, 0),
    ((1, 1, 0), {}, 0),
    ((10, 3, 2), {}, 5),
    ((10,), {'reserved': 4}, 6),
    ((10,), {'spent': 3, 'reserved': 2}, 5),
    ((1000000, 123456, 123456), {}, 753088),
]
invalid = [((-1,), {}), ((0, -1), {}), ((0, 0, -1), {}),
           ((-1, -1, -1), {}), ((1, 2, -1), {}), ((1, -1, 2), {})]
failures = []
for args, kwargs, expected in cases:
    try:
        actual = available_budget(*args, **kwargs)
        assert actual == expected, f'expected {expected}, got {actual}'
    except Exception as error:
        failures.append(f'available_budget{args} {kwargs}: {type(error).__name__}: {error}')
for args, kwargs in invalid:
    try:
        available_budget(*args, **kwargs)
    except ValueError:
        pass
    except Exception as error:
        failures.append(f'available_budget{args} {kwargs}: expected ValueError, got {type(error).__name__}')
    else:
        failures.append(f'available_budget{args} {kwargs}: expected ValueError')
for failure in failures:
    print('FAIL ' + failure)
count = len(cases) + len(invalid)
print(f'{count - len(failures)}/{count} fixture checks passed')
raise SystemExit(bool(failures))
