# Providers

## Market data

MarketSentry uses a provider-adapter model. Coverage, latency, exchange entitlements, and symbol limits differ by provider and subscription.

### Development/default direction: Twelve Data
Useful as an inexpensive starting adapter because it spans several asset classes. The repository includes an initial Twelve Data WebSocket adapter. Verify your plan's real-time entitlements and symbol limits before relying on it for production alerts.

### US equities/options: Alpaca
Useful for US market development and later broker integration. Free/basic real-time coverage is constrained compared with broad consolidated feeds, so treat it as a bounded-universe option unless your subscription provides the required coverage.

### Professional/broad coverage: Massive
Useful when broad real-time scanning and higher market-data limits justify a paid feed. Add as another `MarketDataProvider` adapter rather than changing watcher logic.

## AI

- `openai` is the first implemented provider.
- Additional providers should implement `AiAnalyzer`.
- The API boots in disabled-analysis mode when credentials are absent rather than failing the entire stack.

## Notifications

Implemented:

- `console`
- `telegram`
- `discord`

Planned adapters can include browser push, email, mobile push, and other channels. All channels receive alerts only after the central deterministic alert gate.

## News/fundamentals

News, earnings, SEC filings, macro calendars, and analyst changes should be normalized into context objects before AI analysis. Do not make the AI scrape arbitrary sources during every tick; ingest/cache feeds separately and attach only relevant context to the symbol/event.
