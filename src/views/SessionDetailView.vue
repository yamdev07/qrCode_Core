<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessions } from '@modules/sessions/composables/useSessions'
import { usePresenceTracking } from '@modules/sessions/composables/usePresenceTracking'
import { useQrGenerator } from '@modules/generator/composables/useQrGenerator'
import QrCodeDisplay from '@modules/generator/components/QrCodeDisplay.vue'
import PresenceTable from '@modules/sessions/components/PresenceTable.vue'

const route = useRoute()
const router = useRouter()
const { currentSession, qrUrl, isLoading, fetchSession } = useSessions()
const { presences, isLoading: presencesLoading, fetchPresences } = usePresenceTracking()
const { generatedQR, generate, formData } = useQrGenerator()

const sessionId = route.params.id as string

onMounted(async () => {
  await fetchSession(sessionId)
  await fetchPresences(sessionId)

  if (qrUrl.value) {
    formData.url = qrUrl.value
    await generate()
  }
})
</script>

<template>
  <div class="detail-view">
    <button class="btn-back" @click="router.push('/sessions')">
      ← Retour
    </button>

    <div v-if="isLoading" class="loading">Chargement...</div>

    <div v-else-if="currentSession" class="detail-content">
      <div class="session-header">
        <h2>{{ currentSession.nom }}</h2>
        <div class="session-meta">
          <span>📅 {{ new Date(currentSession.date).toLocaleDateString('fr-FR') }}</span>
          <code>🔑 {{ currentSession.code_unique }}</code>
        </div>
      </div>

      <div class="detail-grid">
        <!-- QR Code -->
        <div class="qr-section">
          <h3>QR Code de la session</h3>
          <QrCodeDisplay
            v-if="generatedQR"
            :qr-data="generatedQR"
            :format="formData.format"
            :size="256"
          />
        </div>

        <!-- Présences -->
        <div class="presences-section">
          <h3>Présences</h3>
          <PresenceTable
            :presences="presences"
            :is-loading="presencesLoading"
          />
        </div>
      </div>
    </div>

    <div v-else class="not-found">Session introuvable</div>
  </div>
</template>

<style scoped>
.detail-view {
  max-width: 900px;
  margin: 0 auto;
}

.btn-back {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1.5rem;
}

.btn-back:hover {
  text-decoration: underline;
}

.session-header {
  margin-bottom: 2rem;
}

.session-header h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}

.session-meta {
  display: flex;
  gap: 1.5rem;
  color: #64748b;
  font-size: 0.9rem;
}

.session-meta code {
  font-family: monospace;
  background: #eef2ff;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  color: #6366f1;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.qr-section h3,
.presences-section h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.loading, .not-found {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

@media (max-width: 700px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
