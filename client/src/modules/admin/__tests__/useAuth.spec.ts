import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuth } from '../composables/useAuth'
import { supabase } from '@core/database/supabaseClient'

vi.mock('@core/logger/logger', () => ({
  log: { info: vi.fn(), error: vi.fn() }
}))

vi.mock('@core/database/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn()
    }
  }
}))

const fakeSession = { user: { email: 'admin@test.com' } }

describe('useAuth composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('translates invalid credentials error', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid login credentials' }
    } as never)

    const { signIn } = useAuth()
    await expect(signIn('a@b.com', 'wrong')).rejects.toThrow(
      'Email ou mot de passe incorrect.'
    )
  })

  it('signs in and exposes the user email', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: fakeSession, user: fakeSession.user },
      error: null
    } as never)

    const { signIn, isAuthenticated, userEmail } = useAuth()
    await signIn('admin@test.com', 'good')

    expect(isAuthenticated.value).toBe(true)
    expect(userEmail.value).toBe('admin@test.com')
  })

  it('signs out and clears the session', async () => {
    const { signOut, isAuthenticated } = useAuth()
    await signOut()

    expect(supabase.auth.signOut).toHaveBeenCalled()
    expect(isAuthenticated.value).toBe(false)
  })
})
