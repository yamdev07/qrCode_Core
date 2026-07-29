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

const nom = ref('')
const prenoms = ref('')
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

function buildSlug(): string {
  const n = nom.value.trim().toLowerCase()
  const p = prenoms.value.trim().toLowerCase()
  if (!n) return ''
  return p ? `${n}-${p}` : n
}

async function handleLookup(): Promise<void> {
  const slug = buildSlug()
  if (!slug) {
    lookupError.value = 'Veuillez saisir au moins votre nom.'
    return
  }

  isLooking.value = true
  lookupError.value = null

  try {
    await getCardDataFromServer(slug)
    router.push(`/carte/${slug}`)
  } catch {
    lookupError.value = `Aucune carte trouvée pour "${slug}".`
  } finally {
    isLooking.value = false
  }
}
</script>

<template>
  <div class="scan-view">
    <h2 class="view-title">🔍 Accéder à ma carte</h2>
    <p class="view-subtitle">
      Saisissez votre <strong>nom</strong> et <strong>prénom(s)</strong> pour afficher votre carte.
    </p>

    <form class="lookup-form" @submit.prevent="handleLookup">
      <div class="fields">
        <div class="field">
          <label class="field-label">Nom <span class="required">*</span></label>
          <input
            v-model="nom"
            type="text"
            class="field-input"
            placeholder="Ex: sisso"
            autocomplete="family-name"
            :disabled="isLooking"
          />
        </div>
        <div class="field">
          <label class="field-label">Prénom(s)</label>
          <input
            v-model="prenoms"
            type="text"
            class="field-input"
            placeholder="Ex: lionel"
            autocomplete="given-name"
            :disabled="isLooking"
          />
        </div>
      </div>

      <p class="slug-preview" v-if="buildSlug()">
        Lien : <code>/carte/{{ buildSlug() }}</code>
      </p>

      <button
        type="submit"
        class="lookup-btn"
        :disabled="isLooking || !nom.trim()"
      >
        {{ isLooking ? 'Recherche...' : 'Rechercher' }}
      </button>

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
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.view-title {
  text-align: center;
  font-size: 1.4rem;
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

.lookup-form {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.required {
  color: #ef4444;
}

.field-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  color: #1e293b;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.field-input:focus {
  border-color: #6366f1;
}

.field-input::placeholder {
  color: #94a3b8;
}

.slug-preview {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
  text-align: center;
}

.slug-preview code {
  background: #f1f5f9;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.78rem;
  color: #6366f1;
}

.lookup-btn {
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
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
  margin: 0;
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

@media (min-width: 480px) {
  .fields {
    flex-direction: row;
  }

  .field {
    flex: 1;
  }
}
</style>
