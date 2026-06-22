import { supabase } from '@core/database/supabaseClient'
import { ApiError, NotFoundError } from '@core/errors/AppError'
import { log } from '@core/logger/logger'
import { slugify } from '@modules/generator/services/qrCard.service'
import type {
  PersonCard,
  CardMeta,
  CardViewData
} from '@modules/generator/types/cards.types'

/** Bucket de stockage public à créer dans Supabase (Storage → New bucket → public). */
export const CARDS_BUCKET = 'cartes'

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
 * `cartes/{cardId}/`, puis retourne l'URL publique de la page d'affichage.
 */
export async function uploadCard(person: PersonCard): Promise<string> {
  if (person.images.length === 0) {
    throw new ApiError("Aucune image à téléverser pour cette personne", 400)
  }

  const cardId = person.id
  const storage = supabase.storage.from(CARDS_BUCKET)
  const imagePaths: string[] = []

  for (let i = 0; i < person.images.length; i++) {
    const image = person.images[i]
    const blob = await dataUrlToBlob(image.dataUrl)
    const ext = extFromBlob(blob)
    const path = `${cardId}/${String(i + 1).padStart(2, '0')}-${slugify(
      image.name.replace(/\.[^.]+$/, '')
    )}.${ext}`

    const { error } = await storage.upload(path, blob, {
      contentType: blob.type || 'image/png',
      upsert: true
    })

    if (error) {
      log.error(`Échec upload image ${path}`, error)
      throw new ApiError("Échec du téléversement d'une image", 500, {
        storageError: error.message
      })
    }
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
  const { error: metaError } = await storage.upload(
    `${cardId}/${META_FILE}`,
    metaBlob,
    { contentType: 'application/json', upsert: true }
  )

  if (metaError) {
    log.error('Échec upload meta.json', metaError)
    throw new ApiError('Échec du téléversement des métadonnées', 500, {
      storageError: metaError.message
    })
  }

  log.info(`Carte téléversée: ${cardId} (${imagePaths.length} image(s))`)
  return buildCardViewUrl(cardId)
}

/**
 * Téléverse le PNG du QR (avec logo) dans `cartes/{cardId}/qr.png` et
 * retourne son chemin de stockage (pour re-téléchargement depuis l'admin).
 */
export async function uploadQr(cardId: string, qrDataUrl: string): Promise<string> {
  const path = `${cardId}/qr.png`
  const blob = await dataUrlToBlob(qrDataUrl)
  const { error } = await supabase.storage
    .from(CARDS_BUCKET)
    .upload(path, blob, { contentType: 'image/png', upsert: true })

  if (error) {
    log.error(`Échec upload QR ${path}`, error)
    throw new ApiError('Échec du téléversement du QR', 500, {
      storageError: error.message
    })
  }
  return path
}

/** URL publique d'un fichier du bucket (ex: le QR stocké). */
export function getPublicUrl(path: string): string {
  return supabase.storage.from(CARDS_BUCKET).getPublicUrl(path).data.publicUrl
}

/**
 * Charge les données d'une carte pour la page d'affichage `/carte/:id` :
 * lit meta.json puis résout les URLs publiques des images.
 */
export async function getCardData(cardId: string): Promise<CardViewData> {
  const storage = supabase.storage.from(CARDS_BUCKET)

  const { data: metaBlob, error } = await storage.download(`${cardId}/${META_FILE}`)
  if (error || !metaBlob) {
    throw new NotFoundError('Carte introuvable', { cardId })
  }

  let meta: CardMeta
  try {
    meta = JSON.parse(await metaBlob.text()) as CardMeta
  } catch (e) {
    throw new ApiError('Métadonnées de carte illisibles', 500, { cardId })
  }

  const imageUrls = meta.images.map(
    (path) => storage.getPublicUrl(path).data.publicUrl
  )

  return { meta, imageUrls }
}
