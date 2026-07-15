import { storageUpload, storageGetPublicUrl, storageDownload } from '@core/database/supabaseClient'
import { ApiError, NotFoundError } from '@core/errors/AppError'
import { log } from '@core/logger/logger'
import { slugify } from '@modules/generator/services/qrCard.service'
import type {
  PersonCard,
  CardMeta,
  CardViewData
} from '@modules/generator/types/cards.types'

const META_FILE = 'meta.json'

/** Convertit une data URL en Blob (pour l'upload). */
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return res.blob()
}

/** Extension de fichier déduite du type MIME (défaut: png). */
function extFromBlob(blob: Blob): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg'
  }
  return map[blob.type] ?? 'png'
}

/** URL publique de la page d'affichage encodée dans le QR. */
export function buildCardViewUrl(cardId: string): string {
  return `${window.location.origin}/carte/${cardId}`
}

/**
 * Téléverse les images d'une personne et un fichier meta.json dans
 * `uploads/{cardId}/`, puis retourne l'URL publique de la page d'affichage.
 */
export async function uploadCard(person: PersonCard): Promise<string> {
  if (person.images.length === 0) {
    throw new ApiError("Aucune image à téléverser pour cette personne", 400)
  }

  const cardId = person.id
  const imagePaths: string[] = []

  for (let i = 0; i < person.images.length; i++) {
    const image = person.images[i]
    const blob = await dataUrlToBlob(image.dataUrl)
    const ext = extFromBlob(blob)
    const filename = `${String(i + 1).padStart(2, '0')}-${slugify(
      image.name.replace(/\.[^.]+$/, '')
    )}.${ext}`

    const path = await storageUpload(cardId, filename, blob)
    imagePaths.push(path)
  }

  const meta: CardMeta = {
    nom: person.nom,
    prenoms: person.prenoms,
    poste: person.poste,
    images: imagePaths,
    createdAt: new Date().toISOString()
  }

  const metaBlob = new Blob([JSON.stringify(meta)], { type: 'application/json' })
  await storageUpload(cardId, META_FILE, metaBlob)

  log.info(`Carte téléversée: ${cardId} (${imagePaths.length} image(s))`)
  return buildCardViewUrl(cardId)
}

/**
 * Téléverse le PNG du QR (avec logo) dans `uploads/{cardId}/qr.png` et
 * retourne son chemin de stockage (pour re-téléchargement depuis l'admin).
 */
export async function uploadQr(cardId: string, qrDataUrl: string): Promise<string> {
  const blob = await dataUrlToBlob(qrDataUrl)
  const path = await storageUpload(cardId, 'qr.png', blob)
  return path
}

/** URL publique d'un fichier stocké (ex: le QR stocké). */
export function getPublicUrl(path: string): string {
  return storageGetPublicUrl(path)
}

/**
 * Charge les données d'une carte pour la page d'affichage `/carte/:id` :
 * lit meta.json puis résout les URLs publiques des images.
 */
export async function getCardData(cardId: string): Promise<CardViewData> {
  let metaBlob: Blob
  try {
    metaBlob = await storageDownload(`${cardId}/${META_FILE}`)
  } catch {
    throw new NotFoundError('Carte introuvable', { cardId })
  }

  let meta: CardMeta
  try {
    meta = JSON.parse(await metaBlob.text()) as CardMeta
  } catch {
    throw new ApiError('Métadonnées de carte illisibles', 500, { cardId })
  }

  const imageUrls = meta.images.map(
    (imgPath) => storageGetPublicUrl(imgPath)
  )

  return { meta, imageUrls }
}
