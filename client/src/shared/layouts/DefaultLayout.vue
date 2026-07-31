<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useAuth } from '@modules/admin/composables/useAuth'
import { useTheme } from '@core/composables/useTheme'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, signOut } = useAuth()
const { toggle, isDarkNow } = useTheme()
const isSidebarOpen = ref(false)
const isDark = ref(isDarkNow())

// auth: true → visible seulement une fois connecté (fonctions de gestion).
const allNav = [
  { path: '/', label: 'Accueil', icon: '🏠', desc: 'Tableau de bord', auth: false },
  { path: '/generate', label: 'Générer', icon: '✨', desc: 'QR à partir d’un lien', auth: true },
  { path: '/cards', label: 'Cartes', icon: '🎴', desc: 'Cartes pro & lots', auth: true },
  { path: '/recherche', label: 'Rechercher', icon: '🔎', desc: 'Trouver un QR par nom', auth: true },
  { path: '/scan', label: 'Scanner', icon: '📷', desc: 'Lire un QR code', auth: false },
  { path: '/sessions', label: 'Sessions', icon: '📋', desc: 'Présences', auth: true }
]

const navItems = computed(() =>
  allNav.filter((item) => !item.auth || isAuthenticated.value)
)

const pageTitle = computed(() => (route.meta.title as string) || 'QR Pro')

function logout(): void {
  signOut()
  router.push('/')
}

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}

function closeSidebar(): void {
  isSidebarOpen.value = false
}

function switchTheme(): void {
  toggle()
  isDark.value = isDarkNow()
}
</script>

<template>
  <div class="app-shell">
    <!-- Fond aurora animé -->
    <div class="aurora" aria-hidden="true">
      <span class="blob b1"></span>
      <span class="blob b2"></span>
      <span class="blob b3"></span>
    </div>

    <!-- Sidebar -->
    <aside class="sidebar glass" :class="{ open: isSidebarOpen }">
      <router-link to="/" class="brand" @click="closeSidebar">
        <span class="brand-mark">▣</span>
        <span class="brand-text">
          <span class="brand-name">QR<span class="gradient-text">Pro</span></span>
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
        <router-link
          v-if="!isAuthenticated"
          to="/login"
          class="auth-btn login"
          @click="closeSidebar"
        >
          <span>🔐</span> Connexion admin
        </router-link>
        <button v-else class="auth-btn logout" @click="logout">
          <span>↩︎</span> Déconnexion
        </button>
      </div>
    </aside>

    <!-- Overlay mobile -->
    <div v-if="isSidebarOpen" class="overlay" @click="closeSidebar"></div>

    <!-- Zone principale -->
    <div class="main-area">
      <header class="topbar glass">
        <button class="burger" aria-label="Menu" @click="isSidebarOpen = !isSidebarOpen">
          <span></span><span></span><span></span>
        </button>
        <div class="topbar-title">
          <span class="crumb">QR Pro</span>
          <span class="sep">/</span>
          <strong>{{ pageTitle }}</strong>
        </div>
        <button
          class="theme-toggle"
          :aria-label="isDark ? 'Passer en clair' : 'Passer en sombre'"
          @click="switchTheme"
        >
          <span class="theme-ico">{{ isDark ? '☀️' : '🌙' }}</span>
        </button>
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
  position: relative;
  min-height: 100dvh;
  display: flex;
  isolation: isolate;
}

/* ---------- Fond aurora ---------- */
.aurora {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: var(--bg);
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  will-change: transform;
}

.b1 {
  width: 520px;
  height: 520px;
  top: -160px;
  right: -120px;
  background: radial-gradient(circle, var(--brand-3), transparent 70%);
  animation: drift1 22s ease-in-out infinite;
}

.b2 {
  width: 480px;
  height: 480px;
  top: 10%;
  left: -160px;
  background: radial-gradient(circle, var(--brand-1), transparent 70%);
  animation: drift2 26s ease-in-out infinite;
}

.b3 {
  width: 420px;
  height: 420px;
  bottom: -160px;
  left: 40%;
  background: radial-gradient(circle, var(--brand-2), transparent 70%);
  animation: drift3 30s ease-in-out infinite;
}

@keyframes drift1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-60px, 80px); }
}
@keyframes drift2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(80px, 40px); }
}
@keyframes drift3 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-50px, -60px); }
}

/* ---------- Sidebar ---------- */
.sidebar {
  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100dvh;
  width: 278px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  border-right: 1px solid var(--border);
  border-radius: 0;
  z-index: 50;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  padding: 0.35rem 0.5rem 1.25rem;
}

.brand-mark {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  font-size: 1.45rem;
  color: #fff;
  border-radius: var(--r-md);
  background: var(--grad-brand);
  box-shadow: var(--sh-brand);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-name {
  font-weight: 800;
  font-size: 1.3rem;
  color: var(--text);
  letter-spacing: -0.02em;
}

.brand-sub {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-mut);
  letter-spacing: 0.02em;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 0.5rem;
}

.nav-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-mut);
  margin: 0.5rem 0.75rem;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.65rem 0.7rem;
  border-radius: var(--r-md);
  text-decoration: none;
  color: var(--text-soft);
  transition: all 0.22s ease;
}

.nav-item:hover {
  background: var(--grad-brand-soft);
  color: var(--brand-1);
}

.nav-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-size: 1.15rem;
  border-radius: var(--r-sm);
  background: var(--surface-2);
  border: 1px solid var(--border);
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
  color: var(--text-mut);
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
  background: var(--grad-brand);
  color: #fff;
  box-shadow: var(--sh-brand);
}

.nav-item.active .nav-icon {
  background: rgba(255, 255, 255, 0.22);
  border-color: transparent;
}

.nav-item.active .nav-desc {
  color: rgba(255, 255, 255, 0.8);
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
  border-radius: var(--r-md);
  background: var(--grad-brand-soft);
  border: 1px solid var(--border);
}

.foot-emoji {
  font-size: 1.3rem;
}

.foot-card strong {
  display: block;
  font-size: 0.82rem;
  color: var(--text);
}

.foot-card small {
  font-size: 0.72rem;
  color: var(--text-mut);
}

.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: var(--r-md);
  font: inherit;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.auth-btn.login {
  color: #fff;
  background: var(--grad-brand);
  border: 1px solid transparent;
  box-shadow: var(--sh-brand);
}

.auth-btn.login:hover {
  transform: translateY(-2px);
}

.auth-btn.logout {
  color: var(--text-soft);
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.auth-btn.logout:hover {
  color: var(--danger);
  border-color: var(--danger);
}

/* ---------- Overlay ---------- */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
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
  padding: 0.85rem 1.5rem;
  border-bottom: 1px solid var(--border);
  border-radius: 0;
}

.topbar-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: var(--text);
}

.crumb {
  color: var(--text-mut);
  font-weight: 600;
}

.sep {
  color: var(--border-strong);
}

.topbar-title strong {
  font-weight: 700;
}

.theme-toggle {
  margin-left: auto;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  background: var(--surface);
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  transform: translateY(-2px);
  box-shadow: var(--sh-md);
  border-color: var(--brand-1);
}

.burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 42px;
  height: 42px;
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  background: var(--surface);
  cursor: pointer;
  padding: 0 10px;
}

.burger span {
  height: 2px;
  width: 100%;
  background: var(--text-soft);
  border-radius: 2px;
  transition: all 0.2s;
}

.content {
  flex: 1;
  padding: 2.25rem 1.75rem 3.5rem;
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
    box-shadow: var(--sh-lg);
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
    padding: 0.7rem 1rem;
  }
}
</style>
