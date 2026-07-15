<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { AppError } from '@core/errors/AppError'
import { log } from '@core/logger/logger'

const hasError = ref(false)
const errorMessage = ref('')
const errorCode = ref('')

onErrorCaptured((err) => {
  hasError.value = true

  if (err instanceof AppError) {
    errorMessage.value = err.message
    errorCode.value = err.code
  } else if (err instanceof Error) {
    errorMessage.value = err.message
    errorCode.value = 'UNKNOWN'
  } else {
    errorMessage.value = 'Une erreur inattendue est survenue'
    errorCode.value = 'UNKNOWN'
  }

  log.error('ErrorBoundary capturé', err)
  return false // Empêche la propagation
})

function retry(): void {
  hasError.value = false
  errorMessage.value = ''
  errorCode.value = ''
}
</script>

<template>
  <div
    v-if="hasError"
    class="error-boundary"
  >
    <div class="error-content">
      <span class="error-icon">⚠️</span>
      <h2>Quelque chose s'est mal passé</h2>
      <p class="error-message">
        {{ errorMessage }}
      </p>
      <code class="error-code">{{ errorCode }}</code>
      <button
        class="btn-retry"
        @click="retry"
      >
        🔄 Réessayer
      </button>
    </div>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.error-content h2 {
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.error-message {
  color: #64748b;
  margin: 0 0 0.75rem;
}

.error-code {
  display: inline-block;
  font-size: 0.75rem;
  background: #f1f5f9;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.btn-retry {
  padding: 0.75rem 2rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry:hover {
  background: #4f46e5;
}
</style>
