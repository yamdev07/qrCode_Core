import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Accueil' }
  },
  {
    path: '/generate',
    name: 'generate',
    component: () => import('@/views/GenerateView.vue'),
    meta: { title: 'Générer un QR code', requiresAuth: true }
  },
  {
    path: '/cards',
    name: 'cards',
    component: () => import('@/views/CardsView.vue'),
    meta: { title: 'Cartes QR en lot', requiresAuth: true }
  },
  {
    path: '/carte/:id',
    name: 'card-view',
    component: () => import('@/views/CardViewerView.vue'),
    meta: { title: 'Carte' }
  },
  {
    path: '/recherche',
    name: 'search',
    component: () => import('@/views/CardSearchView.vue'),
    meta: { title: 'Rechercher un QR', requiresAuth: true }
  },
  {
    path: '/scan',
    name: 'scan',
    component: () => import('@/views/ScanView.vue'),
    meta: { title: 'Scanner' }
  },
  {
    path: '/presence/:code',
    name: 'presence',
    component: () => import('@/views/PresenceView.vue'),
    meta: { title: 'Confirmation de présence' }
  },
  {
    path: '/sessions',
    name: 'sessions',
    component: () => import('@/views/SessionsView.vue'),
    meta: { title: 'Sessions', requiresAuth: true }
  },
  {
    path: '/sessions/:id',
    name: 'session-detail',
    component: () => import('@/views/SessionDetailView.vue'),
    meta: { title: 'Détail session', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Connexion' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { title: 'Administration', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Page introuvable' }
  }
]
