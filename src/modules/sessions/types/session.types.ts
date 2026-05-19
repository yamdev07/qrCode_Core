export type Session = {
  id: string
  nom: string
  code_unique: string
  date: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export type SessionFormData = {
  nom: string
  code_unique: string
  date: string
}

export type SessionWithPresenceCount = Session & {
  presence_count: number
}

export type PresenceRecord = {
  id: string
  session_id: string
  utilisateur_id: string
  timestamp: string
  created_at: string
}

export type SessionsState = {
  sessions: SessionWithPresenceCount[]
  currentSession: Session | null
  presences: PresenceRecord[]
  isLoading: boolean
  error: string | null
}
