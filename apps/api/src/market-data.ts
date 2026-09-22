import WebSocket from 'ws'
import type { Market, MarketSnapshot } from './domain.js'

export type Subscription = { symbol: string; market: Market }

export interface MarketDataProvider {
  readonly name: string
  start(subscriptions: Subscription[], onSnapshot: (snapshot: MarketSnapshot) => Promise<void>): Promise<void>
  stop(): Promise<void>
}

export class TwelveDataProvider implements MarketDataProvider {
  readonly name = 'twelve-data'
  private socket?: WebSocket

  constructor(private readonly apiKey: string) {}

  async start(subscriptions: Subscription[], onSnapshot: (snapshot: MarketSnapshot) => Promise<void>): Promise<void> {
    if (!this.apiKey) throw new Error('TWELVE_DATA_API_KEY is required')
    const url = `wss://ws.twelvedata.com/v1/quotes/price?apikey=${encodeURIComponent(this.apiKey)}`
    this.socket = new WebSocket(url)

    this.socket.on('open', () => {
      this.socket?.send(JSON.stringify({
        action: 'subscribe',
        params: { symbols: subscriptions.map((item) => item.symbol).join(',') }
      }))
    })

    this.socket.on('message', async (buffer) => {
      const event = JSON.parse(buffer.toString()) as Record<string, unknown>
      if (!event.symbol || !event.price) return
      const subscription = subscriptions.find((item) => item.symbol === event.symbol)
      if (!subscription) return
      await onSnapshot({
        symbol: String(event.symbol),
        market: subscription.market,
        timestamp: new Date(Number(event.timestamp ?? Date.now() / 1000) * 1000).toISOString(),
        price: Number(event.price),
        volume: event.day_volume == null ? undefined : Number(event.day_volume),
        context: { provider: this.name, rawEventType: event.event }
      })
    })
  }

  async stop(): Promise<void> {
    this.socket?.close()
    this.socket = undefined
  }
}

export class MockMarketDataProvider implements MarketDataProvider {
  readonly name = 'mock'
  private timer?: NodeJS.Timeout

  async start(subscriptions: Subscription[], onSnapshot: (snapshot: MarketSnapshot) => Promise<void>): Promise<void> {
    this.timer = setInterval(() => {
      for (const item of subscriptions) {
        void onSnapshot({
          symbol: item.symbol,
          market: item.market,
          timestamp: new Date().toISOString(),
          price: 100 + Math.random() * 10,
          volume: Math.floor(100_000 + Math.random() * 900_000),
          relativeVolume: 0.5 + Math.random() * 3,
          context: { provider: this.name }
        })
      }
    }, 5_000)
  }

  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer)
  }
}
