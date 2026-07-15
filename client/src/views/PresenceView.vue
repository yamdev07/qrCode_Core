<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePresence } from '@modules/scanner/composables/usePresence'
import { generateUUID } from '@core/utils/uuid'
import { getSessionByCode } from '@modules/sessions/services/session.service'
import AgentConfirmationForm from '@modules/scanner/components/AgentConfirmationForm.vue'
import type { Session } from '@modules/sessions/types/session.types'

const route = useRoute()
const { isMarking, confirmation, error, mark } = usePresence()

const session = ref<Session | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const code = route.params.code as string

onMounted(async () => {
  try {
    session.value = await getSessionByCode(code)
  } catch (err) {
    loadError.value = 'Session introuvable ou expirée'
  } finally {
    isLoading.value = false
  }
})

async function handleConfirm(agentNom: string): Promise<void> {
  if (!session.value) return

  const userId = generateUUID()
  await mark(session.value.id, userId, agentNom)
}

function handleCancel(): void {
  window.close()
}
</script>

<template>
  <div class="presence-view">
    <div
      v-if="isLoading"
      class="loading"
    >
      Chargement de la session...
    </div>

    <div
      v-else-if="loadError"
      class="error-state"
    >
      <span class="error-icon">⚠️</span>
      <h2>Session introuvable</h2>
      <p>{{ loadError }}</p>
    </div>

    <div
      v-else-if="session"
      class="presence-content"
    >
      <div class="session-banner">
        <h2>{{ session.nom }}</h2>
        <p>📅 {{ new Date(session.date).toLocaleDateString('fr-FR', { dateStyle: 'full' }) }}</p>
      </div>

      <AgentConfirmationForm
        :session-id="session.id"
        :is-marking="isMarking"
        :error="error"
        :already-confirmed="!!confirmation"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<style scoped>
.presence-view {
  max-width: 480px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.session-banner {
  text-align: center;
  margin-bottom: 1.5rem;
}

.session-banner h2 {
  margin: 0 0 0.25rem;
  color: #1e293b;
}

.session-banner p {
  color: #64748b;
  margin: 0;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.error-state {
  text-align: center;
  padding: 3rem 1rem;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}
</style>
