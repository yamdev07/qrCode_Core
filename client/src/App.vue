<script setup lang="ts">
import DefaultLayout from '@shared/layouts/DefaultLayout.vue'
import ErrorBoundary from '@shared/components/ErrorBoundary.vue'
import { useAuth } from '@modules/admin/composables/useAuth'

// Charge la session admin au démarrage (suivi de l'état de connexion).
useAuth().init()
</script>

<template>
  <ErrorBoundary>
    <DefaultLayout>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </DefaultLayout>
  </ErrorBoundary>
</template>

<style>
/* Styles globaux */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #fafbfc;
  color: #1e293b;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
