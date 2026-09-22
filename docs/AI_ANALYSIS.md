# AI analysis

AI is the primary semantic analyst. It receives normalized market context, account capital/risk profile, configured trading styles/sessions, optional prior setup state, and relevant news/fundamental context.

## Required output

The model must return structured data validated by `AiDecisionSchema`:

- state: `IGNORE | WATCH | CONFIRMED`
- thesis
- confidence
- urgency
- entry zone for confirmed setups
- invalidation/stop
- targets
- risk/reward when supportable
- expected entry window
- waiting conditions
- reasons
- market context
- news context

## Model discipline

`CONFIRMED` means actionable now, not merely interesting. The model must not notify on `WATCH`. The API enforces this independently of the model.

## Cost control

Do not send every raw tick to an LLM. Build normalized snapshots/events and use cheap deterministic prefilters only to reduce noise and decide when the AI should inspect an instrument. AI remains responsible for the actual opportunity classification.

## Provider strategy

The current adapter is OpenAI-first but the `AiAnalyzer` interface allows other hosted or local providers later. Provider-specific SDK code must stay inside its adapter.
