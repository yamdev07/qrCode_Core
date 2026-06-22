import { ref, computed } from 'vue'
import { listCards } from '@modules/admin/services/cardAdmin.service'
import { getPublicUrl } from '@modules/generator/services/cardStorage.service'
import { slugify } from '@modules/generator/services/qrCard.service'
import { handleError } from '@core/errors/errorHandler'
import type { CardRecord } from '@modules/generator/types/cards.types'

const cards = ref<CardRecord[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

export function useAdminCards() {
  const totalScans = computed(() =>
    cards.value.reduce((sum, c) => sum + (c.scan_count ?? 0), 0)
  )

  async function load(): Promise<void> {
    isLoading.value = true
    errorMessage.value = null
    try {
      cards.value = await listCards()
    } catch (error) {
      errorMessage.value = handleError(error, 'useAdminCards.load').message
      cards.value = []
    } finally {
      isLoading.value = false
    }
  }

  /** Re-télécharge le PNG du QR stocké pour une carte. */
  async function downloadQr(card: CardRecord): Promise<void> {
    if (!card.qr_path) return
    const url = getPublicUrl(card.qr_path)
    const res = await fetch(url)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = `${slugify(`${card.nom}-${card.prenoms}`)}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)
  }

  return { cards, isLoading, errorMessage, totalScans, load, downloadQr }
}
