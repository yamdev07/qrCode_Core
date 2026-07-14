<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@modules/admin/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

async function handleSubmit(): Promise<void> {
  errorMessage.value = null
  isLoading.value = true
  try {
    await signIn(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/admin'
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
    <form
      class="login-card"
      @submit.prevent="handleSubmit"
    >
      <div class="login-head">
        <span class="lock">🔐</span>
        <h2>Espace administration</h2>
        <p>Connectez-vous pour accéder au suivi des cartes.</p>
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="username"
          placeholder="admin@exemple.com"
          required
          class="input"
        >
      </div>

      <div class="field">
        <label for="password">Mot de passe</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          required
          class="input"
        >
      </div>

      <p
        v-if="errorMessage"
        class="error"
      >
        ⚠️ {{ errorMessage }}
      </p>

      <button
        type="submit"
        class="btn"
        :disabled="isLoading"
      >
        <span
          v-if="isLoading"
          class="spinner"
        />
        <span>{{ isLoading ? 'Connexion…' : 'Se connecter' }}</span>
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-wrap {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 3rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  padding: 2.25rem;
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
}

.login-head {
  text-align: center;
  margin-bottom: 1.75rem;
}

.lock {
  font-size: 2rem;
}

.login-head h2 {
  font-size: 1.3rem;
  color: #0f172a;
  margin: 0.5rem 0 0.35rem;
}

.login-head p {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.1rem;
}

label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
}

.input {
  padding: 0.8rem 0.95rem;
  border-radius: 13px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-size: 0.92rem;
  color: #0f172a;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.error {
  font-size: 0.83rem;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 0.7rem 0.85rem;
  margin: 0 0 1rem;
}

.btn {
  width: 100%;
  padding: 0.9rem;
  border: none;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: transform 0.2s;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
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
</style>
