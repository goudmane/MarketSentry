# MarketSentry

MarketSentry is an AI-first real-time market watcher designed to monitor configurable financial markets, maintain silent internal watch setups, and notify the user only when an opportunity is confirmed and the entry window is urgent.

## Product principles

- AI is the primary market analyst.
- Market data, AI providers, and notification channels are provider-agnostic.
- Internal watch candidates never notify the user.
- Alerts are emitted only for confirmed, urgent, still-valid entries.
- Every alert includes entry zone, invalidation/stop, targets, risk/reward, urgency, confidence, reasoning, market/news context, and an expected time window.
- The system stores setup history and outcomes for later strategy evaluation.
- Automatic trading/execution is intentionally out of scope for the current version.
- Single-user first, with domain boundaries that can be extended to multiple users later.

## Supported market model

The application is designed for configurable coverage of US stocks, ETFs, forex, commodities, indices, and options. Actual coverage and real-time entitlements depend on the configured data provider and subscription.

## Stack

- Frontend: Nuxt 4 + TypeScript + PrimeVue
- API: Node.js + TypeScript + Fastify
- Database: PostgreSQL
- Runtime state/queues: Redis
- Deployment: Docker Compose
- AI: provider adapter, OpenAI first
- Market data: provider adapters, cheap/free development mode first, professional feeds configurable

## Core watcher lifecycle

```text
market streams
    -> normalization
    -> feature/context builder
    -> AI screening
    -> IGNORE | WATCH | CONFIRMED

WATCH
    -> persisted internal setup
    -> event-driven re-evaluation
    -> expire | invalidate | confirmed

CONFIRMED
    -> deterministic notification gate
    -> urgent + valid + confidence threshold
    -> user alert
```

`WATCH` is always silent. The notification service cannot send a normal watch candidate.

## Local setup

```bash
cp .env.example .env
pnpm install
docker compose up -d postgres redis
pnpm dev
```

Or run everything with Docker:

```bash
cp .env.example .env
docker compose up --build
```

Frontend: `http://localhost:3000`  
API: `http://localhost:4000`  
Health: `http://localhost:4000/health`

## Configuration

The environment file contains bootstrap defaults. Runtime configuration is intended to be persisted and editable through the application.

Important configuration groups include markets/instruments, trading styles, sessions, capital/risk profile, market-data provider, AI provider/model, notifications, alert gate, and news/fundamental sources.

See `docs/CONFIGURATION.md`.

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/WATCHER.md`
- `docs/AI_ANALYSIS.md`
- `docs/PROVIDERS.md`
- `docs/CONFIGURATION.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY.md`
- `docs/ROADMAP.md`

## Important note

MarketSentry is an analysis and notification system. It does not guarantee profitable trades and currently has no automatic trade execution capability.

## License

MIT
