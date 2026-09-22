import Fastify from 'fastify'
import cors from '@fastify/cors'
import { env, runtimeSettings } from './config.js'
import { MarketSnapshotSchema } from './domain.js'
import { OpenAiAnalyzer } from './ai.js'
import { ConsoleNotifier, MemorySetupStore, WatcherEngine } from './watcher.js'

const app = Fastify({ logger: true })
await app.register(cors, { origin: true })

const store = new MemorySetupStore()
const analyzer = new OpenAiAnalyzer()
const watcher = new WatcherEngine(analyzer, store, new ConsoleNotifier(), runtimeSettings)

app.get('/health', async () => ({ status: 'ok', service: 'marketsentry-api' }))

app.get('/api/settings', async () => runtimeSettings)

app.get('/api/setups', async () => ({ items: await store.list() }))

app.post('/api/analyze', async (request, reply) => {
  const parsed = MarketSnapshotSchema.safeParse(request.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid_snapshot', details: parsed.error.flatten() })
  const decision = await watcher.onSnapshot(parsed.data)
  return { decision }
})

app.listen({ port: env.API_PORT, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error)
  process.exit(1)
})
