# Roadmap

## Implemented foundation

- Nuxt 4 + PrimeVue dashboard
- Fastify/TypeScript API
- strict market/AI decision contracts
- OpenAI analyzer adapter
- silent `WATCH` lifecycle
- confirmed-entry notification gate
- Redis active watch persistence
- PostgreSQL analysis history
- initial Twelve Data WebSocket adapter
- Telegram / Discord / console notifications
- Docker deployment

## Next production work

1. Persist runtime settings and build full settings UI.
2. Add authenticated single-user access with a migration path to multi-user accounts/roles.
3. Add broad-universe scanner orchestration and provider subscription management.
4. Add richer market feature builder: bars, relative volume, VWAP, trend, volatility, support/resistance and market/sector context.
5. Add news/fundamental ingestion: company news, earnings, SEC filings, macro calendar, analyst changes.
6. Add provider adapters for Alpaca and Massive.
7. Add durable alert deduplication/escalation and delivery receipts.
8. Add outcome evaluator for stored opportunities and performance analytics.
9. Add provider health, latency, rate-limit and entitlement monitoring.
10. Add browser/mobile push if needed.

## Explicitly deferred

- automatic trade execution
- historical backtesting
- paper trading

Execution should be designed as a separate future phase, not slipped into the watcher service.
