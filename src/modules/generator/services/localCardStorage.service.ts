import { log } from '@core/logger/logger'
import type { CardMeta, CardViewData } from '@modules/generator/types/cards.types'

const API_BASE = '/qrCode_Core/api'

/** IP du serveur détectée lors de l'upload. */
let serverIp: string | null = null

/** Upload une carte via l'API PHP et retourne l'ID. */
export async function uploadCardToLocal(
  _cardId: string,
  meta: CardMeta,
  imageDataUrls: string[]
): Promise<string> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/upload.php`, {
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
      'Impossible de contacter le serveur. Vérifiez qu\'Apache/XAMPP est bien démarré.'
    )
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
    throw new Error(err.error || `Erreur serveur (${res.status})`)
  }

  const data = await res.json()

  if (data.serverIp) {
    serverIp = data.serverIp
    log.info(`IP serveur détectée: ${serverIp}`)
  }

  log.info(`Carte sauvegardée sur le serveur: ${data.id}`)
  return data.id
}

/** Charge les données d'une carte depuis l'API PHP. */
export async function getCardDataFromServer(cardId: string): Promise<CardViewData> {
  const res = await fetch(`${API_BASE}/card.php?id=${cardId}`)

  if (!res.ok) {
    if (res.status === 404) throw new Error('Carte introuvable')
    const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
    throw new Error(err.error || `Erreur serveur (${res.status})`)
  }

  return res.json()
}

/** URL de la page d'affichage de la carte (accessible depuis le téléphone). */
export function buildCardViewUrl(cardId: string): string {
  const ip = serverIp || window.location.hostname
  return `https://${ip}:3000/carte/${cardId}`
}
