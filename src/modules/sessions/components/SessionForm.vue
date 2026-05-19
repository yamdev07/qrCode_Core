<script setup lang="ts">
import { reactive } from 'vue'
import type { SessionFormData } from '@modules/sessions/types/session.types'

const emit = defineEmits<{
  submit: [data: SessionFormData]
  cancel: []
}>()

const props = defineProps<{
  initialData?: SessionFormData
  isEditing?: boolean
  isLoading?: boolean
}>()

const formData = reactive<SessionFormData>({
  nom: props.initialData?.nom || '',
  code_unique: props.initialData?.code_unique || '',
  date: props.initialData?.date || new Date().toISOString().slice(0, 16)
})

const errors = reactive<Partial<Record<keyof SessionFormData, string>>>({})

function validate(): boolean {
  errors.nom = undefined
  errors.date = undefined

  if (!formData.nom.trim()) {
    errors.nom = 'Le nom est requis'
    return false
  }

  if (!formData.date) {
    errors.date = 'La date est requise'
    return false
  }

  return true
}

function handleSubmit(): void {
  if (!validate()) return
  emit('submit', { ...formData })
}

function generateCode(): void {
  formData.code_unique = crypto.randomUUID().split('-')[0].toUpperCase()
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="session-form">
    <div class="form-group">
      <label for="session-nom">Nom de la session *</label>
      <input
        id="session-nom"
        v-model="formData.nom"
        type="text"
        placeholder="Ex: Cours du matin"
        class="input"
        :class="{ 'input-error': errors.nom }"
      />
      <p v-if="errors.nom" class="error-text">{{ errors.nom }}</p>
    </div>

    <div class="form-group">
      <label for="session-code">
        Code unique
        <button type="button" class="btn-generate" @click="generateCode">🎲 Générer</button>
      </label>
      <input
        id="session-code"
        v-model="formData.code_unique"
        type="text"
        placeholder="Code auto-généré si vide"
        class="input code-input"
        maxlength="50"
      />
    </div>

    <div class="form-group">
      <label for="session-date">Date *</label>
      <input
        id="session-date"
        v-model="formData.date"
        type="datetime-local"
        class="input"
        :class="{ 'input-error': errors.date }"
      />
      <p v-if="errors.date" class="error-text">{{ errors.date }}</p>
    </div>

    <div class="form-actions">
      <button
        type="submit"
        class="btn btn-submit"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="spinner"></span>
        <span v-else>{{ isEditing ? '✏️ Modifier' : '✅ Créer la session' }}</span>
      </button>
      <button type="button" class="btn btn-cancel" @click="$emit('cancel')">
        Annuler
      </button>
    </div>
  </form>
</template>

<style scoped>
.session-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-generate {
  font-size: 0.75rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-generate:hover {
  background: #e2e8f0;
}

.input {
  padding: 0.75rem 0.875rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-error {
  border-color: #ef4444;
}

.code-input {
  font-family: monospace;
  text-transform: uppercase;
}

.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit {
  flex: 1;
  background: #6366f1;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
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
