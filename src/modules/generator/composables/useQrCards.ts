import { reactive, ref, computed } from 'vue'
import {
  generateAllCards,
  slugify,
  DEFAULT_CARD_DESIGN
} from '@modules/generator/services/qrCard.service'
import { downloadQRCode } from '@modules/generator/services/qrGenerator.service'
import { handleError } from '@core/errors/errorHandler'
import { urlSchema } from '@core/utils/validators'
import type {
  PersonCard,
  CardDesignOptions,
  GeneratedCard
} from '@modules/generator/types/cards.types'

function emptyPerson(): PersonCard {
  return {
    id: crypto.randomUUID(),
    nom: '',
    rectoUrl: '',
    versoUrl: '',
    logo: null
  }
}

// État partagé entre les composants de la vue Cartes.
const people = reactive<PersonCard[]>([emptyPerson()])
const design = reactive<CardDesignOptions>({ ...DEFAULT_CARD_DESIGN })
const generated = ref<GeneratedCard[]>([])
const isGenerating = ref(false)
const errorMessage = ref<string | null>(null)

export function useQrCards() {
  const validCount = computed(
    () =>
      people.filter(
        (p) => p.rectoUrl.trim() && urlSchema.safeParse(p.rectoUrl).success
      ).length
  )

  function addPerson(): void {
    people.push(emptyPerson())
  }

  function removePerson(id: string): void {
    const idx = people.findIndex((p) => p.id === id)
    if (idx !== -1) people.splice(idx, 1)
    if (people.length === 0) people.push(emptyPerson())
  }

  function setLogo(id: string, dataUrl: string | null): void {
    const person = people.find((p) => p.id === id)
    if (person) person.logo = dataUrl
  }

  /** Lit un fichier image en data URL puis l'affecte comme logo. */
  function setLogoFromFile(id: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Le fichier doit être une image'))
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setLogo(id, typeof reader.result === 'string' ? reader.result : null)
        resolve()
      }
      reader.onerror = () => reject(new Error('Lecture du fichier impossible'))
      reader.readAsDataURL(file)
    })
  }

  async function generate(): Promise<void> {
    errorMessage.value = null
    isGenerating.value = true
    try {
      generated.value = await generateAllCards([...people], { ...design })
    } catch (error) {
      const appError = handleError(error, 'useQrCards.generate')
      errorMessage.value = appError.message
      generated.value = []
    } finally {
      isGenerating.value = false
    }
  }

  function downloadCard(card: GeneratedCard, side: 'recto' | 'verso'): void {
    const dataUrl = side === 'recto' ? card.recto : card.verso
    if (!dataUrl) return
    downloadQRCode(dataUrl, `${slugify(card.nom)}-${side}.png`)
  }

  /** Télécharge tous les QR générés (recto puis verso) séquentiellement. */
  async function downloadAll(): Promise<void> {
    for (const card of generated.value) {
      if (card.recto) {
        downloadQRCode(card.recto, `${slugify(card.nom)}-recto.png`)
        await waitFrame()
      }
      if (card.verso) {
        downloadQRCode(card.verso, `${slugify(card.nom)}-verso.png`)
        await waitFrame()
      }
    }
  }

  function reset(): void {
    people.splice(0, people.length, emptyPerson())
    generated.value = []
    errorMessage.value = null
    Object.assign(design, DEFAULT_CARD_DESIGN)
  }

  return {
    people,
    design,
    generated,
    isGenerating,
    errorMessage,
    validCount,
    addPerson,
    removePerson,
    setLogo,
    setLogoFromFile,
    generate,
    downloadCard,
    downloadAll,
    reset
  }
}

// Petit délai entre deux téléchargements pour éviter que le navigateur
// n'en bloque certains lorsqu'ils sont déclenchés en rafale.
function waitFrame(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 150))
}
