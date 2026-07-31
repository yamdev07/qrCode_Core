<script setup lang="ts">
import DefaultLayout from '@shared/layouts/DefaultLayout.vue'
import ErrorBoundary from '@shared/components/ErrorBoundary.vue'
import { useAuth } from '@modules/admin/composables/useAuth'
import { useTheme } from '@core/composables/useTheme'

// Charge la session admin au démarrage (suivi de l'état de connexion).
useAuth().init()
// Applique le thème persisté avant le premier rendu.
useTheme().init()
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
