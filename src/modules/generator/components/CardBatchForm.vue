<script setup lang="ts">
import { ref } from 'vue'
import { useQrCards } from '../composables/useQrCards'
import { urlSchema } from '@core/utils/validators'

const {
  people,
  design,
  isGenerating,
  errorMessage,
  validCount,
  addPerson,
  removePerson,
  setLogo,
  setLogoFromFile,
  generate,
  reset
} = useQrCards()

const logoError = ref<string | null>(null)

function isUrlValid(value: string): boolean | null {
  if (!value.trim()) return null
  return urlSchema.safeParse(value).success
}

async function onLogoChange(id: string, event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  logoError.value = null
  try {
    await setLogoFromFile(id, file)
  } catch (e) {
    logoError.value = e instanceof Error ? e.message : 'Logo invalide'
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <div class="batch-card">
    <div class="form-header">
      <span class="icon">👥</span>
      <h3>Personnes</h3>
      <span class="count-badge">{{ validCount }} valide(s)</span>
    </div>

    <!-- Liste des personnes -->
    <div class="people-list">
      <div v-for="(person, index) in people" :key="person.id" class="person-row">
        <div class="row-index">{{ index + 1 }}</div>

        <div class="row-fields">
          <div class="field">
            <label>Nom</label>
            <input
              v-model="person.nom"
              type="text"
              placeholder="Nom de la personne"
              class="text-input"
            />
          </div>

          <div class="field">
            <label>Lien recto</label>
            <input
              v-model="person.rectoUrl"
              type="text"
              placeholder="https://…"
              class="text-input"
              :class="{
                'is-valid': isUrlValid(person.rectoUrl) === true,
                'is-invalid': isUrlValid(person.rectoUrl) === false
              }"
            />
          </div>

          <div class="field">
            <label>Lien verso <span class="optional">(optionnel)</span></label>
            <input
              v-model="person.versoUrl"
              type="text"
              placeholder="https://…"
              class="text-input"
              :class="{
                'is-valid': isUrlValid(person.versoUrl) === true,
                'is-invalid': isUrlValid(person.versoUrl) === false
              }"
            />
          </div>

          <div class="field logo-field">
            <label>Logo</label>
            <div class="logo-control">
              <div class="logo-thumb" :class="{ empty: !person.logo }">
                <img v-if="person.logo" :src="person.logo" alt="Logo" />
                <span v-else>—</span>
              </div>
              <div class="logo-buttons">
                <label class="btn-mini btn-upload">
                  📁 Choisir
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    @change="(e) => onLogoChange(person.id, e)"
                  />
                </label>
                <button
                  v-if="person.logo"
                  type="button"
                  class="btn-mini btn-clear"
                  @click="setLogo(person.id, null)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="btn-remove"
          title="Supprimer"
          @click="removePerson(person.id)"
        >
          🗑
        </button>
      </div>
    </div>

    <p v-if="logoError" class="field-error">⚠️ {{ logoError }}</p>

    <button type="button" class="btn btn-add" @click="addPerson">
      + Ajouter une personne
    </button>

    <!-- Options d'apparence partagées -->
    <details class="advanced-settings">
      <summary class="settings-trigger">
        <span>Apparence des QR (appliquée à tous)</span>
        <span class="chevron">↓</span>
      </summary>
      <div class="settings-grid">
        <div class="field">
          <label>Taille (px)</label>
          <select v-model.number="design.size" class="select-input">
            <option :value="256">256</option>
            <option :value="320">320</option>
            <option :value="512">512</option>
            <option :value="1024">1024</option>
          </select>
        </div>
        <div class="field">
          <label>Taille du logo</label>
          <select v-model.number="design.logoScale" class="select-input">
            <option :value="0.16">Petit</option>
            <option :value="0.22">Moyen</option>
            <option :value="0.28">Grand</option>
          </select>
        </div>
        <div class="field">
          <label>Couleur QR</label>
          <div class="color-picker-wrapper">
            <input v-model="design.foreground" type="color" class="color-picker" />
            <input v-model="design.foreground" type="text" class="color-text" maxlength="7" />
          </div>
        </div>
        <div class="field">
          <label>Couleur Fond</label>
          <div class="color-picker-wrapper">
            <input v-model="design.background" type="color" class="color-picker" />
            <input v-model="design.background" type="text" class="color-text" maxlength="7" />
          </div>
        </div>
      </div>
    </details>

    <div v-if="errorMessage" class="error-banner">⚠️ {{ errorMessage }}</div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" :disabled="isGenerating" @click="reset">
        Réinitialiser
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="isGenerating || validCount === 0"
        @click="generate"
      >
        <span v-if="isGenerating" class="spinner"></span>
        <span>{{ isGenerating ? 'Génération…' : `Générer ${validCount} carte(s)` }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.batch-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
  margin-bottom: 2rem;
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
  flex: 1;
}

.form-header .icon {
  font-size: 1.25rem;
}

.count-badge {
  background: #eef2ff;
  color: #6366f1;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
}

.people-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.person-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.7);
  border: 1px solid #eef2f7;
  border-radius: 16px;
}

.row-index {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: #e2e8f0;
  color: #475569;
  font-weight: 700;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
}

.row-fields {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.optional {
  font-weight: 400;
  color: #94a3b8;
}

.text-input,
.select-input {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-size: 0.9rem;
  color: #0f172a;
  transition: all 0.2s ease;
}

.text-input:focus,
.select-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.text-input.is-valid {
  border-color: #10b981;
}

.text-input.is-invalid {
  border-color: #ef4444;
}

.logo-field {
  grid-column: 1 / -1;
}

.logo-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-thumb {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1.5px dashed #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fff;
  color: #cbd5e1;
  flex-shrink: 0;
}

.logo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-mini {
  padding: 0.45rem 0.8rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #475569;
}

.btn-upload:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.btn-clear {
  border-color: #fecaca;
  color: #ef4444;
}

.btn-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.35rem;
  margin-top: 1.4rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-remove:hover {
  opacity: 1;
}

.field-error {
  font-size: 0.8rem;
  color: #ef4444;
  margin: 0.75rem 0 0;
}

.btn-add {
  margin-top: 1rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1.5px dashed #c7d2fe;
  background: #f5f7ff;
  color: #6366f1;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #eef2ff;
  border-color: #6366f1;
}

.advanced-settings {
  border-top: 1px solid #f1f5f9;
  padding-top: 1.25rem;
  margin-top: 1.5rem;
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
  gap: 1rem;
  padding-top: 1.25rem;
}

.color-picker-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-picker {
  -webkit-appearance: none;
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
  padding: 0.65rem;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  font-size: 0.85rem;
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
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
  transform: translateY(-1px);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .row-fields {
    grid-template-columns: 1fr;
  }
}
</style>
