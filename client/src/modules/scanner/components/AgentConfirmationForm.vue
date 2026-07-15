<script setup lang="ts">
import { ref, computed } from 'vue'

defineProps<{
  sessionId: string
  isMarking?: boolean
  error?: string | null
  alreadyConfirmed?: boolean
}>()

const emit = defineEmits<{
  confirm: [agentNom: string]
  cancel: []
}>()

const agentNom = ref('')
const nomError = ref<string | null>(null)

const isValid = computed(() => agentNom.value.trim().length >= 2)

function validate(): boolean {
  nomError.value = null

  if (!agentNom.value.trim()) {
    nomError.value = 'Veuillez entrer votre nom'
    return false
  }

  if (agentNom.value.trim().length < 2) {
    nomError.value = 'Le nom doit contenir au moins 2 caractères'
    return false
  }

  return true
}

function handleSubmit(): void {
  if (!validate()) return
  emit('confirm', agentNom.value.trim())
}
</script>

<template>
  <div class="confirmation-card">
    <div class="card-header">
      <span class="card-icon">👤</span>
      <h3>Confirmation de présence</h3>
    </div>

    <div
      v-if="alreadyConfirmed"
      class="already-confirmed"
    >
      ✅ Votre présence est déjà confirmée pour cette session.
    </div>

    <form
      v-else
      class="confirmation-form"
      @submit.prevent="handleSubmit"
    >
      <p class="form-description">
        Veuillez entrer votre nom pour confirmer votre présence à cette session.
      </p>

      <div class="form-group">
        <label for="agent-nom">Votre nom complet</label>
        <input
          id="agent-nom"
          v-model="agentNom"
          type="text"
          placeholder="Ex: Jean Dupont"
          class="input"
          :class="{ 'input-error': nomError || error }"
          autofocus
          :disabled="isMarking"
        >
        <p
          v-if="nomError"
          class="error-text"
        >
          {{ nomError }}
        </p>
        <p
          v-if="error"
          class="error-text server-error"
        >
          {{ error }}
        </p>
      </div>

      <div class="session-info">
        <span class="info-label">Session :</span>
        <code class="info-code">{{ sessionId }}</code>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-confirm"
          :disabled="!isValid || isMarking"
        >
          <span
            v-if="isMarking"
            class="spinner"
          />
          <span v-else>✅ Confirmer ma présence</span>
        </button>
        <button
          type="button"
          class="btn btn-cancel"
          :disabled="isMarking"
          @click="$emit('cancel')"
        >
          Annuler
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.confirmation-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  max-width: 420px;
  margin: 0 auto;
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.card-icon {
  font-size: 2rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #1e293b;
}

.already-confirmed {
  text-align: center;
  padding: 1.5rem;
  background: #dcfce7;
  border-radius: 10px;
  color: #16a34a;
  font-weight: 500;
}

.confirmation-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-description {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #334155;
}

.input {
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1.05rem;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.input-error {
  border-color: #ef4444;
}

.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  margin: 0;
}

.server-error {
  background: #fef2f2;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
}

.info-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.info-code {
  font-family: monospace;
  font-size: 0.85rem;
  color: #6366f1;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.btn {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm {
  flex: 1;
  background: #22c55e;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #16a34a;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover:not(:disabled) {
  background: #e2e8f0;
}

.spinner {
  width: 18px;
  height: 18px;
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
