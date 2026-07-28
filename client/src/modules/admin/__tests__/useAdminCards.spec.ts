import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAdminCards } from '../composables/useAdminCards'
import { listCards } from '../services/cardAdmin.service'
import type { CardRecord } from '@modules/generator/types/cards.types'

vi.mock('@core/logger/logger', () => ({
  log: { info: vi.fn(), error: vi.fn() }
}))

vi.mock('@modules/admin/services/cardAdmin.service', () => ({
  listCards: vi.fn()
}))

vi.mock('@modules/generator/services/cardStorage.service', () => ({
  getPublicUrl: (path: string) => `https://cdn.test/${path}`
}))

function card(partial: Partial<CardRecord>): CardRecord {
  return {
    id: 'id',
    nom: 'NOM',
    prenoms: '',
    poste: '',
    qr_path: null,
    view_url: null,
    scan_count: 0,
    created_at: '2026-01-01T00:00:00Z',
    ...partial
  }
}

describe('useAdminCards composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads cards and sums scan counts', async () => {
    vi.mocked(listCards).mockResolvedValue([
      card({ id: 'a', scan_count: 5 }),
      card({ id: 'b', scan_count: 7 })
    ])

    const { load, cards, totalScans } = useAdminCards()
    await load()

    expect(cards.value).toHaveLength(2)
    expect(totalScans.value).toBe(12)
  })

  it('sets an error message when loading fails', async () => {
    vi.mocked(listCards).mockRejectedValue(new Error('boom'))

    const { load, cards, errorMessage } = useAdminCards()
    await load()

    expect(errorMessage.value).toBeTruthy()
    expect(cards.value).toHaveLength(0)
  })

  it('fetches the stored QR public url on re-download', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ blob: async () => new Blob(['x']) })
    vi.stubGlobal('fetch', fetchMock)
    const createObjectURL = vi.fn(() => 'blob:fake')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    const { downloadQr } = useAdminCards()
    await downloadQr(card({ id: 'c', qr_path: 'c/qr.png' }))

    expect(fetchMock).toHaveBeenCalledWith('https://cdn.test/c/qr.png')
    expect(createObjectURL).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('does nothing when the card has no stored QR', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { downloadQr } = useAdminCards()
    await downloadQr(card({ qr_path: null }))

    expect(fetchMock).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
