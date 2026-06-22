// Types pour la génération de cartes professionnelles :
// champs Nom/Prénoms/Poste + images uploadées dont le QR affiche l'URL.

/** Image choisie pour une personne, conservée en mémoire avant upload. */
export type CardImage = {
  id: string
  name: string
  /** Contenu de l'image en data URL (avant upload). */
  dataUrl: string
}

/** Une personne saisie manuellement dans la liste. */
export type PersonCard = {
  id: string
  nom: string
  prenoms: string
  poste: string
  /** Logo propre à la personne, en data URL, ou null. */
  logo: string | null
  /** Images à héberger ; l'URL générée les affichera. */
  images: CardImage[]
}

/** Options d'apparence partagées par tous les QR générés. */
export type CardDesignOptions = {
  size: number
  foreground: string
  background: string
  margin: number
  /** Taille du logo en proportion du QR (0.1 = 10%). */
  logoScale: number
}

/** Métadonnées stockées avec les images (lues par la page d'affichage). */
export type CardMeta = {
  nom: string
  prenoms: string
  poste: string
  /** Chemins des images dans le bucket, dans l'ordre d'affichage. */
  images: string[]
  createdAt: string
}

/** Résultat de génération pour une personne. */
export type GeneratedCard = {
  id: string
  nom: string
  prenoms: string
  poste: string
  /** URL publique de la page d'affichage des images (encodée dans le QR). */
  viewUrl: string | null
  /** Data URL PNG du QR (avec logo). */
  qr: string | null
  /** Message d'erreur si la génération/l'upload a échoué. */
  error: string | null
}

/** Données chargées par la page d'affichage `/carte/:id`. */
export type CardViewData = {
  meta: CardMeta
  imageUrls: string[]
}

/** Ligne de la table `cards` (suivi & administration). */
export type CardRecord = {
  id: string
  nom: string
  prenoms: string
  poste: string
  /** Chemin du PNG du QR dans le bucket (pour re-téléchargement). */
  qr_path: string | null
  /** URL de la page d'affichage encodée dans le QR. */
  view_url: string | null
  /** Nombre total de scans (incrémenté à chaque ouverture de /carte/:id). */
  scan_count: number
  created_at: string
}
