import type { Router } from 'vue-router'
import { log } from '@core/logger/logger'
import { useAuth } from '@modules/admin/composables/useAuth'

export function registerGuards(router: Router): void {
  router.beforeEach(async (to, _from, next) => {
    document.title = `${to.meta.title || 'QR App'} | QRCode Pro`
    log.debug(`Navigation vers: ${to.path}`)

    // Les routes marquées requiresAuth exigent une session admin. Sinon on
    // redirige vers la connexion en mémorisant la destination.
    const { isAuthenticated } = useAuth()
    if (to.meta.requiresAuth && !isAuthenticated.value) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    // Déjà connecté : la page de connexion n'a plus lieu d'être.
    if (to.name === 'login' && isAuthenticated.value) {
      return next({ name: 'home' })
    }

    next()
  })

  router.afterEach((to) => {
    log.debug(`Page chargée: ${to.path}`)
  })
}
