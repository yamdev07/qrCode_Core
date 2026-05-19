import { computed } from 'vue'
import { useLocalStorage } from '@core/composables/useLocalStorage'
import type { QRHistoryItem } from '@modules/generator/types/generator.types'

const MAX_HISTORY_ITEMS = 50

export function useQrHistory() {
  const history = useLocalStorage<QRHistoryItem[]>('qr-history', [])

  const recentItems = computed(() =>
    history.value
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  )

  function addToHistory(item: Omit<QRHistoryItem, 'id' | 'createdAt'>): void {
    const newItem: QRHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }

    history.value = [newItem, ...history.value].slice(0, MAX_HISTORY_ITEMS)
  }

  function removeFromHistory(id: string): void {
    history.value = history.value.filter(item => item.id !== id)
  }

  function clearHistory(): void {
    history.value = []
  }

  return {
    history,
    recentItems,
    addToHistory,
    removeFromHistory,
    clearHistory
  }
}
