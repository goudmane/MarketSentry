import Redis from 'ioredis'
import { Pool } from 'pg'
import type { SetupRecord, SetupStore } from './watcher.js'
import type { AiDecision, MarketSnapshot } from './domain.js'

export class RedisSetupStore implements SetupStore {
  private readonly redis: Redis
  private readonly prefix = 'marketsentry:setup:'

  constructor(url: string) {
    this.redis = new Redis(url, { maxRetriesPerRequest: 3 })
  }

  async get(symbol: string): Promise<SetupRecord | undefined> {
    const raw = await this.redis.get(`${this.prefix}${symbol}`)
    return raw ? JSON.parse(raw) as SetupRecord : undefined
  }

  async put(record: SetupRecord): Promise<void> {
    await this.redis.set(`${this.prefix}${record.symbol}`, JSON.stringify(record))
  }

  async remove(symbol: string): Promise<void> {
    await this.redis.del(`${this.prefix}${symbol}`)
  }

  async list(): Promise<SetupRecord[]> {
    let cursor = '0'
    const records: SetupRecord[] = []
    do {
      const [next, keys] = await this.redis.scan(cursor, 'MATCH', `${this.prefix}*`, 'COUNT', 100)
      cursor = next
      if (keys.length) {
        const values = await this.redis.mget(...keys)
        for (const value of values) if (value) records.push(JSON.parse(value) as SetupRecord)
      }
    } while (cursor !== '0')
    return records
  }
}

export class HistoryRepository {
  private readonly pool: Pool
  constructor(databaseUrl: string) { this.pool = new Pool({ connectionString: databaseUrl }) }

  async ensureSchema(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS analysis_events (
        id BIGSERIAL PRIMARY KEY,
        symbol TEXT NOT NULL,
        market TEXT NOT NULL,
        state TEXT NOT NULL,
        confidence DOUBLE PRECISION NOT NULL,
        urgency TEXT NOT NULL,
        snapshot JSONB NOT NULL,
        decision JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_analysis_events_symbol_created_at ON analysis_events(symbol, created_at DESC);
      CREATE TABLE IF NOT EXISTS opportunity_outcomes (
        id BIGSERIAL PRIMARY KEY,
        analysis_event_id BIGINT NOT NULL REFERENCES analysis_events(id) ON DELETE CASCADE,
        horizon_minutes INTEGER NOT NULL,
        observed_price DOUBLE PRECISION NOT NULL,
        return_percent DOUBLE PRECISION,
        observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(analysis_event_id, horizon_minutes)
      );
    `)
  }

  async record(snapshot: MarketSnapshot, decision: AiDecision): Promise<number> {
    const result = await this.pool.query<{ id: string }>(
      `INSERT INTO analysis_events(symbol, market, state, confidence, urgency, snapshot, decision)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb) RETURNING id`,
      [snapshot.symbol, snapshot.market, decision.state, decision.confidence, decision.urgency, JSON.stringify(snapshot), JSON.stringify(decision)]
    )
    return Number(result.rows[0].id)
  }

  async recent(limit = 100): Promise<unknown[]> {
    const result = await this.pool.query(
      `SELECT id, symbol, market, state, confidence, urgency, decision, created_at
       FROM analysis_events ORDER BY created_at DESC LIMIT $1`, [limit]
    )
    return result.rows
  }
}
