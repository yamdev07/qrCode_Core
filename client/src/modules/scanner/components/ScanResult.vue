<script setup lang="ts">
import { computed } from 'vue'
import type { ScanResult as ScanResultType } from '@modules/scanner/types/scanner.types'

const props = defineProps<{
  result: ScanResultType
  presenceMarked?: boolean
  isMarking?: boolean
  agentConfirmed?: boolean
  agentName?: string
}>()

defineEmits<{
  markPresence: []
  openUrl: []
  dismiss: []
}>()

const formatLabel = computed(() => {
  switch (props.result.format) {
    case 'url': return '🔗 URL'
    case 'presence': return '📋 Session de présence'
    case 'text': return '📝 Texte'
    default: return '❓ Inconnu'
  }
})

const formattedTime = computed(() =>
  new Date(props.result.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
)

const canMarkPresence = computed(() =>
  props.result.format === 'presence' && !props.presenceMarked && !props.isMarking
)
</script>

<template>
  <div
    class="scan-result"
    :class="`format-${result.format}`"
  >
    <div class="result-header">
      <span class="result-badge">{{ formatLabel }}</span>
      <span class="result-time">{{ formattedTime }}</span>
    </div>

    <div class="result-content">
      <p class="result-text">
        {{ result.content }}
      </p>
      <p
        v-if="result.sessionId"
        class="result-session"
      >
        Session : <code>{{ result.sessionId }}</code>
      </p>
    </div>

    <div class="result-actions">
      <button
        v-if="result.format === 'url'"
        class="btn btn-open"
        @click="$emit('openUrl')"
      >
        🌐 Ouvrir
      </button>

      <button
        v-if="canMarkPresence"
        class="btn btn-mark"
        :disabled="isMarking"
        @click="$emit('markPresence')"
      >
        <span
          v-if="isMarking"
          class="spinner"
        />
        <span v-else>👤 Confirmer mon identité</span>
      </button>

      <div
        v-if="agentConfirmed"
        class="confirmed-badge"
      >
        ✅ {{ agentName || 'Agent' }} — Présence confirmée
      </div>

      <div
        v-else-if="presenceMarked"
        class="marked-badge"
      >
        ✅ Présence enregistrée
      </div>

      <button
        class="btn btn-dismiss"
        @click="$emit('dismiss')"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<style scoped>
.scan-result {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: slideUp 0.3s ease-out;
}

.scan-result.format-presence {
  border-color: #6366f1;
  background: #eef2ff;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  background: #e2e8f0;
  color: #475569;
}

.result-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.result-content {
  word-break: break-all;
}

.result-text {
  font-size: 0.9rem;
  color: #1e293b;
  margin: 0;
}

.result-session {
  font-size: 0.8rem;
  color: #6366f1;
  margin: 0.25rem 0 0;
}

.result-session code {
  font-family: monospace;
  background: rgba(99, 102, 241, 0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.result-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-open {
  background: #0ea5e9;
  color: white;
}

.btn-open:hover {
  background: #0284c7;
}

.btn-mark {
  background: #22c55e;
  color: white;
}

.btn-mark:hover:not(:disabled) {
  background: #16a34a;
}

.btn-mark:disabled {
  opacity: 0.6;
}

.btn-dismiss {
  background: #f1f5f9;
  color: #64748b;
  margin-left: auto;
  padding: 0.5rem;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-dismiss:hover {
  background: #e2e8f0;
}

.marked-badge {
  font-size: 0.85rem;
  font-weight: 600;
  color: #16a34a;
  padding: 0.4rem 0.8rem;
  background: #dcfce7;
  border-radius: 8px;
}

.confirmed-badge {
  font-size: 0.85rem;
  font-weight: 600;
  color: #16a34a;
  padding: 0.4rem 0.8rem;
  background: #dcfce7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
