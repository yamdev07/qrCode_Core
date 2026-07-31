<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getCardDataFromServer } from '@modules/generator/services/localCardStorage.service'
import { handleError } from '@core/errors/errorHandler'
import type { CardViewData } from '@modules/generator/types/cards.types'

const route = useRoute()
const data = ref<CardViewData | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const initials = computed(() => {
  const m = data.value?.meta
  if (!m) return '•'
  return `${(m.nom || '').charAt(0)}${(m.prenoms || '').charAt(0)}`.toUpperCase() || '•'
})

onMounted(async () => {
  const id = String(route.params.id)
  try {
    data.value = await getCardDataFromServer(id)
  } catch (error) {
    errorMessage.value = handleError(error, 'CardViewerView').message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="viewer">
    <div v-if="isLoading" class="state card">
      <span class="spinner"></span>
      <p>Chargement…</p>
    </div>

    <div v-else-if="errorMessage" class="state error card">
      <span class="emoji">🚫</span>
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else-if="data" class="content card">
      <div class="banner">
        <span class="avatar">{{ initials }}</span>
      </div>

      <header class="identity">
        <h1>{{ data.meta.nom }} {{ data.meta.prenoms }}</h1>
        <p v-if="data.meta.poste" class="poste badge">{{ data.meta.poste }}</p>
      </header>

      <div class="gallery">
        <a
          v-for="(url, i) in data.imageUrls"
          :key="i"
          :href="url"
          target="_blank"
          rel="noopener"
          class="gallery-item"
        >
          <img :src="url" :alt="`Image ${i + 1}`" loading="lazy" />
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewer {
  max-width: 640px;
  margin: 0 auto;
}

/* — États — */
.state {
  text-align: center;
  padding: 4rem 1.5rem;
  color: var(--text-mut);
}

.state.error {
  color: var(--danger);
}

.emoji {
  font-size: 2.75rem;
  display: block;
  margin-bottom: 0.75rem;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--border);
  border-top-color: var(--brand-1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  margin-bottom: 0.9rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* — Carte — */
.content {
  overflow: hidden;
}

.banner {
  height: 120px;
  background: var(--grad-brand);
  display: grid;
  place-items: end center;
  position: relative;
}

.avatar {
  transform: translateY(50%);
  width: 88px;
  height: 88px;
  display: grid;
  place-items: center;
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--brand-1);
  background: var(--surface);
  border: 4px solid var(--surface);
  border-radius: 50%;
  box-shadow: var(--sh-md);
}

.identity {
  text-align: center;
  padding: 3.5rem 1.5rem 1.5rem;
}

.identity h1 {
  font-size: 1.55rem;
}

.poste {
  margin-top: 0.6rem;
}

/* — Galerie — */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.9rem;
  padding: 0 1.5rem 1.75rem;
}

.gallery-item {
  display: block;
  border-radius: var(--r-md);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface-2);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.gallery-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--sh-md);
}

.gallery-item img {
  width: 100%;
  height: auto;
  display: block;
}
</style>
