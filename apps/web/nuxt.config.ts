export default defineNuxtConfig({
  modules: ['@primevue/nuxt-module'],
  css: ['primeicons/primeicons.css'],
  primevue: { options: { ripple: true } },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000'
    }
  },
  devtools: { enabled: true }
})
