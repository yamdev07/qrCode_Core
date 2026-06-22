import type { Router } from 'vue-router'
import { log } from '@core/logger/logger'
import { supabase } from '@core/database/supabaseClient'

export function registerGuards(router: Router): void {
  router.beforeEach(async (to, _from, next) => {
    document.title = `${to.meta.title || 'QR App'} | QRCode Pro`

    log.debug(`Navigation vers: ${to.path}`)

    // Routes protégées : nécessitent une session admin active.
    if (to.meta.requiresAuth) {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        next({ name: 'login', query: { redirect: to.fullPath } })
        return
      }
    }

    next()
  })

  router.afterEach((to) => {
    log.debug(`Page chargée: ${to.path}`)
  })
}
