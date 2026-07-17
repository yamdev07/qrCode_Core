import type { PresenceData, PresenceConfirmation } from '@modules/scanner/types/scanner.types'
import { z } from 'zod'
import { ValidationError, ApiError } from '@core/errors/AppError'
import { log } from '@core/logger/logger'

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

const presenceSchema = z.object({
  session_id: z.string().min(1, 'ID de session requis'),
  utilisateur_id: z.string().min(1, 'ID utilisateur requis'),
  agent_nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  timestamp: z.string().optional()
})

export async function markPresence(data: PresenceData): Promise<PresenceConfirmation> {
  const validation = presenceSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError('Données de présence invalides', {
      errors: validation.error.flatten()
    })
  }

  const validated = validation.data

  const res = await fetch(`${API}/presences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: validated.session_id,
      utilisateur_id: validated.utilisateur_id,
      agent_nom: validated.agent_nom,
      timestamp: validated.timestamp || new Date().toISOString()
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
    throw new ApiError(err.error || 'Impossible de marquer la présence', 500)
  }

  const result = await res.json()
  log.presenceMarked(validated.session_id, validated.utilisateur_id)
  return result
}

export async function getSessionPresences(sessionId: string): Promise<PresenceConfirmation[]> {
  const res = await fetch(`${API}/presences?session_id=${encodeURIComponent(sessionId)}`)
  if (!res.ok) throw new ApiError('Impossible de récupérer les présences', 500)
  return res.json()
}

export async function verifyPresence(sessionId: string, userId: string): Promise<boolean> {
  const res = await fetch(`${API}/presences/verify?session_id=${encodeURIComponent(sessionId)}&user_id=${encodeURIComponent(userId)}`)
  if (!res.ok) return false
  const data = await res.json()
  return data.data === true
}

export async function verifyAgentPresence(sessionId: string, agentNom: string): Promise<boolean> {
  const res = await fetch(`${API}/presences/verify-agent?session_id=${encodeURIComponent(sessionId)}&agent_nom=${encodeURIComponent(agentNom)}`)
  if (!res.ok) return false
  const data = await res.json()
  return data.data === true
}
