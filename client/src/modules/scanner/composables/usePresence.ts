import { ref } from 'vue'
import {
  markPresence,
  getSessionPresences,
  verifyPresence,
  verifyAgentPresence
} from '@modules/scanner/services/presence.service'
import { handleError } from '@core/errors/errorHandler'
import type { PresenceConfirmation } from '@modules/scanner/types/scanner.types'
import { log } from '@core/logger/logger'

export function usePresence() {
  const isMarking = ref(false)
  const isVerified = ref(false)
  const isAgentVerified = ref(false)
  const confirmation = ref<PresenceConfirmation | null>(null)
  const presenceList = ref<PresenceConfirmation[]>([])
  const error = ref<string | null>(null)

  async function mark(sessionId: string, userId: string, agentNom: string): Promise<boolean> {
    isMarking.value = true
    error.value = null

    try {
      const alreadyPresent = await verifyAgentPresence(sessionId, agentNom)
      if (alreadyPresent) {
        error.value = `${agentNom} est déjà enregistré(e) pour cette session`
        return false
      }

      const result = await markPresence({
        session_id: sessionId,
        utilisateur_id: userId,
        agent_nom: agentNom,
        timestamp: new Date().toISOString()
      })

      confirmation.value = result
      isAgentVerified.value = true
      log.presenceMarked(sessionId, userId)
      return true
    } catch (err) {
      const appError = handleError(err, 'usePresence.mark')
      error.value = appError.message
      return false
    } finally {
      isMarking.value = false
    }
  }

  async function verify(sessionId: string, userId: string): Promise<boolean> {
    try {
      isVerified.value = await verifyPresence(sessionId, userId)
      return isVerified.value
    } catch (err) {
      handleError(err, 'usePresence.verify')
      return false
    }
  }

  async function verifyAgent(sessionId: string, agentNom: string): Promise<boolean> {
    try {
      isAgentVerified.value = await verifyAgentPresence(sessionId, agentNom)
      return isAgentVerified.value
    } catch (err) {
      handleError(err, 'usePresence.verifyAgent')
      return false
    }
  }

  async function fetchSessionPresences(sessionId: string): Promise<void> {
    error.value = null

    try {
      presenceList.value = await getSessionPresences(sessionId)
    } catch (err) {
      const appError = handleError(err, 'usePresence.fetchSessionPresences')
      error.value = appError.message
    }
  }

  function reset(): void {
    isMarking.value = false
    isVerified.value = false
    isAgentVerified.value = false
    confirmation.value = null
    presenceList.value = []
    error.value = null
  }

  return {
    isMarking,
    isVerified,
    isAgentVerified,
    confirmation,
    presenceList,
    error,
    mark,
    verify,
    verifyAgent,
    fetchSessionPresences,
    reset
  }
}
