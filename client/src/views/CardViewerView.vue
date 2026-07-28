<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCardDataFromServer } from '@modules/generator/services/localCardStorage.service'
import { handleError } from '@core/errors/errorHandler'
import type { CardViewData } from '@modules/generator/types/cards.types'

const route = useRoute()
const data = ref<CardViewData | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

onMounted(async () => {
  const slug = String(route.params.slug)
  try {
    data.value = await getCardDataFromServer(slug)
  } catch (error) {
    errorMessage.value = handleError(error, 'CardViewerView').message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="viewer">
    <div v-if="isLoading" class="state">
      <span class="spinner"></span>
      <p>Chargement…</p>
    </div>

    <div v-else-if="errorMessage" class="state error">
      <span class="emoji">🚫</span>
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else-if="data" class="content">
      <header class="identity">
        <h1>{{ data.meta.nom }} {{ data.meta.prenoms }}</h1>
        <p v-if="data.meta.poste" class="poste">{{ data.meta.poste }}</p>
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
  max-width: 720px;
  margin: 0 auto;
}

.state {
  text-align: center;
  padding: 4rem 1rem;
  color: #64748b;
}

.state.error {
  color: #991b1b;
}

.emoji {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.identity {
  text-align: center;
  margin-bottom: 2rem;
}

.identity h1 {
  font-size: 1.6rem;
  color: #0f172a;
  margin: 0 0 0.35rem;
}

.poste {
  color: #6366f1;
  font-weight: 600;
  margin: 0;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.gallery-item {
  display: block;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  background: #fff;
}

.gallery-item img {
  width: 100%;
  height: auto;
  display: block;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  margin-bottom: 0.75rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
