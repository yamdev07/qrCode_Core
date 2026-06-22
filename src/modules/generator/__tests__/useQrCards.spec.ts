import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useQrCards } from '../composables/useQrCards'

vi.mock('@core/logger/logger', () => ({
  log: {
    qrGenerated: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}))

// On évite tout appel réseau Supabase : l'upload retourne une fausse URL.
vi.mock('@modules/generator/services/cardStorage.service', () => ({
  uploadCard: vi.fn(async (person: { id: string }) => `https://app.test/carte/${person.id}`),
  uploadQr: vi.fn(async (id: string) => `${id}/qr.png`),
  buildCardViewUrl: (id: string) => `https://app.test/carte/${id}`,
  getPublicUrl: (path: string) => `https://app.test/${path}`,
  getCardData: vi.fn(),
  CARDS_BUCKET: 'cartes'
}))

vi.mock('@modules/admin/services/cardAdmin.service', () => ({
  insertCardRecord: vi.fn(async () => undefined),
  incrementCardScan: vi.fn(async () => undefined),
  listCards: vi.fn(async () => [])
}))

const PNG = 'data:image/png;base64,AAAA'

function fillPerson(p: { nom: string; prenoms: string; poste: string; images: unknown[] }) {
  p.nom = 'FASSINOU'
  p.prenoms = 'Diane'
  p.poste = 'Juriste Collaboratrice'
  p.images.push({ id: 'img-1', name: 'recto.png', dataUrl: PNG })
}

describe('useQrCards composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useQrCards().reset()
  })

  it('starts with a single empty person', () => {
    const { people } = useQrCards()
    expect(people).toHaveLength(1)
    expect(people[0].nom).toBe('')
    expect(people[0].images).toHaveLength(0)
    expect(people[0].logo).toBeNull()
  })

  it('adds and removes people, keeping at least one row', () => {
    const { people, addPerson, removePerson } = useQrCards()

    addPerson()
    addPerson()
    expect(people).toHaveLength(3)

    removePerson(people[0].id)
    removePerson(people[0].id)
    removePerson(people[0].id)
    expect(people).toHaveLength(1)
  })

  it('counts a person as ready only with a name and at least one image', () => {
    const { people, readyCount } = useQrCards()
    expect(readyCount.value).toBe(0)

    people[0].nom = 'FASSINOU'
    expect(readyCount.value).toBe(0) // pas d'image

    people[0].images.push({ id: 'i', name: 'a.png', dataUrl: PNG })
    expect(readyCount.value).toBe(1)
  })

  it('removes an image by id', () => {
    const { people, removeImage } = useQrCards()
    people[0].images.push({ id: 'i1', name: 'a.png', dataUrl: PNG })
    people[0].images.push({ id: 'i2', name: 'b.png', dataUrl: PNG })

    removeImage(people[0].id, 'i1')
    expect(people[0].images.map((x) => x.id)).toEqual(['i2'])
  })

  it('sets and clears a logo', () => {
    const { people, setLogo } = useQrCards()
    setLogo(people[0].id, PNG)
    expect(people[0].logo).toBe(PNG)
    setLogo(people[0].id, null)
    expect(people[0].logo).toBeNull()
  })

  it('uploads then generates a QR pointing to the view URL', async () => {
    const { people, generate, generated } = useQrCards()
    fillPerson(people[0])

    await generate()

    expect(generated.value).toHaveLength(1)
    const card = generated.value[0]
    expect(card.error).toBeNull()
    expect(card.viewUrl).toContain('/carte/')
    expect(card.qr).toContain('data:image/png;base64')
    expect(card.poste).toBe('Juriste Collaboratrice')
  })

  it('sets an error message when no person is ready', async () => {
    const { generate, errorMessage, generated } = useQrCards()
    await generate()
    expect(errorMessage.value).toBeDefined()
    expect(generated.value).toHaveLength(0)
  })

  it('records a per-person error when upload fails', async () => {
    const storage = await import('@modules/generator/services/cardStorage.service')
    vi.mocked(storage.uploadCard).mockRejectedValueOnce(new Error('Boom upload'))

    const { people, generate, generated } = useQrCards()
    fillPerson(people[0])

    await generate()

    expect(generated.value[0].error).toBeTruthy()
    expect(generated.value[0].qr).toBeNull()
  })
})
