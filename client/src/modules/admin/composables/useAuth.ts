import { ref, computed } from 'vue'
import { getToken, setToken } from '@core/api/authFetch'
import { log } from '@core/logger/logger'

/**
 * Authentification admin — compte unique, jeton signé côté serveur.
 *
 * Remplace l'ancienne implémentation Supabase (abandonnée avec la migration
 * MySQL). L'état de connexion découle de la présence d'un jeton valide en
 * localStorage ; le serveur reste seul juge de sa validité.
 */
const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

const token = ref<string | null>(getToken())
const userName = ref<string>('')

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)
  const userEmail = computed(() => userName.value)

  async function signIn(username: string, password: string): Promise<void> {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Échec de connexion' }))
      throw new Error(err.error || 'Identifiant ou mot de passe incorrect.')
    }
    const data = await res.json()
    token.value = data.token
    userName.value = data.user
    setToken(data.token)
    log.info(`Connexion admin: ${data.user}`)
  }

  function signOut(): void {
    token.value = null
    userName.value = ''
    setToken(null)
  }

  /** Vérifie au démarrage si le jeton stocké est toujours valide. */
  async function init(): Promise<void> {
    if (!token.value) return
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      if (res.ok) {
        userName.value = (await res.json()).user
      } else {
        signOut()
      }
    } catch {
      // Hors-ligne : on garde le jeton, le serveur tranchera au prochain appel.
    }
    // Réagit à un 401 émis par authFetch (jeton expiré en cours d'usage).
    window.addEventListener('auth:expired', () => signOut())
  }

  return { isAuthenticated, userEmail, signIn, signOut, init }
}
