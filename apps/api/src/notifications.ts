import type { AiDecision, MarketSnapshot } from './domain.js'
import type { Notifier } from './watcher.js'
import { ConsoleNotifier } from './watcher.js'
import { env } from './config.js'

function formatAlert(decision: AiDecision, snapshot: MarketSnapshot): string {
  return [
    `🚨 MarketSentry: ${snapshot.symbol}`,
    `${decision.thesis}`,
    `Entry: ${decision.entryZone?.min} - ${decision.entryZone?.max}`,
    `Price now: ${snapshot.price}`,
    `Stop/Invalidation: ${decision.stopPrice ?? decision.invalidationPrice ?? 'n/a'}`,
    `Targets: ${decision.targets.join(', ') || 'n/a'}`,
    `Risk/Reward: ${decision.riskReward ?? 'n/a'}`,
    `Urgency: ${decision.urgency}`,
    `Confidence: ${Math.round(decision.confidence * 100)}%`,
    `Window: ${decision.expectedWindowMinutes ?? 'n/a'} min`,
    decision.reasons.length ? `Why: ${decision.reasons.join(' | ')}` : '',
    decision.newsContext.length ? `News: ${decision.newsContext.join(' | ')}` : ''
  ].filter(Boolean).join('\n')
}

class TelegramNotifier implements Notifier {
  async send(decision: AiDecision, snapshot: MarketSnapshot): Promise<void> {
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) throw new Error('Telegram credentials missing')
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: formatAlert(decision, snapshot) })
    })
    if (!response.ok) throw new Error(`Telegram notification failed: ${response.status}`)
  }
}

class DiscordNotifier implements Notifier {
  async send(decision: AiDecision, snapshot: MarketSnapshot): Promise<void> {
    if (!env.DISCORD_WEBHOOK_URL) throw new Error('DISCORD_WEBHOOK_URL missing')
    const response = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: formatAlert(decision, snapshot) })
    })
    if (!response.ok) throw new Error(`Discord notification failed: ${response.status}`)
  }
}

export function createNotifier(): Notifier {
  if (env.NOTIFICATION_PROVIDER === 'telegram') return new TelegramNotifier()
  if (env.NOTIFICATION_PROVIDER === 'discord') return new DiscordNotifier()
  return new ConsoleNotifier()
}
