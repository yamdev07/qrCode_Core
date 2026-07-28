import { log } from '@core/logger/logger'
import type { CardMeta, CardViewData } from '@modules/generator/types/cards.types'

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

export interface UploadResult {
  id: string
  slug: string
}

/** Upload une carte via l'API et retourne l'ID + slug. */
export async function uploadCardToLocal(
  _cardId: string,
  meta: CardMeta,
  imageDataUrls: string[]
): Promise<UploadResult> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: meta.nom,
        prenoms: meta.prenoms,
        poste: meta.poste,
        images: imageDataUrls
      })
    })
  } catch (e) {
    throw new Error(
      'Impossible de contacter le serveur. Vérifiez que le serveur backend est bien démarré.'
    )
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
    throw new Error(err.error || `Erreur serveur (${res.status})`)
  }

  const data = await res.json()

  log.info(`Carte sauvegardée sur le serveur: ${data.id}`)
  return { id: data.id, slug: data.slug }
}

/** Charge les données d'une carte depuis l'API (par slug). */
export async function getCardDataFromServer(slug: string): Promise<CardViewData> {
  const res = await fetch(`${API_BASE}/card/${encodeURIComponent(slug)}`)

  if (!res.ok) {
    if (res.status === 404) throw new Error('Carte introuvable')
    const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
    throw new Error(err.error || `Erreur serveur (${res.status})`)
  }

  return res.json()
}

/** Récupère la liste de toutes les cartes sur le serveur. */
export async function getCardsList(): Promise<
  { cardId: string; slug: string; nom: string; prenoms: string; poste: string; createdAt: string }[]
> {
  const res = await fetch(`${API_BASE}/cards-list`)
  if (!res.ok) return []
  return res.json()
}

/** Supprime une carte du serveur. */
export async function deleteCardFromServer(cardId: string): Promise<void> {
  await fetch(`${API_BASE}/card/delete/${cardId}`, { method: 'DELETE' })
}

/** URL de la page d'affichage de la carte (accessible depuis le téléphone). */
export function buildCardViewUrl(slug: string): string {
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
  return `${appUrl}/carte/${slug}`
}
