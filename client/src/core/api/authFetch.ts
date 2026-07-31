/**
 * fetch() qui joint automatiquement le jeton admin.
 *
 * Utilisé par les services touchant aux routes protégées. Un 401 (jeton expiré
 * ou absent) purge la session locale, pour que la garde de routes redirige vers
 * la connexion.
 */
const TOKEN_KEY = 'qr-admin-token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(input, { ...init, headers })

  if (res.status === 401) {
    setToken(null)
    // Signale à l'app que la session a expiré (la garde de routes réagit).
    window.dispatchEvent(new CustomEvent('auth:expired'))
  }

  return res
}
