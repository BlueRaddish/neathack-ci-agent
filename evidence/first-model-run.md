# CI recovery run

Mode: **agy**. Status: **verified**.

## Before

```text
FAIL retry_delay(5, 1, 30): expected 30, got 32
FAIL retry_delay(10, 1, 30): expected 30, got 1024
FAIL retry_delay(5, 2, 30): expected 30, got 64
FAIL retry_delay(2, 1, 3): expected 3, got 4
FAIL retry_delay(-1, 1, 30): expected ValueError
FAIL retry_delay(0, 0, 30): expected ValueError
FAIL retry_delay(0, 1, 0): expected ValueError
FAIL retry_delay(0, -1, 30): expected ValueError
4/12 fixture checks passed
```

## After

```text
12/12 fixture checks passed
```

Steps: 4. Tool errors: 0. Failed candidates reverted: 0.

Evidence: state.json and events.jsonl. Only the trusted arithmetic fixture was edited and executed.
