import { z } from 'zod'
import type { RuntimeSettings } from './domain.js'

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  API_PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  MARKET_DATA_PROVIDER: z.string().default('twelve-data'),
  AI_PROVIDER: z.string().default('openai'),
  NOTIFICATION_PROVIDER: z.string().default('console'),
  DEFAULT_MARKETS: z.string().default('stocks,etfs,forex,commodities,indices,options'),
  DEFAULT_TRADING_STYLES: z.string().default('intraday,swing'),
  DEFAULT_SESSIONS: z.string().default('regular'),
  DEFAULT_RISK_PROFILE: z.enum(['conservative', 'balanced', 'aggressive']).default('balanced'),
  DEFAULT_CAPITAL: z.coerce.number().positive().default(10000),
  ALERT_MIN_CONFIDENCE: z.coerce.number().min(0).max(1).default(0.8),
  ALERT_REQUIRE_URGENT: z.string().default('true'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-5.6')
})

export const env = EnvSchema.parse(process.env)

export const runtimeSettings: RuntimeSettings = {
  markets: env.DEFAULT_MARKETS.split(',') as RuntimeSettings['markets'],
  tradingStyles: env.DEFAULT_TRADING_STYLES.split(',') as RuntimeSettings['tradingStyles'],
  sessions: env.DEFAULT_SESSIONS.split(',') as RuntimeSettings['sessions'],
  riskProfile: env.DEFAULT_RISK_PROFILE,
  capital: env.DEFAULT_CAPITAL,
  alertMinConfidence: env.ALERT_MIN_CONFIDENCE,
  alertRequireUrgent: env.ALERT_REQUIRE_URGENT === 'true',
  aiProvider: env.AI_PROVIDER,
  marketDataProvider: env.MARKET_DATA_PROVIDER,
  notificationProvider: env.NOTIFICATION_PROVIDER
}
