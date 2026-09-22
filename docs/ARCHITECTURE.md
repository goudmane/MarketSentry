# Architecture

## Goal

MarketSentry continuously receives market/news context, asks AI to classify setups, persists internal watches, and notifies only when a setup is confirmed and urgent.

## Services

### Web
Nuxt 4 + PrimeVue operator UI. It displays configuration, active internal watches, confirmed setups, history, and later provider health/metrics.

### API
Fastify/TypeScript service responsible for validation, analysis orchestration, setup lifecycle, alert gating, provider adapters, and persistence.

### PostgreSQL
Durable analysis history and outcome data. Active runtime watch state does not depend on database polling.

### Redis
Low-latency active setup/watch state. This allows the watcher to survive API process restarts while keeping reads/writes cheap.

## Data flow

```text
Market provider(s)
  -> normalized MarketSnapshot
  -> feature/context enrichment
  -> AI Analyzer
  -> IGNORE | WATCH | CONFIRMED
  -> setup state persistence
  -> deterministic alert gate
  -> notifier

News/fundamental feeds --------^ 
```

## Provider boundaries

Three primary interfaces must remain replaceable:

1. `MarketDataProvider`
2. `AiAnalyzer`
3. `Notifier`

A provider must never leak provider-specific payloads into domain code. Adapters normalize first.

## Scaling model

The expensive AI layer should not receive every raw tick. Market feeds are normalized and reduced into meaningful snapshots/events. Broad-market scanning can use cheap deterministic prefilters to decide when the AI should inspect an instrument. Once AI creates a `WATCH`, that candidate receives higher-priority re-evaluation on meaningful changes.

This is an efficiency mechanism only; AI remains the primary analyst and owns the semantic decision to ignore/watch/confirm.

## Execution boundary

There is intentionally no broker-order interface in the current architecture. If execution is added later it must be a separate service/adapter behind explicit user controls and must not be reachable by the current notifier path.
