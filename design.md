# ProofPatch evidence viewer contract

ProofPatch is a bounded reliability-policy repair agent. A judge should be able
to inspect a real recorded run, understand what was proposed and independently
tested, follow recovery, and reach the exact receipt and source. The current tasks
are declared synthetic arithmetic policies, not arbitrary production repositories.

The viewer is read-only. It does not launch a model, submit an entry, or connect to
partner accounts. Its data comes from a fixed exported evaluation receipt.

1. The starting view shows the selected case, actual before/after checks, model,
   decision count, immutable test digest, and result. Visible case controls switch
   between backoff, pagination and budget without a wizard.
2. The timeline distinguishes model decisions, executed actions, verification,
   an explicitly controlled worker outage, rollback, and checkpoint resume.
   A checkpoint resume is a fresh instance from saved state, not a process crash.
3. Selecting an event reveals the real observation and candidate source inline.
   Native buttons and details elements keep focus predictable; no modal or hidden
   keyboard-only path is required. Changing a case keeps focus on the case control.
4. A visible recovery-only filter narrows events immediately. If no events match,
   the page explains the empty state and offers Clear filter. Clearing restores
   the full timeline and does not discard the selected case.
5. Evidence and source links stay available next to their claims. Pending remote
   neatlogs dashboard export, cfo.ai usage, registration and submission remain
   explicit. SDK configuration or this viewer cannot mark them complete.
6. No automatic playback, invented progress or waiting animation. Any cosmetic
   transition respects reduced motion; state and focus never wait for animation.
   Essential content works in narrow layouts without hover or drag.

Acceptance: inspect a successful case, follow the actual labelled recovery, open
and close details using keyboard, switch cases repeatedly, filter then clear,
and inspect narrow/reduced-motion layouts. Run those paths in a real browser when
the supported browser connection is available. Static checks establish content
and JavaScript parsing only; they are not browser interaction or human UX evidence.
