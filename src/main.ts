import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { log } from '@core/logger/logger'

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
