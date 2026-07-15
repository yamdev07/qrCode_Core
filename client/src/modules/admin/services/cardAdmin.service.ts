import { cardsList, cardsInsert, cardsIncrementScan } from '@core/database/databaseClient'
import { ApiError } from '@core/errors/AppError'
import { log } from '@core/logger/logger'
import type { CardRecord } from '@modules/generator/types/cards.types'

/** Données insérées dans la table `cards` à la génération d'une carte. */
export type NewCardRecord = {
  id: string
  nom: string
  prenoms: string
  poste: string
  qr_path: string | null
  view_url: string | null
}

/** Enregistre une carte dans la table `cards` (suivi & admin). */
export async function insertCardRecord(record: NewCardRecord): Promise<void> {
  try {
    await cardsInsert({
      id: record.id,
      nom: record.nom,
      prenoms: record.prenoms,
      poste: record.poste,
      qr_path: record.qr_path,
      view_url: record.view_url
    })
  } catch (err) {
    log.error('Échec enregistrement carte', err)
    throw new ApiError("Impossible d'enregistrer la carte", 500)
  }
}

/**
 * Incrémente le compteur de scans d'une carte via l'API backend.
 */
export async function incrementCardScan(cardId: string): Promise<void> {
  try {
    await cardsIncrementScan(cardId)
  } catch (err) {
    // Non bloquant pour l'affichage de la carte : on logge seulement.
    log.error('Échec incrément du compteur de scans', err)
  }
}

/** Liste toutes les cartes (réservé aux administrateurs connectés). */
export async function listCards(): Promise<CardRecord[]> {
  try {
    const data = await cardsList()
    return (data ?? []) as CardRecord[]
  } catch (err) {
    log.error('Échec listing des cartes', err)
    throw new ApiError('Impossible de charger les cartes', 500)
  }
}
