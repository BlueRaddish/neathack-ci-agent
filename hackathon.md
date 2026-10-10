# neatHack build log

Project: CI recovery agent — inspect a failing trusted fixture, propose a repair,
handle failed actions, and retain independent before/after verification.

Team: solo development assumed; no name or handle chosen for publication.

Stack: Python 3.13, official neatlogs Python SDK with OpenAI integration, event
LiteLLM gateway configured, local Entire CLI. Live accounts and partner evidence
are pending until executed and verified.

## 2026-10-10 — fresh project setup

The user chose neatHack and clarified that “tsr” meant “this.” Code was created
fresh after the published kickoff, in a new local Git repository outside PARA.
No existing project code was brought into the event.

Implemented a bounded model/tool repair loop, scripted offline recovery check,
immutable test contract, path and arithmetic AST validation, failed-candidate
rollback, persistent run state, and a Markdown report. Executed results will be
appended below after verification. A scripted replay is not a live model result.

## Partner evidence checklist

- [ ] neatlogs: authenticated project, real exported before/after traces, readback/link
- [x] Entire: versioned Graph search used to inspect repair/rollback behavior; evidence/entire-graph-search.json
- [ ] cfo.ai: actual pricing/cost/revenue/runway plan generated in cfo.ai and exported
- [ ] Live model: event key acquired privately, real tool-calling repair run verified

## Submission

Checked [official rules](https://neatlogs.com/hackathon) and
[Luma](https://luma.com/s5blr882) October 10. Fresh event-period code is required;
all three partners must be used and explicitly shown in the demo. Published
window: October 12, 6:30–11:25 AM PDT, **planned close; final cutoff on Discord**.
This corrects treating the planned close as a fully confirmed final deadline.

- [ ] Luma registration and web check-in; confirm solo/team details
- [ ] Join/read official Discord and confirm final cutoff
- [ ] Evidence of before/after improvement and failure recovery
- [ ] Public repository with event-dated commits and supporting evidence
- [ ] Public build updates tagged #neatHack
- [ ] Demo video, at most three minutes, explicitly covering all three partners
- [ ] Public quote post attached to the official submission post on X during window
- [ ] Actual submission receipt retained

cfo.ai signup currently requires a card and instructs immediate cancellation of
the subscription; this step needs user participation. Preparing a local business
outline does not count as using cfo.ai. No registration, post or submission has
been made by this setup.

## Demo and next steps

Run the replay command in README to inspect local mechanics. Next: account setup,
live trace capture, independent additional repair cases and Entire evidence;
then the cfo.ai plan, demo and public submission package.


## 2026-10-10 — first verified model milestone

Actual Gemini 3.1 Pro High inference through the existing signed-in Antigravity
CLI completed inspect → replace_source → verify → finish in four decisions.
The unchanged fixture checks improved from 4/12 to 12/12. Evidence:
[model run](evidence/first-model-run.json), [report](evidence/first-model-run.md).
This is one synthetic fixture, not a benchmark or a production CI claim.

The runnable regression check passed path/AST boundaries, rollback, immutable
tests, persisted resume, schema-only output handling, and an actual OpenAI client
with mock HTTP tool-message round trips. Neatlogs Doctor v2 local/schema-2 passed;
it proves its local diagnostic capture, not dashboard export of the repair run.
SDK 1.4.26, CLI 0.11.4 and Graph 0.4.0 were used. Dependencies passed pip check.

Two initial CLI runs were stopped because the output guard incorrectly classified
the CLI's schema-only finish operation as an environment tool. The guard now
accepts only an exact payload match to terminal structured output and rejects
environment tools or mismatches; the regression check reproduces those cases.

The user authorized handling the setup while away. Browser inventory was empty;
official neatlogs CLI sign-in still requires browser approval, and cfo.ai MCP
requires an existing account/OAuth authorization. No account was created and no
card or subscription action was taken. Registration, credits, partner dashboard
traces and the actual cfo.ai plan remain outstanding.
