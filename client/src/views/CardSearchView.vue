<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useCardSearch, type SearchableCard } from '@modules/generator/composables/useCardSearch'
import { downloadQRCode } from '@modules/generator/services/qrGenerator.service'
import { slugify } from '@modules/generator/services/qrCard.service'

const { query, results, hasQuery, isLoading, errorMessage, load, qrFor, buildCardViewUrl } =
  useCardSearch()

// dataURL des QR par carte, générés à la demande pour les résultats visibles.
const qrs = ref<Record<string, string>>({})

async function ensureQrs(list: SearchableCard[]): Promise<void> {
  for (const c of list) {
    if (!qrs.value[c.cardId]) {
      qrs.value = { ...qrs.value, [c.cardId]: await qrFor(c.cardId) }
    }
  }
}

// Régénère les QR manquants dès que la liste filtrée change.
watch(results, (list) => ensureQrs(list), { immediate: false })

onMounted(async () => {
  await load()
  await ensureQrs(results.value)
})

function download(c: SearchableCard): void {
  const url = qrs.value[c.cardId]
  if (url) downloadQRCode(url, `${slugify(`${c.nom}-${c.prenoms}`)}.png`)
}
</script>

<template>
  <div class="search-view">
    <div class="view-head">
      <p class="eyebrow">Annuaire</p>
      <h1>Rechercher un QR code</h1>
      <p class="sub">Tapez le nom et le prénom d’une personne pour retrouver son QR code.</p>
    </div>

    <!-- Barre de recherche -->
    <div class="search-bar card">
      <span class="search-ico">🔎</span>
      <input
        v-model="query"
        type="search"
        class="search-input"
        placeholder="Ex. Fassinou Diane"
        autofocus
      />
      <span v-if="hasQuery" class="count">{{ results.length }} résultat(s)</span>
    </div>

    <div v-if="errorMessage" class="banner error">⚠️ {{ errorMessage }}</div>

    <div v-if="isLoading" class="state">
      <span class="spinner"></span> Chargement de l’annuaire…
    </div>

    <div v-else-if="results.length === 0" class="state empty card">
      <span class="empty-ico">🗂️</span>
      <p v-if="hasQuery">Aucune personne ne correspond à « {{ query }} ».</p>
      <p v-else>Aucune carte enregistrée pour l’instant.</p>
    </div>

    <!-- Résultats -->
    <div v-else class="grid">
      <article v-for="c in results" :key="c.cardId" class="result card">
        <div class="qr-box">
          <img v-if="qrs[c.cardId]" :src="qrs[c.cardId]" :alt="`QR de ${c.nom}`" />
          <span v-else class="spinner"></span>
        </div>
        <div class="who">
          <h3>{{ c.nom }} <span class="prenoms">{{ c.prenoms }}</span></h3>
          <p v-if="c.poste" class="poste badge">{{ c.poste }}</p>
        </div>
        <div class="actions">
          <a
            class="btn btn-ghost"
            :href="buildCardViewUrl(c.cardId)"
            target="_blank"
            rel="noopener"
          >🔗 Voir la carte</a>
          <button class="btn btn-primary" :disabled="!qrs[c.cardId]" @click="download(c)">
            💾 Télécharger le QR
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.search-view {
  max-width: 960px;
  margin: 0 auto;
}

/* — Barre de recherche — */
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--sh-md);
}

.search-ico {
  font-size: 1.2rem;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font: inherit;
  font-size: 1.05rem;
  color: var(--text);
  padding: 0.5rem 0;
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: var(--text-mut);
}

.count {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-mut);
  white-space: nowrap;
}

/* — États — */
.state {
  text-align: center;
  padding: 2.5rem;
  color: var(--text-mut);
}

.state.empty {
  padding: 3rem 1.5rem;
}

.empty-ico {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.6rem;
}

.banner.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.28);
  color: var(--danger);
  border-radius: var(--r-md);
  padding: 0.8rem 1rem;
  margin-bottom: 1rem;
}

/* — Résultats — */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.1rem;
}

.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.4rem;
  text-align: center;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.result:hover {
  transform: translateY(-3px);
  box-shadow: var(--sh-lg);
}

.qr-box {
  width: 180px;
  height: 180px;
  display: grid;
  place-items: center;
  padding: 10px;
  background: #fff;
  border-radius: var(--r-md);
  border: 1px solid var(--border);
}

.qr-box img {
  width: 100%;
  height: 100%;
  display: block;
}

.who h3 {
  font-size: 1.05rem;
}

.prenoms {
  font-weight: 500;
  color: var(--text-soft);
}

.poste {
  margin-top: 0.5rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-top: auto;
}

.actions .btn {
  width: 100%;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border);
  border-top-color: var(--brand-1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
