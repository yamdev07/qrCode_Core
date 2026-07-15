import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { log } from '@core/logger/logger'

if (!crypto.randomUUID) {
  crypto.randomUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    }) as `${string}-${string}-${string}-${string}-${string}`
  }
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

log.info('Application démarrée')

// Enregistrer le Service Worker pour la PWA
if ('serviceWorker' in navigator) {
  import('./registerServiceWorker').then(({ registerServiceWorker }) => {
    registerServiceWorker()
  })
}
