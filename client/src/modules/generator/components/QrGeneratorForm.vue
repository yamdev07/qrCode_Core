<script setup lang="ts">
import { useQrGenerator } from '../composables/useQrGenerator'

const emit = defineEmits<{
  generated: [qrData: string]
}>()

const {
  formData,
  isGenerating,
  errorMessage,
  isUrlValid,
  generate,
  reset
} = useQrGenerator()

async function handleSubmit(): Promise<void> {
  const result = await generate()
  if (result) {
    emit('generated', result)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="qr-form-card">
    <div class="form-header">
      <span class="icon">⚙️</span>
      <h3>Configuration</h3>
    </div>

    <!-- URL Field -->
    <div class="form-group">
      <label for="qr-url">URL à encoder</label>
      <div class="input-wrapper">
        <input
          id="qr-url"
          v-model="formData.url"
          type="text"
          placeholder="https://example.com"
          class="text-input"
          :class="{ 'is-valid': isUrlValid === true, 'is-invalid': isUrlValid === false }"
          required
        />
        <span v-if="isUrlValid === true" class="validation-badge valid">✓</span>
        <span v-if="isUrlValid === false" class="validation-badge invalid">✗</span>
      </div>
      <p v-if="isUrlValid === false" class="field-error">
        Veuillez saisir une URL valide.
      </p>
    </div>

    <!-- Collapsible Advanced Settings -->
    <details class="advanced-settings" open>
      <summary class="settings-trigger">
        <span>Options d'affichage avancées</span>
        <span class="chevron">↓</span>
      </summary>

      <div class="settings-grid">
        <!-- Size -->
        <div class="form-group">
          <label for="qr-size">Taille (pixels)</label>
          <select id="qr-size" v-model.number="formData.size" class="select-input">
            <option :value="128">128 x 128</option>
            <option :value="256">256 x 256</option>
            <option :value="512">512 x 512</option>
            <option :value="1024">1024 x 1024</option>
          </select>
        </div>

        <!-- Format -->
        <div class="form-group">
          <label for="qr-format">Format</label>
          <select id="qr-format" v-model="formData.format" class="select-input">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WEBP</option>
            <option value="svg">SVG</option>
          </select>
        </div>

        <!-- Correction Level -->
        <div class="form-group">
          <label for="qr-correction">Niveau de correction</label>
          <select id="qr-correction" v-model="formData.errorCorrectionLevel" class="select-input">
            <option value="L">Faible (L)</option>
            <option value="M">Moyen (M)</option>
            <option value="Q">Élevé (Q)</option>
            <option value="H">Maximum (H)</option>
          </select>
        </div>

        <!-- Margin -->
        <div class="form-group">
          <label for="qr-margin">Marge</label>
          <input
            id="qr-margin"
            v-model.number="formData.margin"
            type="number"
            min="0"
            max="10"
            class="number-input"
          />
        </div>

        <!-- Foreground Color -->
        <div class="form-group">
          <label for="qr-foreground">Couleur QR</label>
          <div class="color-picker-wrapper">
            <input
              id="qr-foreground"
              v-model="formData.foreground"
              type="color"
              class="color-picker"
            />
            <input
              type="text"
              v-model="formData.foreground"
              class="color-text"
              maxlength="7"
            />
          </div>
        </div>

        <!-- Background Color -->
        <div class="form-group">
          <label for="qr-background">Couleur Fond</label>
          <div class="color-picker-wrapper">
            <input
              id="qr-background"
              v-model="formData.background"
              type="color"
              class="color-picker"
            />
            <input
              type="text"
              v-model="formData.background"
              class="color-text"
              maxlength="7"
            />
          </div>
        </div>
      </div>
    </details>

    <div v-if="errorMessage" class="error-banner">
      ⚠️ {{ errorMessage }}
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button type="button" @click="reset" class="btn btn-secondary" :disabled="isGenerating">
        Réinitialiser
      </button>
      <button type="submit" class="btn btn-primary" :disabled="isGenerating || isUrlValid === false">
        <span v-if="isGenerating" class="spinner"></span>
        <span>{{ isGenerating ? 'Génération...' : 'Générer le QR Code' }}</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.qr-form-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
  margin-bottom: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.qr-form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.06);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.form-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.form-header .icon {
  font-size: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.text-input {
  width: 100%;
  padding: 0.875rem 1rem;
  padding-right: 2.5rem;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  color: #0f172a;
  transition: all 0.25s ease;
}

.text-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  background: #ffffff;
}

.text-input.is-valid {
  border-color: #10b981;
}

.text-input.is-invalid {
  border-color: #ef4444;
}

.validation-badge {
  position: absolute;
  right: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
}

.validation-badge.valid {
  color: #10b981;
}

.validation-badge.invalid {
  color: #ef4444;
}

.field-error {
  font-size: 0.8rem;
  color: #ef4444;
  margin: 0;
}

.advanced-settings {
  border-top: 1px solid #f1f5f9;
  padding-top: 1.25rem;
  margin-top: 1rem;
}

.settings-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  color: #334155;
  user-select: none;
  list-style: none;
}

.settings-trigger::-webkit-details-marker {
  display: none;
}

.chevron {
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

details[open] .chevron {
  transform: rotate(180deg);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  padding-top: 1.25rem;
}

@media (max-width: 480px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

.select-input, .number-input {
  width: 100%;
  padding: 0.75rem 0.875rem;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  color: #0f172a;
  outline: none;
  transition: all 0.25s ease;
}

.select-input:focus, .number-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: #ffffff;
}

.color-picker-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-picker {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: none;
  padding: 0;
  overflow: hidden;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
}

.color-text {
  flex: 1;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  font-size: 0.875rem;
  text-transform: uppercase;
  font-family: monospace;
  text-align: center;
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 12px;
  padding: 0.875rem;
  font-size: 0.875rem;
  margin-top: 1.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.75rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 1.5rem;
}

.btn {
  padding: 0.875rem 1.75rem;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
