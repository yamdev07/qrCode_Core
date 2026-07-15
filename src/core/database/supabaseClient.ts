// src/core/database/supabaseClient.ts
// Replaced: was Supabase JS client. Now wraps the local backend API.
import { apiGet, apiPost, apiPut, apiDelete } from '@core/api/apiClient'
import { log } from '@core/logger/logger'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

log.info(`API backend: ${API_URL}`)

// ─── Cards ────────────────────────────────────────────────────────────
export async function cardsList() {
  return apiGet<any[]>(`${API_URL}/api/cards`)
}

export async function cardsInsert(record: {
  id: string
  nom: string
  prenoms?: string
  poste?: string
  qr_path?: string | null
  view_url?: string | null
}) {
  return apiPost(`${API_URL}/api/cards`, record)
}

export async function cardsGetById(id: string) {
  return apiGet<any>(`${API_URL}/api/cards/${id}`)
}

export async function cardsIncrementScan(id: string) {
  return apiPost(`${API_URL}/api/cards/${id}/scan`)
}

// ─── Sessions ─────────────────────────────────────────────────────────
export async function sessionsList() {
  return apiGet<any[]>(`${API_URL}/api/sessions`)
}

export async function sessionsGetById(id: string) {
  return apiGet<any>(`${API_URL}/api/sessions/${id}`)
}

export async function sessionsGetByCode(code: string) {
  return apiGet<any>(`${API_URL}/api/sessions/code/${code}`)
}

export async function sessionsCreate(data: {
  nom: string
  code_unique?: string
  date?: string
  created_by?: string | null
}): Promise<Record<string, unknown>> {
  return apiPost<Record<string, unknown>>(`${API_URL}/api/sessions`, data)
}

export async function sessionsUpdate(id: string, data: Record<string, unknown>) {
  return apiPut(`${API_URL}/api/sessions/${id}`, data)
}

export async function sessionsDelete(id: string) {
  return apiDelete(`${API_URL}/api/sessions/${id}`)
}

// ─── Presences ────────────────────────────────────────────────────────
export async function presencesMark(data: {
  session_id: string
  utilisateur_id: string
  agent_nom: string
  timestamp?: string
}) {
  return apiPost(`${API_URL}/api/presences`, data)
}

export async function presencesListBySession(sessionId: string) {
  return apiGet<any[]>(`${API_URL}/api/presences/session/${sessionId}`)
}

export async function presencesVerify(sessionId: string, userId: string) {
  return apiGet<{ exists: boolean }>(
    `${API_URL}/api/presences/verify/${sessionId}/${userId}`
  )
}

export async function presencesVerifyAgent(sessionId: string, agentNom: string) {
  return apiGet<{ exists: boolean }>(
    `${API_URL}/api/presences/verify-agent/${sessionId}/${agentNom}`
  )
}

// ─── Auth ─────────────────────────────────────────────────────────────
export async function authLogin(email: string, password: string) {
  return apiPost<{ token: string; user: { id: string; email: string; role: string } }>(
    `${API_URL}/api/auth/login`,
    { email, password }
  )
}

export async function authGetSession() {
  return apiGet<{ session: { user: { id: string; email: string; role: string }; access_token: string } | null }>(
    `${API_URL}/api/auth/session`
  )
}

export async function authLogout() {
  return apiPost(`${API_URL}/api/auth/logout`)
}

// ─── Storage ──────────────────────────────────────────────────────────
export function storageGetPublicUrl(path: string): string {
  return `${API_URL}/uploads/${path}`
}

export async function storageUpload(
  cardId: string,
  filename: string,
  blob: Blob
): Promise<string> {
  const formData = new FormData()
  formData.append('file', blob, filename)

  const token = localStorage.getItem('auth_token')
  const res = await fetch(`${API_URL}/api/storage/${cardId}/${filename}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  })

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.statusText}`)
  }

  const data = await res.json()
  return data.path as string
}

export async function storageDownload(path: string): Promise<Blob> {
  const res = await fetch(`${API_URL}/uploads/${path}`)
  if (!res.ok) {
    throw new Error(`Download failed: ${res.statusText}`)
  }
  return res.blob()
}

log.info('Client API local initialisé')
