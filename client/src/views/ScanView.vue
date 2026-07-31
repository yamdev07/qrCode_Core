<script setup lang="ts">
import { ref } from 'vue'
import QrScannerCamera from '@modules/scanner/components/QrScannerCamera.vue'
import AgentConfirmationForm from '@modules/scanner/components/AgentConfirmationForm.vue'
import { usePresence } from '@modules/scanner/composables/usePresence'
import type { ScanResult } from '@modules/scanner/types/scanner.types'

const { isMarking, confirmation, error, mark, reset } = usePresence()

const showConfirmation = ref(false)
const currentScanResult = ref<ScanResult | null>(null)
const scanError = ref<string | null>(null)

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
</script>

<template>
  <div class="scan-view">
    <h2 class="view-title">📷 Scanner un QR code</h2>

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
  font-size: clamp(1.4rem, 3vw, 1.75rem);
  color: var(--text);
  margin: 0 0 1rem;
}
</style>
