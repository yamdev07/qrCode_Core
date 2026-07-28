<script setup lang="ts">
import { computed } from 'vue'
import type { PresenceRecord } from '@modules/sessions/types/session.types'

const props = defineProps<{
  presences: PresenceRecord[]
  isLoading?: boolean
}>()

const sortedPresences = computed(() =>
  [...props.presences].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
)

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function formatUserId(id: string): string {
  return id.length > 12 ? `${id.substring(0, 6)}...${id.slice(-4)}` : id
}
</script>

<template>
  <div class="presence-table-container">
    <div v-if="isLoading" class="loading-text">Chargement...</div>

    <div v-else-if="presences.length === 0" class="empty-presences">
      Aucune présence enregistrée
    </div>

    <div v-else class="table-wrapper">
      <table class="presence-table">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Date</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="presence in sortedPresences" :key="presence.id">
            <td>
              <code class="user-id">{{ formatUserId(presence.utilisateur_id) }}</code>
            </td>
            <td>{{ formatDateTime(presence.timestamp || presence.created_at) }}</td>
            <td>
              <span class="status-badge">✅ Présent</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="table-footer">
        Total : <strong>{{ presences.length }}</strong> présence{{ presences.length > 1 ? 's' : '' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.presence-table-container {
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.presence-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.presence-table th {
  background: #f8fafc;
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
}

.presence-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.presence-table tbody tr:hover {
  background: #f8fafc;
}

.user-id {
  font-family: monospace;
  font-size: 0.8rem;
  background: #f1f5f9;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  color: #6366f1;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.2rem 0.6rem;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 20px;
}

.table-footer {
  padding: 0.75rem 1rem;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.85rem;
  text-align: right;
}

.loading-text,
.empty-presences {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}
</style>
