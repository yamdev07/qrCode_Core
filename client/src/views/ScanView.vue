<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import QrScannerCamera from '@modules/scanner/components/QrScannerCamera.vue'
import AgentConfirmationForm from '@modules/scanner/components/AgentConfirmationForm.vue'
import { usePresence } from '@modules/scanner/composables/usePresence'
import { getCardDataFromServer } from '@modules/generator/services/localCardStorage.service'
import type { ScanResult } from '@modules/scanner/types/scanner.types'

const router = useRouter()
const { isMarking, confirmation, error, mark, reset } = usePresence()

const showConfirmation = ref(false)
const currentScanResult = ref<ScanResult | null>(null)
const scanError = ref<string | null>(null)

const lookupName = ref('')
const lookupError = ref<string | null>(null)
const isLooking = ref(false)

function handleScanned(result: ScanResult): void {
  currentScanResult.value = result
  if (result.format === 'presence') {
    showConfirmation.value = true
  }
}

function handleScanError(message: string): void {
  scanError.value = message
}

async function handleConfirmPresence(agentNom: string): Promise<void> {
  if (!currentScanResult.value?.sessionId) return

  const userId = crypto.randomUUID()
  const success = await mark(
    currentScanResult.value.sessionId,
    userId,
    agentNom
  )

  if (success) {
    setTimeout(() => {
      showConfirmation.value = false
      reset()
    }, 3000)
  }
}

function handleCancel(): void {
  showConfirmation.value = false
  reset()
}

async function handleLookup(): Promise<void> {
  const slug = lookupName.value.trim().toLowerCase()
  if (!slug) {
    lookupError.value = 'Veuillez saisir votre nom.'
    return
  }

  isLooking.value = true
  lookupError.value = null

  try {
    await getCardDataFromServer(slug)
    router.push(`/carte/${slug}`)
  } catch {
    lookupError.value = `Aucune carte trouvée pour "${slug}". Format attendu : prenom-nom`
  } finally {
    isLooking.value = false
  }
}
</script>

<template>
  <div class="scan-view">
    <h2 class="view-title">🔍 Accéder à ma carte</h2>
    <p class="view-subtitle">
      Saisissez votre <strong>prenom-nom</strong> pour afficher votre carte professionnelle.<br/>
      <span class="hint">Exemple : <code>lionel-sisso</code></span>
    </p>

    <form class="lookup-form" @submit.prevent="handleLookup">
      <div class="input-group">
        <input
          v-model="lookupName"
          type="text"
          class="lookup-input"
          placeholder="prenom-nom"
          autocomplete="off"
          :disabled="isLooking"
        />
        <button
          type="submit"
          class="lookup-btn"
          :disabled="isLooking || !lookupName.trim()"
        >
          {{ isLooking ? '...' : 'Rechercher' }}
        </button>
      </div>
      <p v-if="lookupError" class="lookup-error">{{ lookupError }}</p>
    </form>

    <div class="divider">
      <span>ou scannez un QR code</span>
    </div>

    <QrScannerCamera
      @scanned="handleScanned"
      @error="handleScanError"
    />

    <AgentConfirmationForm
      v-if="showConfirmation && currentScanResult?.sessionId"
      :session-id="currentScanResult.sessionId"
      :is-marking="isMarking"
      :error="error"
      :already-confirmed="!!confirmation"
      @confirm="handleConfirmPresence"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.scan-view {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.view-title {
  text-align: center;
  font-size: 1.5rem;
  color: #1e293b;
  margin: 0;
}

.view-subtitle {
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.hint {
  font-size: 0.8rem;
  color: #94a3b8;
}

.hint code {
  background: #f1f5f9;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #6366f1;
}

.lookup-form {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.lookup-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  color: #1e293b;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.lookup-input:focus {
  border-color: #6366f1;
}

.lookup-input::placeholder {
  color: #94a3b8;
}

.lookup-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.2s, box-shadow 0.2s;
}

.lookup-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.lookup-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lookup-error {
  color: #dc2626;
  font-size: 0.85rem;
  margin: 0.75rem 0 0;
  text-align: center;
}

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #94a3b8;
  font-size: 0.8rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}
</style>
