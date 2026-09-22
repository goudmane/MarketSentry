import type { AiAnalyzer } from './ai.js'
import { OpenAiAnalyzer } from './ai.js'
import type { AiDecision, MarketSnapshot, RuntimeSettings } from './domain.js'
import { env } from './config.js'

class DisabledAnalyzer implements AiAnalyzer {
  async analyze(snapshot: MarketSnapshot, _settings: RuntimeSettings, _previous?: AiDecision): Promise<AiDecision> {
    return {
      state: 'IGNORE',
      symbol: snapshot.symbol,
      thesis: 'AI analyzer is not configured. Add provider credentials to enable analysis.',
      confidence: 0,
      urgency: 'LOW',
      targets: [],
      waitingFor: [],
      reasons: ['AI provider unavailable'],
      marketContext: [],
      newsContext: [],
      notify: false
    }
  }
}

export function createAnalyzer(): AiAnalyzer {
  if (env.AI_PROVIDER === 'openai' && env.OPENAI_API_KEY) return new OpenAiAnalyzer(env.OPENAI_API_KEY)
  return new DisabledAnalyzer()
}
