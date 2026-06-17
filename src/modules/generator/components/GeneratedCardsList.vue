<script setup lang="ts">
import { computed } from 'vue'
import { useQrCards } from '../composables/useQrCards'

const { generated, downloadCard, downloadAll } = useQrCards()

const hasResults = computed(() => generated.value.length > 0)
const successCount = computed(() => generated.value.filter((c) => !c.error).length)
</script>

<template>
  <div v-if="hasResults" class="results-card">
    <div class="results-header">
      <div>
        <span class="icon">🎴</span>
        <h3>Cartes générées</h3>
      </div>
      <button class="btn-download-all" @click="downloadAll">
        💾 Tout télécharger
      </button>
    </div>

    <p class="results-meta">{{ successCount }} / {{ generated.length }} générée(s)</p>

    <div class="cards-grid">
      <div
        v-for="card in generated"
        :key="card.id"
        class="card-item"
        :class="{ 'has-error': card.error }"
      >
        <div class="card-name">{{ card.nom || 'Sans nom' }}</div>

        <p v-if="card.error" class="card-error">⚠️ {{ card.error }}</p>

        <div v-else class="sides">
          <div v-if="card.recto" class="side">
            <span class="side-label">Recto</span>
            <div class="qr-frame">
              <img :src="card.recto" :alt="`QR recto ${card.nom}`" />
            </div>
            <button class="btn-side" @click="downloadCard(card, 'recto')">
              💾 Recto
            </button>
          </div>

          <div v-if="card.verso" class="side">
            <span class="side-label">Verso</span>
            <div class="qr-frame">
              <img :src="card.verso" :alt="`QR verso ${card.nom}`" />
            </div>
            <button class="btn-side" @click="downloadCard(card, 'verso')">
              💾 Verso
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
  margin-bottom: 2rem;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.results-header > div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.results-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.icon {
  font-size: 1.25rem;
}

.btn-download-all {
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  transition: transform 0.2s;
}

.btn-download-all:hover {
  transform: translateY(-1px);
}

.results-meta {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0.75rem 0 1.5rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.card-item {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid #eef2f7;
  border-radius: 18px;
  padding: 1.25rem;
}

.card-item.has-error {
  border-color: #fecaca;
  background: #fef2f2;
}

.card-name {
  font-weight: 700;
  color: #0f172a;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.card-error {
  color: #991b1b;
  font-size: 0.85rem;
  text-align: center;
  margin: 0;
}

.sides {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.side-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.qr-frame {
  background: #fff;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.qr-frame img {
  display: block;
  width: 110px;
  height: 110px;
  border-radius: 6px;
}

.btn-side {
  padding: 0.4rem 0.75rem;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-side:hover {
  border-color: #10b981;
  color: #059669;
}
</style>
