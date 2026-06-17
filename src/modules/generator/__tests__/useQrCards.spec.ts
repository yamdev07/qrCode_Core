import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useQrCards } from '../composables/useQrCards'

vi.mock('@core/logger/logger', () => ({
  log: {
    qrGenerated: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}))

describe('useQrCards composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useQrCards().reset()
  })

  it('starts with a single empty person', () => {
    const { people } = useQrCards()
    expect(people).toHaveLength(1)
    expect(people[0].nom).toBe('')
    expect(people[0].rectoUrl).toBe('')
    expect(people[0].logo).toBeNull()
  })

  it('adds and removes people, keeping at least one row', () => {
    const { people, addPerson, removePerson } = useQrCards()

    addPerson()
    addPerson()
    expect(people).toHaveLength(3)

    removePerson(people[0].id)
    expect(people).toHaveLength(2)

    removePerson(people[0].id)
    removePerson(people[0].id)
    expect(people).toHaveLength(1) // never drops below one
  })

  it('counts only people with a valid recto URL', () => {
    const { people, addPerson, validCount } = useQrCards()

    people[0].rectoUrl = 'https://example.com'
    addPerson()
    people[1].rectoUrl = 'not-a-url'

    expect(validCount.value).toBe(1)
  })

  it('sets and clears a logo', () => {
    const { people, setLogo } = useQrCards()
    const id = people[0].id

    setLogo(id, 'data:image/png;base64,AAA')
    expect(people[0].logo).toBe('data:image/png;base64,AAA')

    setLogo(id, null)
    expect(people[0].logo).toBeNull()
  })

  it('generates recto QR (and verso when provided) without a logo', async () => {
    const { people, generate, generated } = useQrCards()

    people[0].nom = 'Alice'
    people[0].rectoUrl = 'https://example.com/recto'
    people[0].versoUrl = 'https://example.com/verso'

    await generate()

    expect(generated.value).toHaveLength(1)
    const card = generated.value[0]
    expect(card.error).toBeNull()
    expect(card.recto).toContain('data:image/png;base64')
    expect(card.verso).toContain('data:image/png;base64')
  })

  it('leaves verso null when no verso URL is provided', async () => {
    const { people, generate, generated } = useQrCards()

    people[0].nom = 'Bob'
    people[0].rectoUrl = 'https://example.com'

    await generate()

    const card = generated.value[0]
    expect(card.recto).toContain('data:image/png;base64')
    expect(card.verso).toBeNull()
  })

  it('sets an error message when no valid person exists', async () => {
    const { generate, errorMessage, generated } = useQrCards()

    await generate()

    expect(errorMessage.value).toBeDefined()
    expect(generated.value).toHaveLength(0)
  })
})
