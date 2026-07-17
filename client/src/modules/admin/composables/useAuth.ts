import { ref, computed } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@core/database/supabaseClient'
import { log } from '@core/logger/logger'

const session = ref<Session | null>(null)
const isReady = ref(false)
let initialized = false

/** Traduit les messages d'erreur d'auth Supabase courants. */
function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return 'Email ou mot de passe incorrect.'
  }
  if (/email not confirmed/i.test(message)) {
    return "L'email n'est pas confirmé."
  }
  return message
}

export function useAuth() {
  /** Charge la session courante et écoute les changements (une seule fois). */
  async function init(): Promise<void> {
    if (initialized) return
    initialized = true
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    supabase.auth.onAuthStateChange((_event: string, newSession: Session | null) => {
      session.value = newSession
    })
    isReady.value = true
  }

  async function signIn(email: string, password: string): Promise<void> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })
    if (error) {
      throw new Error(translateAuthError(error.message))
    }
    session.value = data.session
    log.info(`Connexion admin: ${email}`)
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut()
    session.value = null
  }

  const isAuthenticated = computed(() => session.value !== null)
  const userEmail = computed(() => session.value?.user.email ?? '')

  return { session, isReady, isAuthenticated, userEmail, init, signIn, signOut }
}
