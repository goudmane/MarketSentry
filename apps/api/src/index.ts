import Fastify from 'fastify'
import cors from '@fastify/cors'
import { env, runtimeSettings } from './config.js'
import { MarketSnapshotSchema } from './domain.js'
import { createAnalyzer } from './analyzer-factory.js'
import { ConsoleNotifier, WatcherEngine } from './watcher.js'
import { HistoryRepository, RedisSetupStore } from './persistence.js'

const app = Fastify({ logger: true })
await app.register(cors, { origin: true })

const store = new RedisSetupStore(env.REDIS_URL)
const history = new HistoryRepository(env.DATABASE_URL)
await history.ensureSchema()

const watcher = new WatcherEngine(createAnalyzer(), store, new ConsoleNotifier(), runtimeSettings)

app.get('/health', async () => ({
  status: 'ok',
  service: 'marketsentry-api',
  aiProvider: runtimeSettings.aiProvider,
  marketDataProvider: runtimeSettings.marketDataProvider,
  notificationProvider: runtimeSettings.notificationProvider,
  aiConfigured: Boolean(env.OPENAI_API_KEY || env.AI_PROVIDER !== 'openai')
}))

app.get('/api/settings', async () => runtimeSettings)
app.get('/api/setups', async () => ({ items: await store.list() }))
app.get('/api/history', async (request) => {
  const query = request.query as { limit?: string }
  const limit = Math.min(Math.max(Number(query.limit ?? 100), 1), 500)
  return { items: await history.recent(limit) }
})

app.post('/api/analyze', async (request, reply) => {
  const parsed = MarketSnapshotSchema.safeParse(request.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid_snapshot', details: parsed.error.flatten() })
  const decision = await watcher.onSnapshot(parsed.data)
  await history.record(parsed.data, decision)
  return { decision }
})

app.listen({ port: env.API_PORT, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error)
  process.exit(1)
})
