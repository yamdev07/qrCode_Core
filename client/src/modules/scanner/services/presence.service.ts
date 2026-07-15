import {
  presencesMark,
  presencesListBySession,
  presencesVerify,
  presencesVerifyAgent
} from '@core/database/databaseClient'
import type { PresenceData, PresenceConfirmation } from '@modules/scanner/types/scanner.types'
import { z } from 'zod'
import { ValidationError, ApiError } from '@core/errors/AppError'
import { log } from '@core/logger/logger'

const presenceSchema = z.object({
  session_id: z.string().uuid('ID de session invalide'),
  utilisateur_id: z.string().min(1, 'ID utilisateur requis'),
  agent_nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  timestamp: z.string().datetime().optional()
})

export async function markPresence(data: PresenceData): Promise<PresenceConfirmation> {
  const validation = presenceSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError('Données de présence invalides', {
      errors: validation.error.flatten()
    })
  }

  const validated = validation.data

  try {
    const result = await presencesMark({
      session_id: validated.session_id,
      utilisateur_id: validated.utilisateur_id,
      agent_nom: validated.agent_nom,
      timestamp: validated.timestamp || new Date().toISOString()
    })

    log.presenceMarked(validated.session_id, validated.utilisateur_id)
    return result as PresenceConfirmation
  } catch (err) {
    log.error('Erreur lors du marquage de présence', err)
    throw new ApiError('Impossible de marquer la présence', 500)
  }
}

export async function getSessionPresences(sessionId: string): Promise<PresenceConfirmation[]> {
  try {
    const data = await presencesListBySession(sessionId)
    return data as PresenceConfirmation[]
  } catch (err) {
    log.error('Erreur lors de la récupération des présences', err)
    throw new ApiError('Impossible de récupérer les présences', 500)
  }
}

export async function verifyPresence(
  sessionId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await presencesVerify(sessionId, userId)
    return result.exists
  } catch {
    log.error('Erreur lors de la vérification de présence')
    return false
  }
}

export async function verifyAgentPresence(
  sessionId: string,
  agentNom: string
): Promise<boolean> {
  try {
    const result = await presencesVerifyAgent(sessionId, agentNom)
    return result.exists
  } catch {
    log.error('Erreur lors de la vérification de présence agent')
    return false
  }
}
