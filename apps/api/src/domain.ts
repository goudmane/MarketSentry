import { z } from 'zod'

export const MarketSchema = z.enum(['stocks', 'etfs', 'forex', 'commodities', 'indices', 'options'])
export const TradingStyleSchema = z.enum(['scalping', 'intraday', 'swing'])
export const SessionSchema = z.enum(['pre-market', 'regular', 'after-hours'])
export const RiskProfileSchema = z.enum(['conservative', 'balanced', 'aggressive'])
export const SetupStateSchema = z.enum(['IGNORE', 'WATCH', 'CONFIRMED', 'INVALIDATED', 'EXPIRED'])
export const UrgencySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'IMMEDIATE'])

export const MarketSnapshotSchema = z.object({
  symbol: z.string().min(1),
  market: MarketSchema,
  timestamp: z.string().datetime(),
  price: z.number().positive(),
  bid: z.number().nonnegative().optional(),
  ask: z.number().nonnegative().optional(),
  volume: z.number().nonnegative().optional(),
  dayOpen: z.number().positive().optional(),
  dayHigh: z.number().positive().optional(),
  dayLow: z.number().positive().optional(),
  previousClose: z.number().positive().optional(),
  changePercent: z.number().optional(),
  relativeVolume: z.number().nonnegative().optional(),
  vwap: z.number().positive().optional(),
  rsi: z.number().min(0).max(100).optional(),
  atr: z.number().nonnegative().optional(),
  trend: z.enum(['strong-down', 'down', 'flat', 'up', 'strong-up']).optional(),
  session: SessionSchema.optional(),
  news: z.array(z.object({
    headline: z.string(),
    source: z.string().optional(),
    publishedAt: z.string().optional(),
    sentiment: z.enum(['negative', 'neutral', 'positive']).optional()
  })).default([]),
  context: z.record(z.string(), z.unknown()).default({})
})

export const AiDecisionSchema = z.object({
  state: z.enum(['IGNORE', 'WATCH', 'CONFIRMED']),
  symbol: z.string(),
  thesis: z.string().min(1),
  confidence: z.number().min(0).max(1),
  urgency: UrgencySchema,
  entryZone: z.object({ min: z.number(), max: z.number() }).optional(),
  invalidationPrice: z.number().optional(),
  stopPrice: z.number().optional(),
  targets: z.array(z.number()).default([]),
  riskReward: z.number().positive().optional(),
  expectedWindowMinutes: z.number().int().positive().optional(),
  waitingFor: z.array(z.string()).default([]),
  reasons: z.array(z.string()).default([]),
  marketContext: z.array(z.string()).default([]),
  newsContext: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional(),
  notify: z.boolean().default(false)
}).superRefine((value, ctx) => {
  if (value.state === 'CONFIRMED') {
    if (!value.entryZone) ctx.addIssue({ code: 'custom', message: 'CONFIRMED requires entryZone' })
    if (!value.stopPrice && !value.invalidationPrice) ctx.addIssue({ code: 'custom', message: 'CONFIRMED requires stop/invalidation' })
    if (!value.expectedWindowMinutes) ctx.addIssue({ code: 'custom', message: 'CONFIRMED requires expectedWindowMinutes' })
  }
  if (value.state !== 'CONFIRMED' && value.notify) {
    ctx.addIssue({ code: 'custom', message: 'Only CONFIRMED decisions may request notification' })
  }
})

export type Market = z.infer<typeof MarketSchema>
export type MarketSnapshot = z.infer<typeof MarketSnapshotSchema>
export type AiDecision = z.infer<typeof AiDecisionSchema>

export type RuntimeSettings = {
  markets: Market[]
  tradingStyles: z.infer<typeof TradingStyleSchema>[]
  sessions: z.infer<typeof SessionSchema>[]
  riskProfile: z.infer<typeof RiskProfileSchema>
  capital: number
  alertMinConfidence: number
  alertRequireUrgent: boolean
  aiProvider: string
  marketDataProvider: string
  notificationProvider: string
}
