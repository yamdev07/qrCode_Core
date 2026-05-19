import { supabase } from '@core/database/supabaseClient'
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

  const { data: result, error } = await supabase
    .from('presences')
    .insert({
      session_id: validated.session_id,
      utilisateur_id: validated.utilisateur_id,
      agent_nom: validated.agent_nom,
      timestamp: validated.timestamp || new Date().toISOString()
    })
    .select('id, session_id, utilisateur_id, agent_nom, created_at')
    .single()

  if (error) {
    log.error('Erreur lors du marquage de présence', error)
    throw new ApiError('Impossible de marquer la présence', 500, { dbError: error })
  }

  log.presenceMarked(validated.session_id, validated.utilisateur_id)
  return result as PresenceConfirmation
}

export async function getSessionPresences(sessionId: string): Promise<PresenceConfirmation[]> {
  const { data, error } = await supabase
    .from('presences')
    .select('id, session_id, utilisateur_id, agent_nom, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) {
    log.error('Erreur lors de la récupération des présences', error)
    throw new ApiError('Impossible de récupérer les présences', 500, { dbError: error })
  }

  return data as PresenceConfirmation[]
}

export async function verifyPresence(
  sessionId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('presences')
    .select('id')
    .eq('session_id', sessionId)
    .eq('utilisateur_id', userId)
    .maybeSingle()

  if (error) {
    log.error('Erreur lors de la vérification de présence', error)
    return false
  }

  return data !== null
}

export async function verifyAgentPresence(
  sessionId: string,
  agentNom: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('presences')
    .select('id')
    .eq('session_id', sessionId)
    .eq('agent_nom', agentNom)
    .maybeSingle()

  if (error) {
    log.error('Erreur lors de la vérification de présence agent', error)
    return false
  }

  return data !== null
}
