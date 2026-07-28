import { registerSW } from 'virtual:pwa-register'
import { log } from '@core/logger/logger'

export function registerServiceWorker(): void {
  const updateSW = registerSW({
    onNeedRefresh() {
      log.info('Nouvelle version disponible')
      if (confirm('Une nouvelle version est disponible. Actualiser ?')) {
        updateSW()
      }
    },
    onOfflineReady() {
      log.info('Application prête pour le mode hors-ligne')
    },
    onRegistered(registration) {
      log.debug('Service Worker enregistré', registration)
    },
    onRegisterError(error) {
      log.error('Erreur Service Worker', error)
    }
  })
}
