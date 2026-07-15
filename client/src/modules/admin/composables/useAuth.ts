import { ref, computed } from 'vue'
import { authLogin, authGetSession, authLogout } from '@core/database/databaseClient'
import { log } from '@core/logger/logger'

type AuthSession = {
  user: { id: string; email: string; role: string }
  access_token: string
}

const session = ref<AuthSession | null>(null)
const isReady = ref(false)
let initialized = false

/** Traduit les messages d'erreur d'auth courants. */
function translateAuthError(message: string): string {
  if (/invalid login credentials|incorrect/i.test(message)) {
    return 'Email ou mot de passe incorrect.'
  }
  return message
}

export function useAuth() {
  /** Charge la session courante depuis le token en localStorage (une seule fois). */
  async function init(): Promise<void> {
    if (initialized) return
    initialized = true

    // Restore token from localStorage
    const token = localStorage.getItem('auth_token')
    if (token) {
      try {
        const data = await authGetSession()
        session.value = data.session
      } catch {
        localStorage.removeItem('auth_token')
        session.value = null
      }
    }

    isReady.value = true
  }

  async function signIn(email: string, password: string): Promise<void> {
    try {
      const data = await authLogin(email, password)
      localStorage.setItem('auth_token', data.token)
      session.value = {
        user: data.user,
        access_token: data.token
      }
      log.info(`Connexion admin: ${email}`)
    } catch (err: any) {
      throw new Error(translateAuthError(err.message || 'Erreur de connexion'))
    }
  }

  async function signOut(): Promise<void> {
    try {
      await authLogout()
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('auth_token')
    session.value = null
  }

  const isAuthenticated = computed(() => session.value !== null)
  const userEmail = computed(() => session.value?.user.email ?? '')

  return { session, isReady, isAuthenticated, userEmail, init, signIn, signOut }
}
