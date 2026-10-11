# Verified three-case evaluation — October 11

Real Claude Opus 5.5 High inference via the existing signed-in Antigravity CLI. These are synthetic policy tasks, not production CI repairs.

| Case | Before | After | Decisions | Rollbacks | Checkpoint resumed |
|---|---|---|---|---|---|
| backoff | 4/13 | 13/13 | 6 | 1 | True |
| pagination | 6/22 | 22/22 | 6 | 1 | True |
| budget | 7/22 | 22/22 | 6 | 1 | True |

Combined: **17/57 → 57/57** unchanged checks. Each final repair was independently rechecked in a fresh subprocess.

Each rollback above follows a controlled worker outage (exit 75), not a model-authored semantic defect. Checkpoint resume loads a new instance; it does not claim a real process crash. The separate regression checks inject an interrupted mutation and verify restoration.

The first three-case Gemini attempt failed with empty partial provider outputs; every result is retained in evaluation-initial-attempt.json. A subsequent verified backoff/pagination run used the original 12-check backoff contract; negative-cap coverage was then added and backoff rerun against 13 checks. All earlier receipts remain available.

Current raw events, candidate source, test/source hashes and observed token usage: [evaluation.json](evaluation.json). Monetary provider cost was not reported. Remote neatlogs dashboard export and actual cfo.ai output remain pending. No contest submission is claimed.
