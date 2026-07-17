<script setup lang="ts">
import { useQrGenerator } from '../composables/useQrGenerator'

defineProps<{
  qrData: string
  format: string
  size: number
}>()

const { download } = useQrGenerator()
</script>

<template>
  <div class="qr-display-card">
    <div class="card-header">
      <span class="icon">✨</span>
      <h3>QR Code Généré</h3>
    </div>

    <!-- QR Code Preview Frame -->
    <div class="qr-preview-container">
      <div class="qr-frame">
        <img :src="qrData" alt="QR Code" class="qr-image" />
      </div>
    </div>

    <!-- Info & Download Metadata -->
    <div class="qr-info">
      <div class="info-pill">
        <span class="label">Format:</span>
        <span class="value">{{ format.toUpperCase() }}</span>
      </div>
      <div class="info-pill">
        <span class="label">Taille:</span>
        <span class="value">{{ size }}x{{ size }}px</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="display-actions">
      <button @click="() => download()" class="btn btn-download">
        <span class="btn-icon">💾</span>
        <span>Télécharger</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.qr-display-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.qr-display-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.card-header .icon {
  font-size: 1.25rem;
}

.qr-preview-container {
  padding: 1.5rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 20px;
  border: 1px dashed #cbd5e1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 320px;
}

.qr-frame {
  background: #ffffff;
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.qr-frame:hover {
  transform: scale(1.03);
}

.qr-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.qr-info {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.info-pill {
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.825rem;
  font-weight: 600;
  display: flex;
  gap: 0.35rem;
  color: #475569;
}

.info-pill .value {
  color: #4f46e5;
}

.display-actions {
  width: 100%;
  display: flex;
  justify-content: center;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  max-width: 240px;
}

.btn-download {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.btn-download:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.btn-download:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1.1rem;
}
</style>
