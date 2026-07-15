import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuth } from '../composables/useAuth'
import { authLogin, authLogout } from '@core/database/supabaseClient'

vi.mock('@core/logger/logger', () => ({
  log: { info: vi.fn(), error: vi.fn(), debug: vi.fn() }
}))

vi.mock('@core/database/supabaseClient', () => ({
  authLogin: vi.fn(),
  authGetSession: vi.fn().mockResolvedValue({ session: null }),
  authLogout: vi.fn().mockResolvedValue({})
}))

const fakeUser = { id: '1', email: 'admin@test.com', role: 'admin' }

describe('useAuth composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('translates invalid credentials error', async () => {
    vi.mocked(authLogin).mockRejectedValue(new Error('Invalid login credentials'))

    const { signIn } = useAuth()
    await expect(signIn('a@b.com', 'wrong')).rejects.toThrow(
      'Email ou mot de passe incorrect.'
    )
  })

  it('signs in and exposes the user email', async () => {
    vi.mocked(authLogin).mockResolvedValue({
      token: 'fake-jwt-token',
      user: fakeUser
    })

    const { signIn, isAuthenticated, userEmail } = useAuth()
    await signIn('admin@test.com', 'good')

    expect(isAuthenticated.value).toBe(true)
    expect(userEmail.value).toBe('admin@test.com')
    expect(localStorage.getItem('auth_token')).toBe('fake-jwt-token')
  })

  it('signs out and clears the session', async () => {
    localStorage.setItem('auth_token', 'some-token')

    const { signOut, isAuthenticated } = useAuth()
    await signOut()

    expect(authLogout).toHaveBeenCalled()
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(isAuthenticated.value).toBe(false)
  })
})
