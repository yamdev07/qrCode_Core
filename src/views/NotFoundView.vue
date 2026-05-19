<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <span class="not-found-icon">🔍</span>
    <h1>404</h1>
    <p>Page introuvable</p>
    <button class="btn-home" @click="router.push('/')">
      Retour à l'accueil
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
  font-size: 4rem;
  color: #e2e8f0;
  margin: 0;
}

.not-found p {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0.5rem 0 2rem;
}

.btn-home {
  padding: 0.75rem 2rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-home:hover {
  background: #4f46e5;
}
</style>
