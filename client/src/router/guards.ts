import type { Router } from 'vue-router'
import { log } from '@core/logger/logger'

export function registerGuards(router: Router): void {
  router.beforeEach(async (to, _from, next) => {
    document.title = `${to.meta.title || 'QR App'} | QRCode Pro`

    log.debug(`Navigation vers: ${to.path}`)

    next()
  })

  router.afterEach((to) => {
    log.debug(`Page chargée: ${to.path}`)
  })
}
