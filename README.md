# neatHack CI recovery agent

A fresh October 10, 2026 hackathon project: reproduce a failing retry-delay test,
inspect the source, propose a repair, recover from unsuccessful actions, and
finish only after the unchanged tests pass. The first milestone is a small,
verifiable repair loop. Broader CI issue repair is future scope.

## Run the current milestone

For a fresh clone, Python 3.10–3.13 is required:

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements-lock.txt
```

From this repository in PowerShell:

```powershell
.venv/Scripts/python.exe check.py
.venv/Scripts/python.exe agent.py --mode replay
```

Replay is a **scripted development check**, not live AI inference. It exercises
a rejected path, an incomplete repair, rollback, and a verified repair. Each run
retains `state.json`, `events.jsonl`, a working copy, and `report.md` under `.runs/`.
Resume a bounded/interrupted run with `--resume PATH --mode replay` (or its original
live mode). The original fixture and its tests remain unchanged.

## Live model and partner tracing

Use the event's [model access page](https://neatlogs.com/hackathon/models) after
registration and web check-in. Copy `config.example.json` to the Git-ignored
`config.private.json`, then put your keys in that private file. Environment
variables take precedence. The app does not load `.env` files.

- `LITELLM_API_KEY`: private hackathon key; base URL is already configured.
- `NEATLOGS_API_KEY`: your neatlogs project key.
- `MODEL_NAME`: defaults to `claude-haiku`; change to an event-supported model if needed.
- `MODEL_BASE_URL`: defaults to the organizer's OpenAI-compatible gateway.

```powershell
.venv/Scripts/python.exe -m neatlogs doctor --local --json
.venv/Scripts/python.exe -m neatlogs doctor --probe --json
.venv/Scripts/python.exe agent.py --mode live
```

If you already have the Antigravity CLI installed and signed in, real inference
can also run without waiting for the event key:

```powershell
.venv/Scripts/python.exe agent.py --mode agy
```

This uses the signed-in CLI as a structured inference endpoint, with captured
token usage and no built-in tool execution or permission bypass. The application
executes and verifies each returned action. Defaults to `gemini-3.1-pro-high`;
`AGY_MODEL` can select another installed model. CLI cost is not reported.

Live mode uses actual model tool calls and the wrapped OpenAI client. Neatlogs
spans cover the workflow, tools, verification, and provider calls. Without a
neatlogs key, SDK spans are created locally but **no dashboard export is proven**.
The fixed synthetic fixture is the only code sent to the model or telemetry.
Keys, `.runs/`, and tools are excluded from Git. Save a sanitized dashboard trace
link/screenshot after a real run; configuration alone is not partner evidence.

## Entire

The local official CLI is `.tools/entire.exe`; its downloaded archive was checked
against the release checksum. Setup/evidence details are recorded in `hackathon.md`.
Use Entire Graph to inspect relationships and change impact during development.
Do not claim a checkpoint or graph result until the command actually succeeds.

## Current boundaries

- The editable source is one arithmetic function. AST validation disallows imports,
  attributes, arbitrary calls, loops and test edits. This is **not an OS sandbox**
  for executing arbitrary repositories; general repair requires a sandbox first.
- The model loop is capped at 12 decisions by default (hard maximum 20); tests have
  a 10-second timeout. A fixture report measures this fixture only.
- Registration, live model access, dashboard trace readback, cfo.ai business plan,
  public repository, build-in-public posts and demo video are pending.

See [hackathon.md](hackathon.md) for the build log and submission checklist.


## Verified first milestone — October 10

A real Gemini 3.1 Pro High run finished in four decisions, improving the unchanged
synthetic fixture from 4/12 to 12/12 checks. See [report](evidence/first-model-run.md)
and [receipt](evidence/first-model-run.json). The runnable regression check and
Neatlogs Doctor local diagnostic passed. Entire Graph search output is retained
under evidence/. Live neatlogs dashboard export and cfo.ai usage are pending.
