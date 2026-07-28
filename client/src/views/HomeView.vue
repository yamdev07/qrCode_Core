<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  {
    icon: '✨',
    title: 'Générer',
    description: 'Créez des QR codes pour vos liens, texte ou sessions',
    route: '/generate',
    color: '#6366f1'
  },
  {
    icon: '📷',
    title: 'Scanner',
    description: 'Scannez un QR code pour marquer votre présence',
    route: '/scan',
    color: '#22c55e'
  },
  {
    icon: '📋',
    title: 'Sessions',
    description: 'Gerez vos sessions et suivez les présences',
    route: '/sessions',
    color: '#f59e0b'
  }
]
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">QRCode Pro</h1>
      <p class="hero-subtitle">
        Générez, scannez et gérez vos présences en toute simplicité
      </p>
    </div>

    <div class="features-grid">
      <div
        v-for="feature in features"
        :key="feature.route"
        class="feature-card"
        :style="{ '--accent': feature.color }"
        @click="router.push(feature.route)"
      >
        <span class="feature-icon">{{ feature.icon }}</span>
        <h3 class="feature-title">{{ feature.title }}</h3>
        <p class="feature-description">{{ feature.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 1rem 0;
}

.hero {
  text-align: center;
  padding: 2rem 0 3rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 0.75rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
  max-width: 480px;
  margin-inline: auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
  max-width: 800px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.75rem;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.feature-card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
}

.feature-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.feature-title {
  font-size: 1.15rem;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.feature-description {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
}
</style>
