import { ref, computed } from 'vue'
import {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  getSessionQRUrl
} from '@modules/sessions/services/session.service'
import { handleError } from '@core/errors/errorHandler'
import type { Session, SessionFormData, SessionWithPresenceCount } from '@modules/sessions/types/session.types'
import { log } from '@core/logger/logger'

export function useSessions() {
  const sessions = ref<SessionWithPresenceCount[]>([])
  const currentSession = ref<Session | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const qrUrl = ref<string | null>(null)

  const activeSessions = computed(() =>
    sessions.value.filter(s => new Date(s.date) >= new Date())
  )

  const pastSessions = computed(() =>
    sessions.value.filter(s => new Date(s.date) < new Date())
  )

  const totalPresences = computed(() =>
    sessions.value.reduce((acc, s) => acc + (s.presence_count || 0), 0)
  )

  async function fetchSessions(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      sessions.value = await getSessions()
      log.info(`${sessions.value.length} sessions récupérées`)
    } catch (err) {
      const appError = handleError(err, 'useSessions.fetchSessions')
      error.value = appError.message
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSession(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      currentSession.value = await getSessionById(id)
      qrUrl.value = await getSessionQRUrl(currentSession.value)
    } catch (err) {
      const appError = handleError(err, 'useSessions.fetchSession')
      error.value = appError.message
    } finally {
      isLoading.value = false
    }
  }

  async function addSession(data: SessionFormData): Promise<Session | null> {
    isLoading.value = true
    error.value = null

    try {
      const session = await createSession(data)
      sessions.value.unshift({ ...session, presence_count: 0 })
      log.info(`Session ajoutée: ${session.nom}`)
      return session
    } catch (err) {
      const appError = handleError(err, 'useSessions.addSession')
      error.value = appError.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function editSession(id: string, data: Partial<SessionFormData>): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const updated = await updateSession(id, data)
      const index = sessions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sessions.value[index] = { ...sessions.value[index], ...updated }
      }
      if (currentSession.value?.id === id) {
        currentSession.value = updated
      }
      log.info(`Session éditée: ${id}`)
      return true
    } catch (err) {
      const appError = handleError(err, 'useSessions.editSession')
      error.value = appError.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function removeSession(id: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      await deleteSession(id)
      sessions.value = sessions.value.filter(s => s.id !== id)
      if (currentSession.value?.id === id) {
        currentSession.value = null
        qrUrl.value = null
      }
      log.info(`Session supprimée: ${id}`)
      return true
    } catch (err) {
      const appError = handleError(err, 'useSessions.removeSession')
      error.value = appError.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    sessions,
    currentSession,
    qrUrl,
    isLoading,
    error,
    activeSessions,
    pastSessions,
    totalPresences,
    fetchSessions,
    fetchSession,
    addSession,
    editSession,
    removeSession,
    clearError
  }
}
