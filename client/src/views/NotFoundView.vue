<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <span class="not-found-icon">🔍</span>
    <h1 class="gradient-text">404</h1>
    <p>Page introuvable</p>
    <button class="btn btn-primary" @click="router.push('/')">
      ← Retour à l'accueil
    </button>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 4rem 1rem;
}

.not-found-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.not-found h1 {
  font-size: 5rem;
  margin: 0;
  font-weight: 800;
}

.not-found p {
  font-size: 1.1rem;
  color: var(--text-mut);
  margin: 0.5rem 0 2rem;
}
</style>
