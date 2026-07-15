import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSessions } from '@modules/sessions/composables/useSessions'

vi.mock('@core/database/databaseClient', () => ({
  sessionsList: vi.fn().mockResolvedValue([]),
  sessionsCreate: vi.fn(),
  sessionsGetById: vi.fn(),
  sessionsGetByCode: vi.fn(),
  sessionsUpdate: vi.fn(),
  sessionsDelete: vi.fn()
}))

describe('useSessions', () => {
  let sessionsHook: ReturnType<typeof useSessions>

  beforeEach(() => {
    sessionsHook = useSessions()
    vi.clearAllMocks()
  })

  it('devrait initialiser avec des valeurs par defaut', () => {
    expect(sessionsHook.sessions.value).toEqual([])
    expect(sessionsHook.isLoading.value).toBe(false)
    expect(sessionsHook.error.value).toBeNull()
    expect(sessionsHook.currentSession.value).toBeNull()
  })

  it('activeSessions devrait filtrer les sessions futures', () => {
    sessionsHook.sessions.value = [
      {
        id: '1', nom: 'Future', code_unique: 'ABC',
        date: new Date(Date.now() + 86400000).toISOString(),
        created_by: null, created_at: '', updated_at: '', presence_count: 0
      },
      {
        id: '2', nom: 'Passee', code_unique: 'DEF',
        date: new Date(Date.now() - 86400000).toISOString(),
        created_by: null, created_at: '', updated_at: '', presence_count: 5
      }
    ]

    expect(sessionsHook.activeSessions.value).toHaveLength(1)
    expect(sessionsHook.pastSessions.value).toHaveLength(1)
  })

  it('totalPresences devrait calculer la somme', () => {
    sessionsHook.sessions.value = [
      { presence_count: 3 } as any,
      { presence_count: 7 } as any
    ]
    expect(sessionsHook.totalPresences.value).toBe(10)
  })

  it('clearError devrait effacer les erreurs', () => {
    sessionsHook.error.value = 'Test error'
    sessionsHook.clearError()
    expect(sessionsHook.error.value).toBeNull()
  })
})
