import { supabase } from '@core/database/supabaseClient'
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
  const { error } = await supabase.from('cards').insert({
    id: record.id,
    nom: record.nom,
    prenoms: record.prenoms,
    poste: record.poste,
    qr_path: record.qr_path,
    view_url: record.view_url
  })

  if (error) {
    log.error('Échec enregistrement carte', error)
    throw new ApiError("Impossible d'enregistrer la carte", 500, {
      dbError: error.message
    })
  }
}

/**
 * Incrémente le compteur de scans d'une carte via une fonction RPC
 * `increment_card_scan` (SECURITY DEFINER) — fonctionne avec la clé anon
 * sans donner d'accès en lecture à la table.
 */
export async function incrementCardScan(cardId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_card_scan', { card_id: cardId })
  if (error) {
    // Non bloquant pour l'affichage de la carte : on logge seulement.
    log.error('Échec incrément du compteur de scans', error)
  }
}

/** Liste toutes les cartes (réservé aux administrateurs connectés). */
export async function listCards(): Promise<CardRecord[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    log.error('Échec listing des cartes', error)
    throw new ApiError('Impossible de charger les cartes', 500, {
      dbError: error.message
    })
  }

  return (data ?? []) as CardRecord[]
}
