<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  {
    icon: '✨',
    title: 'Générer',
    description: 'Créez des QR codes pour vos liens, textes ou sessions.',
    route: '/generate',
    tint: 'var(--brand-1)'
  },
  {
    icon: '🎴',
    title: 'Cartes pro',
    description: 'Générez des cartes de visite scannables en lot.',
    route: '/cards',
    tint: 'var(--brand-3)'
  },
  {
    icon: '📷',
    title: 'Scanner',
    description: 'Lisez un QR code pour marquer une présence.',
    route: '/scan',
    tint: 'var(--ok)'
  },
  {
    icon: '📋',
    title: 'Sessions',
    description: 'Gérez vos sessions et suivez les présences.',
    route: '/sessions',
    tint: 'var(--warn)'
  }
]

const steps = [
  { n: '01', t: 'Saisissez', d: 'Un lien, un texte ou les infos d’une carte.' },
  { n: '02', t: 'Générez', d: 'Le QR code est créé et stocké instantanément.' },
  { n: '03', t: 'Partagez', d: 'Imprimez ou diffusez, il pointe vers votre domaine.' }
]
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero card">
      <div class="hero-copy">
        <span class="badge">⚡ Studio QR codes · v1.0</span>
        <h1 class="hero-title">
          Vos QR codes,<br />
          <span class="gradient-text">élégants et durables.</span>
        </h1>
        <p class="hero-sub">
          Générez, scannez et gérez vos présences depuis une seule application —
          rapide, hors-ligne, et prête à imprimer.
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="router.push('/generate')">
            ✨ Générer un QR code
          </button>
          <button class="btn btn-ghost" @click="router.push('/scan')">
            📷 Scanner
          </button>
        </div>
      </div>

      <!-- Motif QR décoratif -->
      <div class="hero-visual" aria-hidden="true">
        <div class="qr-frame">
          <div class="qr-grid">
            <span v-for="i in 49" :key="i" class="qr-cell" :style="{ '--d': i }"></span>
          </div>
          <span class="qr-eye tl"></span>
          <span class="qr-eye tr"></span>
          <span class="qr-eye bl"></span>
        </div>
      </div>
    </section>

    <!-- Fonctionnalités -->
    <section class="section">
      <p class="eyebrow">Fonctionnalités</p>
      <div class="features-grid">
        <button
          v-for="f in features"
          :key="f.route"
          class="feature-card card"
          :style="{ '--tint': f.tint }"
          @click="router.push(f.route)"
        >
          <span class="feature-icon">{{ f.icon }}</span>
          <span class="feature-body">
            <span class="feature-title">{{ f.title }}</span>
            <span class="feature-desc">{{ f.description }}</span>
          </span>
          <span class="feature-arrow">→</span>
        </button>
      </div>
    </section>

    <!-- Comment ça marche -->
    <section class="section">
      <p class="eyebrow">Comment ça marche</p>
      <div class="steps">
        <div v-for="s in steps" :key="s.n" class="step card">
          <span class="step-n gradient-text">{{ s.n }}</span>
          <h3 class="step-t">{{ s.t }}</h3>
          <p class="step-d">{{ s.d }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* ---------- Hero ---------- */
.hero {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  align-items: center;
  gap: 2rem;
  padding: 2.75rem;
  overflow: hidden;
  position: relative;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.1rem;
}

.hero-title {
  font-size: clamp(2rem, 4.5vw, 3.1rem);
  font-weight: 800;
  line-height: 1.08;
}

.hero-sub {
  color: var(--text-soft);
  font-size: 1.05rem;
  max-width: 42ch;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
}

/* Motif QR animé */
.hero-visual {
  display: grid;
  place-items: center;
}

.qr-frame {
  position: relative;
  width: 220px;
  height: 220px;
  padding: 18px;
  border-radius: var(--r-lg);
  background: var(--surface-2);
  border: 1px solid var(--border);
  box-shadow: var(--sh-md);
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(7, 1fr);
  gap: 6px;
  width: 100%;
  height: 100%;
}

.qr-cell {
  border-radius: 3px;
  background: var(--grad-brand);
  opacity: 0;
  animation: pop 3.4s ease-in-out infinite;
  animation-delay: calc(var(--d) * 60ms);
}

@keyframes pop {
  0%, 100% { opacity: 0.12; transform: scale(0.9); }
  50% { opacity: 0.9; transform: scale(1); }
}

.qr-eye {
  position: absolute;
  width: 46px;
  height: 46px;
  border: 6px solid var(--brand-1);
  border-radius: 12px;
}

.qr-eye.tl { top: 14px; left: 14px; }
.qr-eye.tr { top: 14px; right: 14px; }
.qr-eye.bl { bottom: 14px; left: 14px; }

/* ---------- Sections ---------- */
.section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.35rem;
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--sh-lg);
  border-color: color-mix(in srgb, var(--tint) 55%, transparent);
}

.feature-icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  border-radius: var(--r-md);
  background: color-mix(in srgb, var(--tint) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--tint) 30%, transparent);
}

.feature-body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
}

.feature-title {
  font-weight: 800;
  font-size: 1.02rem;
  color: var(--text);
}

.feature-desc {
  font-size: 0.82rem;
  color: var(--text-mut);
  line-height: 1.4;
}

.feature-arrow {
  color: var(--tint);
  font-size: 1.2rem;
  font-weight: 700;
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.25s ease;
}

.feature-card:hover .feature-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* ---------- Étapes ---------- */
.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.step {
  padding: 1.5rem;
}

.step-n {
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.step-t {
  font-size: 1.05rem;
  margin: 0.4rem 0 0.3rem;
}

.step-d {
  font-size: 0.88rem;
  color: var(--text-mut);
  line-height: 1.5;
}

/* ---------- Responsive ---------- */
@media (max-width: 820px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 2rem 1.5rem;
  }

  .hero-visual {
    display: none;
  }
}
</style>
