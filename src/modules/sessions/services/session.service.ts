import { supabase } from '@core/database/supabaseClient'
import type { Session, SessionFormData, SessionWithPresenceCount } from '@modules/sessions/types/session.types'
import { sessionSchema } from '@core/utils/validators'
import { ValidationError, NotFoundError, ApiError } from '@core/errors/AppError'
import { log } from '@core/logger/logger'

function generateUniqueCode(): string {
  return crypto.randomUUID().split('-')[0].toUpperCase()
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

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      nom: validation.data.nom,
      code_unique: validation.data.code_unique,
      date: validation.data.date || new Date().toISOString()
    })
    .select('*')
    .single()

  if (error) {
    log.error('Erreur création session', error)
    throw new ApiError('Impossible de créer la session', 500, { dbError: error })
  }

  log.info(`Session créée: ${session.nom} (${session.code_unique})`)
  return session as Session
}

export async function getSessions(): Promise<SessionWithPresenceCount[]> {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*, presences(count)')
    .order('date', { ascending: false })

  if (error) {
    log.error('Erreur récupération sessions', error)
    throw new ApiError('Impossible de récupérer les sessions', 500, { dbError: error })
  }

  return (sessions as unknown as SessionWithPresenceCount[]).map(session => ({
    ...session,
    presence_count: (session as any).presences?.[0]?.count ?? 0
  }))
}

export async function getSessionById(id: string): Promise<Session> {
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !session) {
    throw new NotFoundError('Session introuvable', { sessionId: id })
  }

  return session as Session
}

export async function getSessionByCode(code: string): Promise<Session> {
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('code_unique', code)
    .single()

  if (error || !session) {
    throw new NotFoundError('Session introuvable', { code })
  }

  return session as Session
}

export async function updateSession(id: string, data: Partial<SessionFormData>): Promise<Session> {
  const { data: session, error } = await supabase
    .from('sessions')
    .update(data)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new ApiError('Impossible de mettre à jour la session', 500, { dbError: error })
  }

  log.info(`Session mise à jour: ${id}`)
  return session as Session
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)

  if (error) {
    throw new ApiError('Impossible de supprimer la session', 500, { dbError: error })
  }

  log.info(`Session supprimée: ${id}`)
}

export async function getSessionQRUrl(session: Session): Promise<string> {
  const baseUrl = window.location.origin
  return `${baseUrl}/presence/${session.code_unique}`
}
