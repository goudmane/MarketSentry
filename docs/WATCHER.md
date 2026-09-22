# Watcher lifecycle

## States

- `IGNORE`: no active setup. Existing watch state is removed.
- `WATCH`: interesting but not actionable. Persist internally. Never notify.
- `CONFIRMED`: AI says an actionable entry exists now. Still must pass the deterministic alert gate.
- `INVALIDATED` / `EXPIRED`: terminal lifecycle concepts for persisted/history reporting.

## Notification gate

A confirmed decision is sent only when all configured conditions pass:

1. AI state is `CONFIRMED`.
2. Confidence meets `ALERT_MIN_CONFIDENCE`.
3. Urgency is `HIGH` or `IMMEDIATE` when urgent mode is enabled.
4. AI supplied an entry zone.
5. Current price is still inside that entry zone.
6. A positive expected entry window exists.

A `WATCH` decision is forcibly stored with `notify=false` regardless of model output.

## Re-evaluation

Active watches should be re-evaluated on meaningful events rather than arbitrary fixed polling only. Examples:

- price reaches/approaches a level the AI is waiting for
- abnormal volume/volatility change
- trend/market-regime change
- relevant breaking news
- earnings/macro event update
- setup expiry approaching

## Deduplication

Before production alerting, notifications should gain a durable alert-id/deduplication record so an unchanged confirmed setup is not repeatedly sent on every incoming snapshot.

## Outcome tracking

Every analysis event is stored. A separate evaluator can later attach outcomes at configured horizons (for example 5m, 15m, 1h, 1d) without requiring backtesting or paper trading in the current release.
