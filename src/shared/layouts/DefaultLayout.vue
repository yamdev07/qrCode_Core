<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isMobileMenuOpen = ref(false)

const navItems = [
  { path: '/', label: '🏠 Accueil', icon: '🏠' },
  { path: '/generate', label: 'Générer', icon: '✨' },
  { path: '/cards', label: 'Cartes', icon: '🎴' },
  { path: '/scan', label: 'Scanner', icon: '📷' },
  { path: '/sessions', label: 'Sessions', icon: '📋' }
]

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}

function closeMenu(): void {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <router-link to="/" class="logo" @click="closeMenu">
          <span class="logo-icon">📱</span>
          <span class="logo-text">QR Pro</span>
        </router-link>

        <!-- Desktop nav -->
        <nav class="desktop-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            :class="{ active: isActive(item.path) }"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <!-- Mobile burger -->
        <button
          class="burger-btn"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          aria-label="Menu"
        >
          <span :class="{ open: isMobileMenuOpen }"></span>
        </button>
      </div>

      <!-- Mobile nav -->
      <nav v-if="isMobileMenuOpen" class="mobile-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="mobile-nav-link"
          :class="{ active: isActive(item.path) }"
          @click="closeMenu"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.label }}
        </router-link>
      </nav>
    </header>

    <!-- Main content -->
    <main class="app-main">
      <div class="main-container">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <p>QRCode Pro — PWA • Vue 3 • Supabase</p>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #1e293b;
  font-weight: 700;
  font-size: 1.25rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.desktop-nav {
  display: flex;
  gap: 0.25rem;
}

.nav-link {
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #64748b;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f1f5f9;
  color: #334155;
}

.nav-link.active {
  background: #eef2ff;
  color: #6366f1;
}

.burger-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  width: 40px;
  height: 40px;
  position: relative;
}

.burger-btn span,
.burger-btn span::before,
.burger-btn span::after {
  display: block;
  width: 24px;
  height: 2px;
  background: #334155;
  transition: all 0.3s;
  position: absolute;
  left: 8px;
}

.burger-btn span {
  top: 19px;
}

.burger-btn span::before {
  content: '';
  top: -7px;
}

.burger-btn span::after {
  content: '';
  top: 7px;
}

.burger-btn span.open {
  background: transparent;
}

.burger-btn span.open::before {
  top: 0;
  transform: rotate(45deg);
}

.burger-btn span.open::after {
  top: 0;
  transform: rotate(-45deg);
}

.mobile-nav {
  display: none;
  flex-direction: column;
  padding: 0.5rem 1rem 1rem;
  gap: 0.25rem;
  background: white;
  border-top: 1px solid #f1f5f9;
}

.mobile-nav-link {
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  background: #eef2ff;
  color: #6366f1;
}

.nav-icon {
  font-size: 1.2rem;
}

.app-main {
  flex: 1;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.app-footer {
  text-align: center;
  padding: 1.5rem;
  color: #94a3b8;
  font-size: 0.8rem;
  border-top: 1px solid #f1f5f9;
}

@media (max-width: 640px) {
  .desktop-nav {
    display: none;
  }

  .burger-btn {
    display: block;
  }

  .mobile-nav {
    display: flex;
  }
}
</style>
