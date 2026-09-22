import type { AiAnalyzer } from './ai.js'
import type { AiDecision, MarketSnapshot, RuntimeSettings } from './domain.js'

export type SetupRecord = {
  symbol: string
  decision: AiDecision
  createdAt: string
  updatedAt: string
  lastPrice: number
}

export interface SetupStore {
  get(symbol: string): Promise<SetupRecord | undefined>
  put(record: SetupRecord): Promise<void>
  remove(symbol: string): Promise<void>
  list(): Promise<SetupRecord[]>
}

export interface Notifier {
  send(decision: AiDecision, snapshot: MarketSnapshot): Promise<void>
}

export class MemorySetupStore implements SetupStore {
  private readonly records = new Map<string, SetupRecord>()
  async get(symbol: string) { return this.records.get(symbol) }
  async put(record: SetupRecord) { this.records.set(record.symbol, record) }
  async remove(symbol: string) { this.records.delete(symbol) }
  async list() { return [...this.records.values()] }
}

export class WatcherEngine {
  constructor(
    private readonly analyzer: AiAnalyzer,
    private readonly store: SetupStore,
    private readonly notifier: Notifier,
    private readonly settings: RuntimeSettings
  ) {}

  async onSnapshot(snapshot: MarketSnapshot): Promise<AiDecision> {
    const previous = await this.store.get(snapshot.symbol)
    const decision = await this.analyzer.analyze(snapshot, this.settings, previous?.decision)
    const now = new Date().toISOString()

    if (decision.state === 'IGNORE') {
      if (previous) await this.store.remove(snapshot.symbol)
      return decision
    }

    if (decision.state === 'WATCH') {
      await this.store.put({
        symbol: snapshot.symbol,
        decision: { ...decision, notify: false },
        createdAt: previous?.createdAt ?? now,
        updatedAt: now,
        lastPrice: snapshot.price
      })
      return { ...decision, notify: false }
    }

    const canNotify = this.canNotify(decision, snapshot)
    const storedDecision = { ...decision, notify: canNotify }

    await this.store.put({
      symbol: snapshot.symbol,
      decision: storedDecision,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
      lastPrice: snapshot.price
    })

    if (canNotify) await this.notifier.send(storedDecision, snapshot)
    return storedDecision
  }

  private canNotify(decision: AiDecision, snapshot: MarketSnapshot): boolean {
    if (decision.state !== 'CONFIRMED') return false
    if (decision.confidence < this.settings.alertMinConfidence) return false
    if (this.settings.alertRequireUrgent && !['HIGH', 'IMMEDIATE'].includes(decision.urgency)) return false
    if (!decision.entryZone) return false
    if (snapshot.price < decision.entryZone.min || snapshot.price > decision.entryZone.max) return false
    if (!decision.expectedWindowMinutes || decision.expectedWindowMinutes <= 0) return false
    return true
  }
}

export class ConsoleNotifier implements Notifier {
  async send(decision: AiDecision, snapshot: MarketSnapshot): Promise<void> {
    console.log(JSON.stringify({ type: 'MARKET_SENTRY_ALERT', at: new Date().toISOString(), snapshot, decision }, null, 2))
  }
}
