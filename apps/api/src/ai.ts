import OpenAI from 'openai'
import { AiDecisionSchema, type AiDecision, type MarketSnapshot, type RuntimeSettings } from './domain.js'
import { env } from './config.js'

export interface AiAnalyzer {
  analyze(snapshot: MarketSnapshot, settings: RuntimeSettings, previous?: AiDecision): Promise<AiDecision>
}

const SYSTEM_PROMPT = `You are the primary market-analysis engine for MarketSentry.
Analyze only the supplied market data and context. Your job is to classify the current setup as IGNORE, WATCH, or CONFIRMED.
WATCH is internal only and must never request a user notification.
CONFIRMED means the setup is actionable now, the entry is still available, and delay could materially worsen the entry.
Never mark CONFIRMED merely because an instrument is interesting or may become actionable later.
For CONFIRMED provide an entry zone, invalidation/stop, targets, risk/reward when supportable, urgency, confidence, expected entry window, concise reasons, market context and news context.
Use confidence as analysis confidence, not a guaranteed probability of profit.
Respect capital and risk profile but do not place trades.`

export class OpenAiAnalyzer implements AiAnalyzer {
  private readonly client: OpenAI

  constructor(apiKey = env.OPENAI_API_KEY) {
    if (!apiKey) throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai')
    this.client = new OpenAI({ apiKey })
  }

  async analyze(snapshot: MarketSnapshot, settings: RuntimeSettings, previous?: AiDecision): Promise<AiDecision> {
    const response = await this.client.responses.create({
      model: env.OPENAI_MODEL,
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            current: snapshot,
            previousSetup: previous ?? null,
            account: { capital: settings.capital, riskProfile: settings.riskProfile },
            tradingStyles: settings.tradingStyles,
            sessions: settings.sessions
          })
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'market_sentry_decision',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['state', 'symbol', 'thesis', 'confidence', 'urgency', 'targets', 'waitingFor', 'reasons', 'marketContext', 'newsContext', 'notify'],
            properties: {
              state: { enum: ['IGNORE', 'WATCH', 'CONFIRMED'] },
              symbol: { type: 'string' },
              thesis: { type: 'string' },
              confidence: { type: 'number', minimum: 0, maximum: 1 },
              urgency: { enum: ['LOW', 'MEDIUM', 'HIGH', 'IMMEDIATE'] },
              entryZone: {
                anyOf: [
                  { type: 'object', additionalProperties: false, required: ['min', 'max'], properties: { min: { type: 'number' }, max: { type: 'number' } } },
                  { type: 'null' }
                ]
              },
              invalidationPrice: { type: ['number', 'null'] },
              stopPrice: { type: ['number', 'null'] },
              targets: { type: 'array', items: { type: 'number' } },
              riskReward: { type: ['number', 'null'] },
              expectedWindowMinutes: { type: ['integer', 'null'] },
              waitingFor: { type: 'array', items: { type: 'string' } },
              reasons: { type: 'array', items: { type: 'string' } },
              marketContext: { type: 'array', items: { type: 'string' } },
              newsContext: { type: 'array', items: { type: 'string' } },
              expiresAt: { type: ['string', 'null'] },
              notify: { type: 'boolean' }
            }
          }
        }
      }
    })

    const raw = JSON.parse(response.output_text) as Record<string, unknown>
    for (const key of ['entryZone', 'invalidationPrice', 'stopPrice', 'riskReward', 'expectedWindowMinutes', 'expiresAt']) {
      if (raw[key] === null) delete raw[key]
    }
    return AiDecisionSchema.parse(raw)
  }
}
