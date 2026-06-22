import { reactive, ref, computed } from 'vue'
import {
  generateQRCodeWithLogo,
  slugify,
  DEFAULT_CARD_DESIGN
} from '@modules/generator/services/qrCard.service'
import { uploadCard, uploadQr } from '@modules/generator/services/cardStorage.service'
import { insertCardRecord } from '@modules/admin/services/cardAdmin.service'
import { extractCardFields } from '@modules/generator/services/cardOcr.service'
import { downloadQRCode } from '@modules/generator/services/qrGenerator.service'
import { handleError } from '@core/errors/errorHandler'
import { personCardSchema } from '@core/utils/validators'
import { log } from '@core/logger/logger'
import type {
  PersonCard,
  CardImage,
  CardDesignOptions,
  GeneratedCard
} from '@modules/generator/types/cards.types'

function emptyPerson(): PersonCard {
  return {
    id: crypto.randomUUID(),
    nom: '',
    prenoms: '',
    poste: '',
    logo: null,
    images: []
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'))
    reader.readAsDataURL(file)
  })
}

// État partagé entre les composants de la vue Cartes.
const people = reactive<PersonCard[]>([emptyPerson()])
const design = reactive<CardDesignOptions>({ ...DEFAULT_CARD_DESIGN })
const generated = ref<GeneratedCard[]>([])
const isGenerating = ref(false)
const errorMessage = ref<string | null>(null)
// Personnes dont l'OCR est en cours (clé = id de la personne).
const ocrBusy = reactive<Record<string, boolean>>({})

/** Une personne est prête si nom valide + au moins une image. */
function isPersonReady(p: PersonCard): boolean {
  return personCardSchema.safeParse(p).success && p.images.length > 0
}

export function useQrCards() {
  const readyCount = computed(() => people.filter(isPersonReady).length)

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

  async function setLogoFromFile(id: string, file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Le logo doit être une image')
    }
    setLogo(id, await readFileAsDataUrl(file))
  }

  /** Ajoute une ou plusieurs images (que le QR affichera via l'URL). */
  async function addImages(id: string, files: FileList | File[]): Promise<void> {
    const person = people.find((p) => p.id === id)
    if (!person) return
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const image: CardImage = {
        id: crypto.randomUUID(),
        name: file.name,
        dataUrl: await readFileAsDataUrl(file)
      }
      person.images.push(image)
    }
  }

  function removeImage(personId: string, imageId: string): void {
    const person = people.find((p) => p.id === personId)
    if (!person) return
    const idx = person.images.findIndex((img) => img.id === imageId)
    if (idx !== -1) person.images.splice(idx, 1)
  }

  /**
   * Lit une image de carte par OCR et remplit Nom/Prénoms/Poste.
   * Ne remplace un champ que si l'OCR a trouvé une valeur.
   */
  async function readCardFromFile(personId: string, file: File): Promise<void> {
    const person = people.find((p) => p.id === personId)
    if (!person) return
    if (!file.type.startsWith('image/')) {
      throw new Error("Le fichier doit être une image de carte")
    }
    const dataUrl = await readFileAsDataUrl(file)
    ocrBusy[personId] = true
    try {
      const fields = await extractCardFields(dataUrl)
      if (fields.nom) person.nom = fields.nom
      if (fields.prenoms) person.prenoms = fields.prenoms
      if (fields.poste) person.poste = fields.poste
      if (!fields.nom && !fields.prenoms && !fields.poste) {
        throw new Error('Aucun champ détecté sur la carte. Vérifiez la netteté.')
      }
    } finally {
      ocrBusy[personId] = false
    }
  }

  /**
   * Pour chaque personne prête : téléverse ses images vers Supabase, récupère
   * l'URL de la page d'affichage, puis génère le QR (avec logo) qui pointe
   * vers cette URL. Une erreur sur une personne n'arrête pas les autres.
   */
  async function generate(): Promise<void> {
    errorMessage.value = null
    const ready = people.filter(isPersonReady)
    if (ready.length === 0) {
      errorMessage.value =
        'Ajoutez au moins une personne avec un nom et une image.'
      generated.value = []
      return
    }

    isGenerating.value = true
    try {
      generated.value = await Promise.all(
        ready.map((person) => generateOne(person))
      )
    } finally {
      isGenerating.value = false
    }
  }

  async function generateOne(person: PersonCard): Promise<GeneratedCard> {
    const base = {
      id: person.id,
      nom: person.nom,
      prenoms: person.prenoms,
      poste: person.poste
    }
    try {
      const viewUrl = await uploadCard(person)
      const qr = await generateQRCodeWithLogo(viewUrl, { ...design }, person.logo)
      const qrPath = await uploadQr(person.id, qr)
      await insertCardRecord({
        id: person.id,
        nom: person.nom,
        prenoms: person.prenoms,
        poste: person.poste,
        qr_path: qrPath,
        view_url: viewUrl
      })
      log.qrGenerated(viewUrl, design.size)
      return { ...base, viewUrl, qr, error: null }
    } catch (error) {
      const appError = handleError(error, 'useQrCards.generateOne')
      return { ...base, viewUrl: null, qr: null, error: appError.message }
    }
  }

  function downloadCard(card: GeneratedCard): void {
    if (!card.qr) return
    const label = slugify(`${card.nom}-${card.prenoms}`)
    downloadQRCode(card.qr, `${label}.png`)
  }

  async function downloadAll(): Promise<void> {
    for (const card of generated.value) {
      if (!card.qr) continue
      downloadCard(card)
      await new Promise((resolve) => setTimeout(resolve, 150))
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
    ocrBusy,
    readyCount,
    isPersonReady,
    addPerson,
    removePerson,
    setLogo,
    setLogoFromFile,
    addImages,
    removeImage,
    readCardFromFile,
    generate,
    downloadCard,
    downloadAll,
    reset
  }
}
