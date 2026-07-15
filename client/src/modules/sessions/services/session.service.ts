import {
  sessionsList,
  sessionsCreate,
  sessionsGetById,
  sessionsGetByCode,
  sessionsUpdate,
  sessionsDelete
} from '@core/database/databaseClient'
import type { Session, SessionFormData, SessionWithPresenceCount } from '@modules/sessions/types/session.types'
import { sessionSchema } from '@core/utils/validators'
import { ValidationError, NotFoundError, ApiError } from '@core/errors/AppError'
import { generateUUID } from '@core/utils/uuid'
import { log } from '@core/logger/logger'

function generateUniqueCode(): string {
  return generateUUID().split('-')[0].toUpperCase()
}

export async function createSession(data: SessionFormData): Promise<Session> {
  const isoDate = data.date ? new Date(data.date).toISOString() : new Date().toISOString()
  const validation = sessionSchema.safeParse({
    ...data,
    date: isoDate,
    code_unique: data.code_unique || generateUniqueCode()
  })

  if (!validation.success) {
    throw new ValidationError('Données de session invalides', {
      errors: validation.error.flatten()
    })
  }

  try {
    const result = await sessionsCreate({
      nom: validation.data.nom,
      code_unique: validation.data.code_unique || generateUniqueCode(),
      date: validation.data.date || new Date().toISOString()
    })

    const session = result as unknown as Session
    log.info(`Session créée: ${session.nom} (${session.code_unique})`)
    return session
  } catch (err) {
    log.error('Erreur création session', err)
    throw new ApiError('Impossible de créer la session', 500)
  }
}

export async function getSessions(): Promise<SessionWithPresenceCount[]> {
  try {
    const sessions = await sessionsList()
    return (sessions as unknown as SessionWithPresenceCount[]).map(session => ({
      ...session,
      presence_count: (session as any).presence_count ?? 0
    }))
  } catch (err) {
    log.error('Erreur récupération sessions', err)
    throw new ApiError('Impossible de récupérer les sessions', 500)
  }
}

export async function getSessionById(id: string): Promise<Session> {
  try {
    const session = await sessionsGetById(id)
    return session as Session
  } catch {
    throw new NotFoundError('Session introuvable', { sessionId: id })
  }
}

export async function getSessionByCode(code: string): Promise<Session> {
  try {
    const session = await sessionsGetByCode(code)
    return session as Session
  } catch {
    throw new NotFoundError('Session introuvable', { code })
  }
}

export async function updateSession(id: string, data: Partial<SessionFormData>): Promise<Session> {
  try {
    const session = await sessionsUpdate(id, data as Record<string, unknown>)
    log.info(`Session mise à jour: ${id}`)
    return session as Session
  } catch {
    throw new ApiError('Impossible de mettre à jour la session', 500)
  }
}

export async function deleteSession(id: string): Promise<void> {
  try {
    await sessionsDelete(id)
    log.info(`Session supprimée: ${id}`)
  } catch {
    throw new ApiError('Impossible de supprimer la session', 500)
  }
}

export async function getSessionQRUrl(session: Session): Promise<string> {
  const baseUrl = window.location.origin
  return `${baseUrl}/presence/${session.code_unique}`
}
