import QRCode from 'qrcode'
import { personCardSchema } from '@core/utils/validators'
import { ValidationError } from '@core/errors/AppError'
import { log } from '@core/logger/logger'
import type {
  PersonCard,
  CardDesignOptions,
  GeneratedCard
} from '@modules/generator/types/cards.types'

export const DEFAULT_CARD_DESIGN: CardDesignOptions = {
  size: 320,
  foreground: '#000000',
  background: '#FFFFFF',
  margin: 2,
  logoScale: 0.22
}

/** Charge une image (data URL ou URL) en HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image illisible'))
    img.src = src
  })
}

/** Dessine un rectangle arrondi (pavé blanc derrière le logo). */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

/**
 * Génère un QR code PNG (data URL) à partir d'une URL, avec un logo optionnel
 * composé en son centre. Le niveau de correction d'erreur est forcé à 'H'
 * lorsqu'un logo est présent pour préserver la lisibilité du code.
 */
export async function generateQRCodeWithLogo(
  url: string,
  design: CardDesignOptions,
  logo: string | null
): Promise<string> {
  const size = design.size

  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: logo ? 'H' : 'M',
    margin: design.margin,
    width: size,
    color: { dark: design.foreground, light: design.background }
  })

  if (!logo) return qrDataUrl

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return qrDataUrl

  const qrImg = await loadImage(qrDataUrl)
  ctx.drawImage(qrImg, 0, 0, size, size)

  try {
    const logoImg = await loadImage(logo)

    // Boîte cible du logo, centrée.
    const box = Math.round(size * design.logoScale)
    const pad = Math.round(box * 0.18)
    const plateSize = box + pad * 2
    const plateX = (size - plateSize) / 2
    const plateY = (size - plateSize) / 2

    // Pavé arrondi (couleur de fond) derrière le logo pour préserver le contraste.
    ctx.fillStyle = design.background
    roundedRect(ctx, plateX, plateY, plateSize, plateSize, plateSize * 0.18)
    ctx.fill()

    // Logo redimensionné en "contain" dans la boîte.
    const ratio = Math.min(box / logoImg.width, box / logoImg.height)
    const drawW = logoImg.width * ratio
    const drawH = logoImg.height * ratio
    ctx.drawImage(logoImg, (size - drawW) / 2, (size - drawH) / 2, drawW, drawH)
  } catch (error) {
    // Si le logo est illisible, on retourne le QR sans logo plutôt que d'échouer.
    log.error('Logo illisible, QR généré sans logo', error)
    return qrDataUrl
  }

  return canvas.toDataURL('image/png')
}

/**
 * Génère les QR recto (et verso si fourni) d'une personne.
 * Valide les données et n'échoue jamais globalement : l'erreur éventuelle
 * est retournée dans le champ `error` du résultat.
 */
export async function generatePersonCard(
  person: PersonCard,
  design: CardDesignOptions
): Promise<GeneratedCard> {
  const validation = personCardSchema.safeParse({
    nom: person.nom,
    rectoUrl: person.rectoUrl,
    versoUrl: person.versoUrl
  })

  if (!validation.success) {
    const flat = validation.error.flatten()
    const first =
      Object.values(flat.fieldErrors).flat()[0] ?? 'Données invalides'
    return { id: person.id, nom: person.nom, recto: null, verso: null, error: first }
  }

  try {
    const recto = await generateQRCodeWithLogo(person.rectoUrl, design, person.logo)
    const verso = person.versoUrl
      ? await generateQRCodeWithLogo(person.versoUrl, design, person.logo)
      : null

    log.qrGenerated(person.rectoUrl, design.size)
    return { id: person.id, nom: person.nom, recto, verso, error: null }
  } catch (error) {
    log.error(`Échec génération carte pour ${person.nom}`, error)
    return {
      id: person.id,
      nom: person.nom,
      recto: null,
      verso: null,
      error: 'Échec de génération'
    }
  }
}

/** Génère toutes les cartes en lot. */
export async function generateAllCards(
  people: PersonCard[],
  design: CardDesignOptions
): Promise<GeneratedCard[]> {
  const valid = people.filter((p) => p.nom.trim() || p.rectoUrl.trim())
  if (valid.length === 0) {
    throw new ValidationError('Ajoutez au moins une personne avec une URL recto')
  }
  return Promise.all(valid.map((p) => generatePersonCard(p, design)))
}

/** Slugifie un nom pour en faire un nom de fichier sûr. */
export function slugify(value: string): string {
  return (
    value
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'carte'
  )
}
