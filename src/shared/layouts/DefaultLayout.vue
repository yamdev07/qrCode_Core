<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isSidebarOpen = ref(false)

const navItems = [
  { path: '/', label: 'Accueil', icon: '🏠', desc: 'Tableau de bord' },
  { path: '/generate', label: 'Générer', icon: '✨', desc: 'QR à partir d’un lien' },
  { path: '/cards', label: 'Cartes', icon: '🎴', desc: 'Cartes pro & lots' },
  { path: '/scan', label: 'Scanner', icon: '📷', desc: 'Lire un QR code' },
  { path: '/sessions', label: 'Sessions', icon: '📋', desc: 'Présences' }
]

const pageTitle = computed(
  () => (route.meta.title as string) || 'QR Pro'
)

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}

function closeSidebar(): void {
  isSidebarOpen.value = false
}
</script>

<template>
  <div class="app-shell">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: isSidebarOpen }">
      <router-link to="/" class="brand" @click="closeSidebar">
        <span class="brand-mark">▣</span>
        <span class="brand-text">
          <span class="brand-name">QR Pro</span>
          <span class="brand-sub">Studio QR codes</span>
        </span>
      </router-link>

      <nav class="nav">
        <p class="nav-label">Menu</p>
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click="closeSidebar"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-texts">
            <span class="nav-title">{{ item.label }}</span>
            <span class="nav-desc">{{ item.desc }}</span>
          </span>
          <span class="nav-dot"></span>
        </router-link>
      </nav>

      <div class="sidebar-foot">
        <div class="foot-card">
          <span class="foot-emoji">⚡</span>
          <div>
            <strong>PWA prête</strong>
            <small>Vue 3 · Supabase</small>
          </div>
        </div>
      </div>
    </aside>

    <!-- Overlay mobile -->
    <div
      v-if="isSidebarOpen"
      class="overlay"
      @click="closeSidebar"
    ></div>

    <!-- Zone principale -->
    <div class="main-area">
      <header class="topbar">
        <button
          class="burger"
          aria-label="Menu"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <span></span><span></span><span></span>
        </button>
        <div class="topbar-title">
          <span class="crumb">QR Pro</span>
          <span class="sep">/</span>
          <strong>{{ pageTitle }}</strong>
        </div>
      </header>

      <main class="content">
        <div class="content-inner">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  display: flex;
  background:
    radial-gradient(1200px 600px at 100% -10%, rgba(168, 85, 247, 0.12), transparent 60%),
    radial-gradient(1000px 600px at -10% 10%, rgba(99, 102, 241, 0.14), transparent 55%),
    #f5f6fb;
}

/* ---------- Sidebar ---------- */
.sidebar {
  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100dvh;
  width: 276px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 12px 0 40px rgba(15, 23, 42, 0.04);
  z-index: 50;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  padding: 0.5rem 0.5rem 1.25rem;
}

.brand-mark {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  font-size: 1.4rem;
  color: #fff;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-name {
  font-weight: 800;
  font-size: 1.2rem;
  color: #0f172a;
}

.brand-sub {
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.02em;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 0.5rem;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #b4bccc;
  margin: 0.5rem 0.75rem 0.5rem;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 0.8rem;
  border-radius: 14px;
  text-decoration: none;
  color: #475569;
  transition: all 0.22s ease;
}

.nav-item:hover {
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
}

.nav-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.9);
  transition: all 0.22s ease;
}

.nav-texts {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.nav-title {
  font-weight: 700;
  font-size: 0.92rem;
}

.nav-desc {
  font-size: 0.72rem;
  color: #94a3b8;
}

.nav-dot {
  margin-left: auto;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: transparent;
  transition: all 0.22s ease;
}

.nav-item.active {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #fff;
  box-shadow: 0 12px 24px rgba(79, 70, 229, 0.32);
}

.nav-item.active .nav-icon {
  background: rgba(255, 255, 255, 0.22);
  border-color: transparent;
}

.nav-item.active .nav-desc {
  color: rgba(255, 255, 255, 0.75);
}

.nav-item.active .nav-dot {
  background: #fff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.25);
}

.sidebar-foot {
  margin-top: auto;
  padding-top: 1rem;
}

.foot-card {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.08));
  border: 1px solid rgba(99, 102, 241, 0.14);
}

.foot-emoji {
  font-size: 1.3rem;
}

.foot-card strong {
  display: block;
  font-size: 0.82rem;
  color: #0f172a;
}

.foot-card small {
  font-size: 0.72rem;
  color: #64748b;
}

/* ---------- Overlay ---------- */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  z-index: 40;
}

/* ---------- Main ---------- */
.main-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.5rem;
  background: rgba(245, 246, 251, 0.7);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
}

.topbar-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #0f172a;
}

.crumb {
  color: #94a3b8;
  font-weight: 600;
}

.sep {
  color: #cbd5e1;
}

.topbar-title strong {
  font-weight: 700;
}

.burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 42px;
  height: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  padding: 0 10px;
}

.burger span {
  height: 2px;
  width: 100%;
  background: #334155;
  border-radius: 2px;
  transition: all 0.2s;
}

.content {
  flex: 1;
  padding: 2rem 1.5rem 3rem;
}

.content-inner {
  max-width: 1080px;
  margin: 0 auto;
}

/* ---------- Responsive ---------- */
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 20px 0 60px rgba(15, 23, 42, 0.18);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .burger {
    display: flex;
  }
}

@media (max-width: 560px) {
  .content {
    padding: 1.25rem 1rem 2.5rem;
  }

  .topbar {
    padding: 0.75rem 1rem;
  }
}
</style>
