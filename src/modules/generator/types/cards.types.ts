// Types pour la génération en lot de cartes QR recto/verso avec logo par personne

/** Une personne saisie manuellement dans la liste. */
export type PersonCard = {
  id: string
  nom: string
  /** URL encodée dans le QR du recto (obligatoire). */
  rectoUrl: string
  /** URL encodée dans le QR du verso (optionnelle). */
  versoUrl: string
  /** Logo propre à la personne, en data URL (image), ou null. */
  logo: string | null
}

/** Options d'apparence partagées par toutes les cartes générées. */
export type CardDesignOptions = {
  size: number
  foreground: string
  background: string
  margin: number
  /** Taille du logo en proportion du QR (0.1 = 10%). */
  logoScale: number
}

/** Résultat de génération pour une personne. */
export type GeneratedCard = {
  id: string
  nom: string
  /** Data URL PNG du QR recto. */
  recto: string | null
  /** Data URL PNG du QR verso (null si pas d'URL verso). */
  verso: string | null
  /** Message d'erreur si la génération a échoué pour cette personne. */
  error: string | null
}
