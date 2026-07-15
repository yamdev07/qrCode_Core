<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useQrScanner } from '@modules/scanner/composables/useQrScanner'
import type { ScanResult } from '@modules/scanner/types/scanner.types'

const emit = defineEmits<{
  scanned: [result: ScanResult]
  error: [message: string]
}>()

const videoElement = ref<HTMLVideoElement | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)
const scannerReady = ref(false)

const {
  isScanning,
  lastResult,
  scanError,
  cameraError,
  scanCount,
  initScanner,
  startScanning,
  stopScanning,
  clearResult,
  switchCamera
} = useQrScanner()

onMounted(() => {
  if (videoElement.value && canvasElement.value) {
    initScanner(videoElement.value, canvasElement.value)
    scannerReady.value = true
  }
})

onUnmounted(() => {
  stopScanning()
})

watch(lastResult, (result) => {
  if (result) {
    emit('scanned', result)
  }
})

watch(scanError, (err) => {
  if (err) {
    emit('error', err)
  }
})

async function toggleScan(): Promise<void> {
  if (isScanning.value) {
    stopScanning()
  } else {
    clearResult()
    await startScanning()
  }
}
</script>

<template>
  <div class="scanner-container">
    <div
      class="camera-wrapper"
      :class="{ active: isScanning }"
    >
      <video
        ref="videoElement"
        class="camera-video"
        playsinline
        autoplay
        muted
      />
      <canvas
        ref="canvasElement"
        class="scanner-canvas"
      />

      <div
        v-if="isScanning"
        class="scan-overlay"
      >
        <div class="scan-region" />
      </div>

      <div
        v-if="!isScanning"
        class="camera-placeholder"
      >
        <span class="placeholder-icon">📷</span>
        <p>Caméra inactive</p>
      </div>
    </div>

    <div
      v-if="isScanning"
      class="scan-info"
    >
      <span class="scan-indicator" />
      <span>Scan en cours... ({{ scanCount }} scanné{{ scanCount > 1 ? 's' : '' }})</span>
    </div>

    <div
      v-if="cameraError"
      class="error-banner"
    >
      ⚠️ {{ cameraError }}
    </div>
    <div
      v-if="scanError"
      class="error-banner"
    >
      ⚠️ {{ scanError }}
    </div>

    <div class="scanner-controls">
      <button
        class="btn-scan"
        :class="{ scanning: isScanning }"
        :disabled="!scannerReady"
        @click="toggleScan"
      >
        <span v-if="!isScanning">▶️ Démarrer le scan</span>
        <span v-else>⏹️ Arrêter le scan</span>
      </button>

      <button
        v-if="isScanning"
        class="btn-switch"
        title="Changer de caméra"
        @click="switchCamera"
      >
        🔄
      </button>
    </div>
  </div>
</template>

<style scoped>
.scanner-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

.camera-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #0f172a;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-canvas {
  display: none;
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 0.5rem;
}

.placeholder-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.scan-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-region {
  width: 65%;
  aspect-ratio: 1;
  border: 3px solid rgba(99, 102, 241, 0.6);
  border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { border-color: rgba(99, 102, 241, 0.6); }
  50% { border-color: rgba(99, 102, 241, 1); }
}

.scan-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
}

.scan-indicator {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.error-banner {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  text-align: center;
}

.scanner-controls {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-scan {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  background: #6366f1;
  color: white;
}

.btn-scan:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
}

.btn-scan:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-scan.scanning {
  background: #ef4444;
}

.btn-scan.scanning:hover {
  background: #dc2626;
}

.btn-switch {
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.btn-switch:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
</style>
