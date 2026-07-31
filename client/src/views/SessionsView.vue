<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import SessionList from '@modules/sessions/components/SessionList.vue'
import SessionForm from '@modules/sessions/components/SessionForm.vue'
import { useSessions } from '@modules/sessions/composables/useSessions'
import type { SessionFormData, SessionWithPresenceCount } from '@modules/sessions/types/session.types'

const router = useRouter()
const {
  isLoading,
  error,
  activeSessions,
  pastSessions,
  fetchSessions,
  addSession,
  removeSession
} = useSessions()

const showForm = ref(false)

onMounted(() => {
  fetchSessions()
})

async function handleCreate(data: SessionFormData): Promise<void> {
  await addSession(data)
  showForm.value = false
}

function handleSelect(session: SessionWithPresenceCount): void {
  router.push(`/sessions/${session.id}`)
}

async function handleDelete(session: SessionWithPresenceCount): Promise<void> {
  if (confirm(`Supprimer la session "${session.nom}" ? Cette action est irréversible.`)) {
    await removeSession(session.id)
  }
}
</script>

<template>
  <div class="sessions-view">
    <div class="view-header">
      <h2 class="view-title">📋 Sessions</h2>
      <button class="btn-add" @click="showForm = !showForm">
        {{ showForm ? '✕ Annuler' : '+ Nouvelle session' }}
      </button>
    </div>

    <SessionForm
      v-if="showForm"
      @submit="handleCreate"
      @cancel="showForm = false"
    />

    <div v-if="activeSessions.length > 0" class="section">
      <h3 class="section-title">🟢 Sessions actives</h3>
      <SessionList
        :sessions="activeSessions"
        :is-loading="isLoading"
        empty-message="Aucune session active"
        @select="handleSelect"
        @delete="handleDelete"
      />
    </div>

    <div v-if="pastSessions.length > 0" class="section">
      <h3 class="section-title">📅 Sessions passées</h3>
      <SessionList
        :sessions="pastSessions"
        :is-loading="isLoading"
        @select="handleSelect"
        @delete="handleDelete"
      />
    </div>

    <div v-if="error" class="error-banner">
      ⚠️ {{ error }}
    </div>
  </div>
</template>

<style scoped>
.sessions-view {
  max-width: 680px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.view-title {
  font-size: clamp(1.4rem, 3vw, 1.75rem);
  color: var(--text);
  margin: 0;
}

.btn-add {
  padding: 0.68rem 1.25rem;
  background: var(--grad-brand);
  color: #fff;
  border: none;
  border-radius: var(--r-md);
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--sh-brand);
  transition: all 0.2s;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(99, 102, 241, 0.42);
}

.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1rem;
  color: var(--text-soft);
  margin: 0 0 0.75rem;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.28);
  padding: 0.75rem 1rem;
  border-radius: var(--r-md);
  text-align: center;
}
</style>
