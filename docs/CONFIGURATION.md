# Configuration

MarketSentry is configuration-first. Environment variables provide bootstrap defaults; application settings should eventually be persisted and editable from the UI.

## Market scope

`DEFAULT_MARKETS=stocks,etfs,forex,commodities,indices,options`

Any subset can be enabled. Provider coverage must be validated independently.

## Trading styles

`DEFAULT_TRADING_STYLES=scalping,intraday,swing`

The AI receives the enabled styles and should evaluate setups only against those horizons.

## Sessions

`DEFAULT_SESSIONS=pre-market,regular,after-hours`

Use only sessions supported by the selected instrument/provider.

## Capital and risk

- `DEFAULT_CAPITAL`
- `DEFAULT_RISK_PROFILE=conservative|balanced|aggressive`

The AI may use these values to contextualize position/risk discussions, but the current system never executes orders.

## Alert gate

- `ALERT_MIN_CONFIDENCE`
- `ALERT_REQUIRE_URGENT`

When urgent mode is enabled, only `HIGH` or `IMMEDIATE` confirmed setups may notify.

## Providers

- `MARKET_DATA_PROVIDER`
- `AI_PROVIDER`
- `NOTIFICATION_PROVIDER`

Provider credentials live in environment/secrets, never in committed source.

## Current notification values

- `console`
- `telegram`
- `discord`

## Recommended next UI settings

Persist these per-user/profile later:

- enabled markets
- symbol/universe filters
- minimum liquidity/price filters
- styles/time horizons
- allowed sessions
- capital
- risk profile and risk per trade
- confidence threshold
- notification channels
- provider/model choice
- news/fundamental source toggles
