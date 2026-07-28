import { ApiError, NotFoundError } from '@core/errors/AppError'
import { log } from '@core/logger/logger'
import type { Session, SessionFormData, SessionWithPresenceCount } from '@modules/sessions/types/session.types'

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

function generateUniqueCode(): string {
  return crypto.randomUUID().split('-')[0].toUpperCase()
}

export async function createSession(data: SessionFormData): Promise<Session> {
  const res = await fetch(`${API}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nom: data.nom,
      code_unique: data.code_unique || generateUniqueCode(),
      date: data.date || new Date().toISOString()
    })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
    throw new ApiError(err.error || 'Impossible de créer la session', 500)
  }
  const session = await res.json()
  log.info(`Session créée: ${session.nom} (${session.code_unique})`)
  return session
}

export async function getSessions(): Promise<SessionWithPresenceCount[]> {
  const res = await fetch(`${API}/sessions`)
  if (!res.ok) throw new ApiError('Impossible de récupérer les sessions', 500)
  const sessions: SessionWithPresenceCount[] = await res.json()
  return sessions.map(s => ({
    ...s,
    presence_count: (s as any).presence_count ?? 0
  }))
}

export async function getSessionById(id: string): Promise<Session> {
  const res = await fetch(`${API}/sessions/${id}`)
  if (res.status === 404) throw new NotFoundError('Session introuvable', { sessionId: id })
  if (!res.ok) throw new ApiError('Erreur serveur', 500)
  return res.json()
}

export async function getSessionByCode(code: string): Promise<Session> {
  const res = await fetch(`${API}/sessions/lookup?code=${encodeURIComponent(code)}`)
  if (res.status === 404) throw new NotFoundError('Session introuvable', { code })
  if (!res.ok) throw new ApiError('Erreur serveur', 500)
  return res.json()
}

export async function updateSession(id: string, data: Partial<SessionFormData>): Promise<Session> {
  const res = await fetch(`${API}/sessions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new ApiError('Impossible de mettre à jour la session', 500)
  log.info(`Session mise à jour: ${id}`)
  return res.json()
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`${API}/sessions/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new ApiError('Impossible de supprimer la session', 500)
  log.info(`Session supprimée: ${id}`)
}

export async function getSessionQRUrl(session: Session): Promise<string> {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
  return `${baseUrl}/presence/${session.code_unique}`
}
