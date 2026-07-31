import { ref, computed } from 'vue'
import QRCode from 'qrcode'
import {
  getCardsList,
  buildCardViewUrl
} from '@modules/generator/services/localCardStorage.service'
import { handleError } from '@core/errors/errorHandler'

export type SearchableCard = {
  cardId: string
  nom: string
  prenoms: string
  poste: string
  createdAt: string
}

/** Retire les accents et met en minuscules, pour une recherche tolérante. */
function normalize(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export function useCardSearch() {
  const all = ref<SearchableCard[]>([])
  const query = ref('')
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)
  const qrCache = ref<Record<string, string>>({})

  async function load(): Promise<void> {
    isLoading.value = true
    errorMessage.value = null
    try {
      all.value = await getCardsList()
    } catch (error) {
      errorMessage.value = handleError(error, 'useCardSearch.load').message
      all.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Résultats filtrés : chaque mot tapé doit apparaître dans le nom, le prénom
   * ou le poste. Insensible aux accents et à la casse, ordre libre — « diane
   * fassinou » et « fassinou diane » trouvent la même personne.
   */
  const results = computed<SearchableCard[]>(() => {
    const q = normalize(query.value)
    if (!q) return all.value
    const tokens = q.split(/\s+/)
    return all.value.filter((c) => {
      const hay = normalize(`${c.nom} ${c.prenoms} ${c.poste}`)
      return tokens.every((t) => hay.includes(t))
    })
  })

  const hasQuery = computed(() => query.value.trim().length > 0)

  /** Génère (et met en cache) le QR code d'une carte à partir de son URL publique. */
  async function qrFor(cardId: string): Promise<string> {
    if (qrCache.value[cardId]) return qrCache.value[cardId]
    const url = buildCardViewUrl(cardId)
    const dataUrl = await QRCode.toDataURL(url, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: 'H'
    })
    qrCache.value = { ...qrCache.value, [cardId]: dataUrl }
    return dataUrl
  }

  return { all, query, results, hasQuery, isLoading, errorMessage, load, qrFor, buildCardViewUrl }
}
