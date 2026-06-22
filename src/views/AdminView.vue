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
  font-size: 1.4rem;
  color: #0f172a;
  margin: 0 0 0.25rem;
}

.sub {
  color: #64748b;
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
  color: #64748b;
  background: #f1f5f9;
  padding: 0.4rem 0.7rem;
  border-radius: 9999px;
}

.btn-ghost {
  padding: 0.5rem 0.9rem;
  border-radius: 11px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  border-color: #6366f1;
  color: #4f46e5;
}

.btn-ghost.danger:hover {
  border-color: #fecaca;
  color: #ef4444;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.stat {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 18px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
}

.stat-value {
  font-size: 1.9rem;
  font-weight: 800;
  color: #4f46e5;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.35rem;
}

.table-wrap {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
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
  color: #94a3b8;
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid #eef2f7;
}

.table td {
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #0f172a;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table tbody tr:hover {
  background: rgba(99, 102, 241, 0.04);
}

.prenoms {
  color: #475569;
  font-weight: 400;
}

.muted {
  color: #64748b;
}

.num {
  text-align: center;
}

.scan-pill {
  display: inline-block;
  min-width: 2rem;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  background: #eef2ff;
  color: #4f46e5;
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
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  margin-left: 0.35rem;
  transition: all 0.2s;
}

.act:hover {
  border-color: #6366f1;
  transform: translateY(-1px);
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 12px;
  padding: 0.875rem;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.state {
  text-align: center;
  padding: 2.5rem;
  color: #64748b;
}

.state.empty {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 18px;
  border: 1px dashed #cbd5e1;
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  vertical-align: middle;
  border: 2px solid #e2e8f0;
  border-top-color: #6366f1;
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
