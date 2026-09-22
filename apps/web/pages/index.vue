<script setup lang="ts">
const config = useRuntimeConfig()
const api = config.public.apiBase

const { data: settings } = await useFetch(`${api}/api/settings`)
const { data: setups, refresh } = await useFetch<{ items: any[] }>(`${api}/api/setups`)

const watches = computed(() => setups.value?.items.filter((item) => item.decision.state === 'WATCH') ?? [])
const confirmed = computed(() => setups.value?.items.filter((item) => item.decision.state === 'CONFIRMED') ?? [])
</script>

<template>
  <main class="page">
    <header class="hero">
      <div>
        <p class="eyebrow">MARKETSENTRY</p>
        <h1>AI Market Watch</h1>
        <p class="subtitle">Silent while setups develop. Visible only when entries are confirmed.</p>
      </div>
      <Button label="Refresh" icon="pi pi-refresh" severity="secondary" @click="refresh" />
    </header>

    <section class="cards">
      <Card>
        <template #title>Internal watches</template>
        <template #content><strong class="metric">{{ watches.length }}</strong><p>Tracked silently by the analyzer.</p></template>
      </Card>
      <Card>
        <template #title>Confirmed setups</template>
        <template #content><strong class="metric">{{ confirmed.length }}</strong><p>Confirmed state; notification still passes the entry gate.</p></template>
      </Card>
      <Card>
        <template #title>Risk profile</template>
        <template #content><strong class="metric small">{{ (settings as any)?.riskProfile ?? '—' }}</strong><p>Capital: {{ (settings as any)?.capital ?? '—' }}</p></template>
      </Card>
    </section>

    <section class="panel">
      <div class="panel-title"><div><h2>Confirmed opportunities</h2><p>Only actionable setups belong here.</p></div></div>
      <DataTable :value="confirmed" striped-rows>
        <Column field="symbol" header="Symbol" />
        <Column header="Entry"><template #body="{ data }">{{ data.decision.entryZone?.min }} – {{ data.decision.entryZone?.max }}</template></Column>
        <Column field="decision.confidence" header="Confidence"><template #body="{ data }">{{ Math.round(data.decision.confidence * 100) }}%</template></Column>
        <Column field="decision.urgency" header="Urgency" />
        <Column field="decision.thesis" header="Thesis" />
      </DataTable>
    </section>

    <section class="panel muted-panel">
      <div class="panel-title"><div><h2>Silent watch queue</h2><p>These never trigger user notifications.</p></div></div>
      <DataTable :value="watches" striped-rows>
        <Column field="symbol" header="Symbol" />
        <Column field="decision.thesis" header="Thesis" />
        <Column field="decision.urgency" header="Urgency" />
        <Column header="Waiting for"><template #body="{ data }">{{ data.decision.waitingFor?.join(', ') || '—' }}</template></Column>
      </DataTable>
    </section>
  </main>
</template>

<style scoped>
.page { max-width: 1400px; margin: 0 auto; padding: 32px; }
.hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
.eyebrow { margin: 0 0 8px; letter-spacing: .2em; opacity: .6; font-size: 12px; }
h1 { margin: 0; font-size: clamp(32px, 5vw, 58px); line-height: 1; }
.subtitle { max-width: 720px; opacity: .7; }
.cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-bottom: 20px; }
.metric { display: block; font-size: 46px; line-height: 1; margin-bottom: 10px; }
.metric.small { font-size: 28px; text-transform: capitalize; }
.panel { margin-top: 18px; padding: 20px; border: 1px solid rgba(255,255,255,.08); border-radius: 18px; background: rgba(255,255,255,.035); }
.muted-panel { opacity: .86; }
.panel-title { display: flex; justify-content: space-between; margin-bottom: 16px; }
.panel-title h2, .panel-title p { margin: 0; }
.panel-title p { opacity: .6; margin-top: 5px; }
@media (max-width: 850px) { .page { padding: 18px; } .cards { grid-template-columns: 1fr; } .hero { flex-direction: column; } }
</style>
