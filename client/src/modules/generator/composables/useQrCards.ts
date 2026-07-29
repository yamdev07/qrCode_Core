import { reactive, ref, computed } from 'vue'
import {
  generateQRCodeWithLogo,
  slugify,
  DEFAULT_CARD_DESIGN
} from '@modules/generator/services/qrCard.service'
import {
  uploadCardToLocal,
  buildCardViewUrl,
  getCardsList,
  deleteCardFromServer
} from '@modules/generator/services/localCardStorage.service'
import { extractCardFields } from '@modules/generator/services/cardOcr.service'
import { downloadQRCode } from '@modules/generator/services/qrGenerator.service'
import { saveQrCode, findQrCodeByUrl, getQrCodeImageUrl } from '@modules/generator/services/qrStorage.service'
import { handleError } from '@core/errors/errorHandler'
import { personCardSchema } from '@core/utils/validators'
import { log } from '@core/logger/logger'
import type {
  PersonCard,
  CardImage,
  CardDesignOptions,
  GeneratedCard
} from '@modules/generator/types/cards.types'

const STORAGE_KEY = 'qr-generated-cards'

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

const MAX_WIDTH = 800
const MAX_HEIGHT = 800
const JPEG_QUALITY = 0.6

async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return readFileAsDataUrl(file)
  }
  const dataUrl = await readFileAsDataUrl(file)
  return new Promise<string>((resolve) => {
    const img = new Image()
    img.onload = () => {
      let w = img.width
      let h = img.height
      if (w > MAX_WIDTH || h > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / w, MAX_HEIGHT / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(dataUrl); return }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
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

/** Sauvegarde les cartes générées en localStorage (sans les grosses data URLs QR). */
function saveGeneratedToStorage(cards: GeneratedCard[]): void {
  try {
    const lite = cards.map((c) => ({
      id: c.id,
      nom: c.nom,
      prenoms: c.prenoms,
      poste: c.poste,
      viewUrl: c.viewUrl,
      error: c.error
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lite))
  } catch { /* quota dépassé, on ignore */ }
}

/** Supprime l'entrée localStorage. */
function clearGeneratedStorage(): void {
  localStorage.removeItem(STORAGE_KEY)
}

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
    setLogo(id, await compressImage(file))
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
        dataUrl: await compressImage(file)
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
   * Pour chaque personne prête : sauvegarde les images en local (IndexedDB),
   * génère le QR (avec logo) qui pointe vers la page d'affichage locale.
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
      const results = await Promise.all(
        ready.map((person) => generateOne(person))
      )
      // Fusionne : garde les anciens + ajoute les nouveaux (évite les doublons par id)
      const existants = generated.value.filter(
        (g) => !results.find((r) => r.id === g.id)
      )
      generated.value = [...existants, ...results]
      saveGeneratedToStorage(generated.value)
    } catch (error) {
      const appError = handleError(error, 'useQrCards.generate')
      errorMessage.value = appError.message
      generated.value = []
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
      const imageDataUrls = person.images.map((img) => img.dataUrl)
      const result = await uploadCardToLocal(person.id, {
        nom: person.nom,
        prenoms: person.prenoms,
        poste: person.poste,
        images: imageDataUrls,
        createdAt: new Date().toISOString()
      }, imageDataUrls)

      const viewUrl = buildCardViewUrl(result.slug)
      const qr = await generateQRCodeWithLogo(viewUrl, { ...design }, person.logo)

      // Sauvegarder le QR code dans la base PostgreSQL
      if (qr) {
        saveQrCode(viewUrl, qr, {
          format: 'png',
          size: design.size,
          margin: design.margin,
          foreground: design.foreground,
          background: design.background,
          errorCorrectionLevel: 'H'
        }).catch((err) => console.error('Erreur sauvegarde QR carte:', err))
      }

      log.qrGenerated(viewUrl, design.size)
      return { ...base, viewUrl, qr, error: null }
    } catch (error) {
      const appError = handleError(error, 'useQrCards.generateOne')
      return { ...base, viewUrl: null, qr: null, error: appError.message }
    }
  }

  async function downloadCard(card: GeneratedCard): Promise<void> {
    if (!card.qr) return
    const label = slugify(`${card.nom}-${card.prenoms}`)
    if (card.qr.startsWith('/uploads/')) {
      const res = await fetch(card.qr)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      downloadQRCode(url, `${label}.png`)
      URL.revokeObjectURL(url)
    } else {
      downloadQRCode(card.qr, `${label}.png`)
    }
  }

  async function downloadAll(): Promise<void> {
    for (const card of generated.value) {
      if (!card.qr) continue
      await downloadCard(card)
      await new Promise((resolve) => setTimeout(resolve, 150))
    }
  }

  async function removeCard(cardId: string): Promise<void> {
    generated.value = generated.value.filter((c) => c.id !== cardId)
    saveGeneratedToStorage(generated.value)
    try { await deleteCardFromServer(cardId) } catch { /* ignore */ }
  }

  function reset(): void {
    people.splice(0, people.length, emptyPerson())
    generated.value = []
    errorMessage.value = null
    clearGeneratedStorage()
    Object.assign(design, DEFAULT_CARD_DESIGN)
  }

  /**
   * Restaure les cartes générées depuis le serveur + localStorage.
   * Appelée au démarrage pour que les QR codes persistent après rafraîchissement.
   */
  async function restoreGeneratedCards(): Promise<void> {
    if (generated.value.length > 0) return

    try {
      const serverCards = await getCardsList()
      if (serverCards.length === 0) return

      const toRestore = serverCards.slice(0, 20)
      const results: GeneratedCard[] = []

      for (const card of toRestore) {
        try {
          const viewUrl = buildCardViewUrl(card.slug)

          // Chercher le QR stocké en base (avec logo inclus)
          const stored = await findQrCodeByUrl(viewUrl)
          if (stored?.image_path) {
            const qr = getQrCodeImageUrl(stored.image_path)
            results.push({ id: card.cardId, nom: card.nom, prenoms: card.prenoms, poste: card.poste, viewUrl, qr, error: null })
          } else {
            // Fallback : régénérer sans logo
            const qr = await generateQRCodeWithLogo(viewUrl, { ...DEFAULT_CARD_DESIGN }, null)
            results.push({ id: card.cardId, nom: card.nom, prenoms: card.prenoms, poste: card.poste, viewUrl, qr, error: null })
          }
        } catch {
          results.push({ id: card.cardId, nom: card.nom, prenoms: card.prenoms, poste: card.poste, viewUrl, qr: null, error: 'QR non regénéré' })
        }
      }

      generated.value = results
      saveGeneratedToStorage(results)
    } catch {
      // Serveur indisponible, on garde ce qu'on a
    }
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
    restoreGeneratedCards,
    downloadCard,
    downloadAll,
    removeCard,
    reset
  }
}
