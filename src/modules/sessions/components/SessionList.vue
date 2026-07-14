<script setup lang="ts">
import type { SessionWithPresenceCount } from '@modules/sessions/types/session.types'

defineProps<{
  sessions: SessionWithPresenceCount[]
  isLoading?: boolean
  emptyMessage?: string
}>()

defineEmits<{
  select: [session: SessionWithPresenceCount]
  delete: [session: SessionWithPresenceCount]
  edit: [session: SessionWithPresenceCount]
}>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="session-list-container">
    <div
      v-if="isLoading"
      class="loading-state"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="skeleton"
      />
    </div>

    <div
      v-else-if="sessions.length === 0"
      class="empty-state"
    >
      <span class="empty-icon">📭</span>
      <p>{{ emptyMessage || 'Aucune session trouvée' }}</p>
    </div>

    <ul
      v-else
      class="session-list"
    >
      <li
        v-for="session in sessions"
        :key="session.id"
        class="session-item"
        @click="$emit('select', session)"
      >
        <div class="session-info">
          <h4 class="session-name">
            {{ session.nom }}
          </h4>
          <div class="session-meta">
            <span class="session-date">📅 {{ formatDate(session.date) }}</span>
            <span class="session-code">🔑 {{ session.code_unique }}</span>
          </div>
        </div>

        <div class="session-stats">
          <span class="presence-badge">
            👥 {{ session.presence_count ?? 0 }}
          </span>
        </div>

        <div
          class="session-actions"
          @click.stop
        >
          <button
            class="btn-icon"
            title="Modifier"
            @click="$emit('edit', session)"
          >
            ✏️
          </button>
          <button
            class="btn-icon btn-danger"
            title="Supprimer"
            @click="$emit('delete', session)"
          >
            🗑️
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.session-list-container {
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
}

.session-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.session-item:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.08);
  transform: translateY(-1px);
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-name {
  margin: 0;
  font-size: 1rem;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.session-code {
  font-family: monospace;
  color: #6366f1;
}

.presence-badge {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
  background: #eef2ff;
  color: #6366f1;
  border-radius: 20px;
  white-space: nowrap;
}

.session-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
}

.btn-danger:hover {
  background: #fef2f2;
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton {
  height: 72px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}
</style>
