import { ref } from 'vue'
import { getSessionPresences } from '@modules/scanner/services/presence.service'
import { handleError } from '@core/errors/errorHandler'
import type { PresenceRecord } from '@modules/sessions/types/session.types'
import { log } from '@core/logger/logger'

export function usePresenceTracking() {
  const presences = ref<PresenceRecord[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchPresences(sessionId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      presences.value = await getSessionPresences(sessionId) as unknown as PresenceRecord[]
      log.info(`${presences.value.length} présences récupérées pour la session ${sessionId}`)
    } catch (err) {
      const appError = handleError(err, 'usePresenceTracking.fetchPresences')
      error.value = appError.message
    } finally {
      isLoading.value = false
    }
  }

  const presenceCount = ref(0)

  function updateCount(count: number): void {
    presenceCount.value = count
  }

  function clearPresences(): void {
    presences.value = []
    presenceCount.value = 0
  }

  return {
    presences,
    isLoading,
    error,
    presenceCount,
    fetchPresences,
    updateCount,
    clearPresences
  }
}
