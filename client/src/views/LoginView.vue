<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@modules/admin/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { signIn } = useAuth()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

async function handleSubmit(): Promise<void> {
  errorMessage.value = null
  isLoading.value = true
  try {
    await signIn(username.value, password.value)
    const redirect = (route.query.redirect as string) || '/recherche'
    router.replace(redirect)
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Connexion impossible'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-wrap">
    <form class="login-card card" @submit.prevent="handleSubmit">
      <div class="login-head">
        <span class="lock">🔐</span>
        <h1>Espace administrateur</h1>
        <p class="sub">Connectez-vous pour gérer les cartes et QR codes.</p>
      </div>

      <div class="group">
        <label class="label" for="user">Identifiant</label>
        <input
          id="user"
          v-model="username"
          type="text"
          class="field"
          autocomplete="username"
          placeholder="admin"
          required
        />
      </div>

      <div class="group">
        <label class="label" for="pass">Mot de passe</label>
        <input
          id="pass"
          v-model="password"
          type="password"
          class="field"
          autocomplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      <p v-if="errorMessage" class="error">⚠️ {{ errorMessage }}</p>

      <button type="submit" class="btn btn-primary submit" :disabled="isLoading">
        <span v-if="isLoading" class="spinner"></span>
        {{ isLoading ? 'Connexion…' : 'Se connecter' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-wrap {
  min-height: 60vh;
  display: grid;
  place-items: center;
  padding: 1.5rem 0;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  box-shadow: var(--sh-lg);
}

.login-head {
  text-align: center;
  margin-bottom: 0.5rem;
}

.lock {
  font-size: 2.25rem;
  display: block;
  margin-bottom: 0.5rem;
}

.login-head h1 {
  font-size: 1.4rem;
}

.login-head .sub {
  color: var(--text-mut);
  font-size: 0.9rem;
  margin-top: 0.35rem;
}

.group {
  display: flex;
  flex-direction: column;
}

.error {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.28);
  border-radius: var(--r-md);
  padding: 0.6rem 0.8rem;
  font-size: 0.86rem;
  font-weight: 600;
}

.submit {
  margin-top: 0.4rem;
  padding: 0.85rem;
  font-size: 1rem;
}

.submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
