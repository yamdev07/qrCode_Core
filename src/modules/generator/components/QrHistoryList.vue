<script setup lang="ts">
import { useQrHistory } from '../composables/useQrHistory'
import { ref } from 'vue'

const emit = defineEmits<{
  select: [url: string]
}>()

const { recentItems, removeFromHistory, clearHistory } = useQrHistory()
const copiedId = ref<string | null>(null)

function handleSelect(url: string): void {
  emit('select', url)
  // Smooth scroll up to form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function copyToClipboard(id: string, url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url)
    copiedId.value = id
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="qr-history-card">
    <div class="card-header">
      <div class="header-left">
        <span class="icon">📜</span>
        <h3>Historique récent</h3>
      </div>
      <button
        v-if="recentItems.length > 0"
        class="btn-clear"
        title="Vider l'historique"
        @click="clearHistory"
      >
        Tout effacer
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-if="recentItems.length === 0"
      class="empty-state"
    >
      <span class="empty-icon">📭</span>
      <p>Aucun code QR généré récemment</p>
    </div>

    <!-- History List -->
    <div
      v-else
      class="history-list"
    >
      <div
        v-for="item in recentItems"
        :key="item.id"
        class="history-item"
      >
        <div
          class="item-details"
          @click="handleSelect(item.url)"
        >
          <div class="item-meta">
            <span
              class="format-badge"
              :class="item.format"
            >{{ item.format.toUpperCase() }}</span>
            <span class="date">{{ formatDate(item.createdAt) }}</span>
          </div>
          <span
            class="url"
            :title="item.url"
          >{{ item.url }}</span>
        </div>

        <div class="item-actions">
          <button
            class="action-btn btn-copy"
            :class="{ copied: copiedId === item.id }"
            :title="copiedId === item.id ? 'Copié !' : 'Copier l\'URL'"
            @click="copyToClipboard(item.id, item.url)"
          >
            {{ copiedId === item.id ? '✓' : '📋' }}
          </button>
          <button
            class="action-btn btn-delete"
            title="Supprimer"
            @click="removeFromHistory(item.id)"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-history-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.qr-history-card:hover {
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-left h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.header-left .icon {
  font-size: 1.25rem;
}

.btn-clear {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-clear:hover {
  color: #ef4444;
  background: #fef2f2;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  color: #94a3b8;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.empty-state p {
  font-size: 0.9rem;
  margin: 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

/* Custom Scrollbar */
.history-list::-webkit-scrollbar {
  width: 5px;
}

.history-list::-webkit-scrollbar-track {
  background: transparent;
}

.history-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 99px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid #f1f5f9;
  padding: 1rem;
  border-radius: 16px;
  transition: all 0.25s ease;
}

.history-item:hover {
  transform: translateX(2px);
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.format-badge {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.format-badge.png { background: #e0f2fe; color: #0369a1; }
.format-badge.jpeg { background: #fef3c7; color: #b45309; }
.format-badge.webp { background: #dcfce7; color: #15803d; }
.format-badge.svg { background: #f3e8ff; color: #7e22ce; }

.date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.url {
  font-size: 0.9rem;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.item-actions {
  display: flex;
  gap: 0.35rem;
}

.action-btn {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  width: 34px;
  height: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.05);
}

.btn-copy:hover {
  border-color: #6366f1;
  background: #e0e7ff;
  color: #4f46e5;
}

.btn-copy.copied {
  background: #dcfce7;
  color: #15803d;
  border-color: #86efac;
}

.btn-delete:hover {
  border-color: #fca5a5;
  background: #fee2e2;
  color: #ef4444;
}
</style>
