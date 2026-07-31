import { log } from '@core/logger/logger'
import { publicUrl } from '@core/config/appConfig'
import { authFetch } from '@core/api/authFetch'
import type { CardMeta, CardViewData } from '@modules/generator/types/cards.types'

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

/** Upload une carte via l'API et retourne l'ID. */
export async function uploadCardToLocal(
  _cardId: string,
  meta: CardMeta,
  imageDataUrls: string[]
): Promise<string> {
  let res: Response
  try {
    res = await authFetch(`${API_BASE}/upload`, {
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
  return data.id
}

/** Charge les données d'une carte depuis l'API. */
export async function getCardDataFromServer(cardId: string): Promise<CardViewData> {
  const res = await fetch(`${API_BASE}/card?id=${cardId}`)

  if (!res.ok) {
    if (res.status === 404) throw new Error('Carte introuvable')
    const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
    throw new Error(err.error || `Erreur serveur (${res.status})`)
  }

  return res.json()
}

/** Récupère la liste de toutes les cartes sur le serveur. */
export async function getCardsList(): Promise<
  { cardId: string; nom: string; prenoms: string; poste: string; createdAt: string }[]
> {
  const res = await authFetch(`${API_BASE}/cards-list`)
  if (!res.ok) return []
  return res.json()
}

/** Récupère l'IP serveur courante. */
export function getServerIp(): string {
  return window.location.hostname
}

/** Supprime une carte du serveur. */
export async function deleteCardFromServer(cardId: string): Promise<void> {
  await authFetch(`${API_BASE}/card/delete/${cardId}`, { method: 'DELETE' })
}

/** URL publique de la page d'affichage de la carte (encodée dans le QR code). */
export function buildCardViewUrl(cardId: string): string {
  return publicUrl(`carte/${cardId}`)
}
