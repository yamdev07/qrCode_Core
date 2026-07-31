<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminCards } from '@modules/admin/composables/useAdminCards'
import { useAuth } from '@modules/admin/composables/useAuth'

const router = useRouter()
const { cards, isLoading, errorMessage, totalScans, load, downloadQr } = useAdminCards()
const { userEmail, signOut } = useAuth()

onMounted(load)

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

async function logout(): Promise<void> {
  await signOut()
  router.replace('/login')
}
</script>

<template>
  <div class="admin">
    <header class="admin-head">
      <div>
        <h2 class="title">📊 Tableau d'administration</h2>
        <p class="sub">Suivi des cartes générées et de leurs scans</p>
      </div>
      <div class="head-actions">
        <span v-if="userEmail" class="who">{{ userEmail }}</span>
        <button class="btn-ghost" @click="load">↻ Actualiser</button>
        <button class="btn-ghost danger" @click="logout">Déconnexion</button>
      </div>
    </header>

    <div class="stats">
      <div class="stat">
        <span class="stat-value">{{ cards.length }}</span>
        <span class="stat-label">Cartes</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ totalScans }}</span>
        <span class="stat-label">Scans cumulés</span>
      </div>
    </div>

    <div v-if="errorMessage" class="error-banner">⚠️ {{ errorMessage }}</div>

    <div v-if="isLoading" class="state">
      <span class="spinner"></span> Chargement…
    </div>

    <div v-else-if="cards.length === 0 && !errorMessage" class="state empty">
      Aucune carte enregistrée pour l'instant.
    </div>

    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Poste</th>
            <th>Créée le</th>
            <th class="num">Scans</th>
            <th class="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="card in cards" :key="card.id">
            <td>
              <strong>{{ card.nom }}</strong>
              <span v-if="card.prenoms" class="prenoms"> {{ card.prenoms }}</span>
            </td>
            <td class="muted">{{ card.poste || '—' }}</td>
            <td class="muted">{{ formatDate(card.created_at) }}</td>
            <td class="num">
              <span class="scan-pill">{{ card.scan_count }}</span>
            </td>
            <td class="actions">
              <a
                v-if="card.view_url"
                :href="card.view_url"
                target="_blank"
                rel="noopener"
                class="act"
                title="Ouvrir la page"
              >🔗</a>
              <button
                v-if="card.qr_path"
                class="act"
                title="Re-télécharger le QR"
                @click="downloadQr(card)"
              >💾</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin {
  max-width: 980px;
  margin: 0 auto;
}

.admin-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.title {
  font-size: clamp(1.3rem, 3vw, 1.6rem);
  color: var(--text);
  margin: 0 0 0.25rem;
}

.sub {
  color: var(--text-mut);
  font-size: 0.88rem;
  margin: 0;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.who {
  font-size: 0.8rem;
  color: var(--text-soft);
  background: var(--surface-2);
  border: 1px solid var(--border);
  padding: 0.4rem 0.7rem;
  border-radius: var(--r-full);
}

.btn-ghost {
  padding: 0.5rem 0.9rem;
  border-radius: var(--r-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-soft);
  font-size: 0.83rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  border-color: var(--brand-1);
  color: var(--brand-1);
}

.btn-ghost.danger:hover {
  border-color: var(--danger);
  color: var(--danger);
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: var(--sh-sm);
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  background: var(--grad-brand);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-mut);
  margin-top: 0.35rem;
}

.table-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--sh-sm);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-mut);
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid var(--border);
}

.table td {
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
  color: var(--text);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table tbody tr:hover {
  background: var(--grad-brand-soft);
}

.prenoms {
  color: var(--text-soft);
  font-weight: 400;
}

.muted {
  color: var(--text-mut);
}

.num {
  text-align: center;
}

.scan-pill {
  display: inline-block;
  min-width: 2rem;
  padding: 0.25rem 0.6rem;
  border-radius: var(--r-full);
  background: var(--grad-brand-soft);
  color: var(--brand-2);
  font-weight: 700;
  font-size: 0.85rem;
}

.actions {
  text-align: right;
  white-space: nowrap;
}

.act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--r-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-soft);
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  margin-left: 0.35rem;
  transition: all 0.2s;
}

.act:hover {
  border-color: var(--brand-1);
  transform: translateY(-1px);
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.28);
  color: var(--danger);
  border-radius: var(--r-md);
  padding: 0.875rem;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.state {
  text-align: center;
  padding: 2.5rem;
  color: var(--text-mut);
}

.state.empty {
  background: var(--surface);
  border-radius: var(--r-lg);
  border: 1px dashed var(--border-strong);
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  vertical-align: middle;
  border: 2px solid var(--border);
  border-top-color: var(--brand-1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 560px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .table th:nth-child(2),
  .table td:nth-child(2) {
    display: none;
  }
}
</style>
