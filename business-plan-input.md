# Input prepared for cfo.ai — not a cfo.ai output

Product hypothesis: a CI-recovery assistant for small developer teams, starting
with narrowly scoped failures and proposing independently verified patches.
The current prototype handles three trusted synthetic arithmetic policies:
exponential backoff, pagination boundaries and available budget. Arbitrary
production repository repair and paying customers are unproven.

Ask cfo.ai to build base, downside and growth scenarios covering pricing, costs,
revenue, cash burn and runway. Model the following as explicit assumptions:

- Subscription price scenarios: $19, $49 and $99 per team/month.
- Customer scenarios: 10, 50 and 200 paying teams; no customers are confirmed.
- Usage: 10, 50 and 100 repair attempts per team/month.
- Inference: use observed token counts from evidence/evaluation.json. CLI monetary
  cost is not reported. Actual dashboard export and event-gateway billing remain
  pending; do not turn tokens into dollars without a documented provider rate.
- Infrastructure: estimate sandbox CPU/storage/logging separately; current local fixture has no cloud deployment.
- Failed attempts, human-review time, conversion, churn and founder costs must be visible assumptions.

Return unit economics, gross margin, monthly burn, runway and sensitivity to
model cost and successful-repair rate. State that no revenue or production
repair-quality claim exists yet. Retain the real cfo.ai output/screenshots and
explain them in the demo.
