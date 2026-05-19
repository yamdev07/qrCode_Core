import { ref } from 'vue'
import { useCamera } from '@core/composables/useCamera'
import {
  decodeQRCode,
  parseScanResult,
  getScanRegion
} from '@modules/scanner/services/qrScanner.service'
import { handleError } from '@core/errors/errorHandler'
import type { ScanResult } from '@modules/scanner/types/scanner.types'
import { log } from '@core/logger/logger'

export function useQrScanner() {
  const { error: cameraError, start, stop, switchCamera } = useCamera()

  const isScanning = ref(false)
  const lastResult = ref<ScanResult | null>(null)
  const scanError = ref<string | null>(null)
  const scanCount = ref(0)

  let animationFrameId: number | null = null
  let videoRef: HTMLVideoElement | null = null
  let canvasRef: HTMLCanvasElement | null = null

  function initScanner(video: HTMLVideoElement, canvas: HTMLCanvasElement): void {
    videoRef = video
    canvasRef = canvas
  }

  async function startScanning(): Promise<void> {
    if (!videoRef) {
      scanError.value = 'Scanner non initialisé'
      return
    }

    scanError.value = null
    lastResult.value = null

    try {
      await start(videoRef)
      isScanning.value = true
      scanLoop()
      log.info('Scan démarré')
    } catch (error) {
      const appError = handleError(error, 'useQrScanner.startScanning')
      scanError.value = appError.message
    }
  }

  function scanLoop(): void {
    if (!isScanning.value || !videoRef || !canvasRef) return

    const imageData = getScanRegion(videoRef, canvasRef)

    if (imageData) {
      const decoded = decodeQRCode(imageData)

      if (decoded && decoded !== lastResult.value?.content) {
        const result = parseScanResult(decoded)
        lastResult.value = result
        scanCount.value++

        window.dispatchEvent(
          new CustomEvent('qr-scanned', { detail: result })
        )
      }
    }

    animationFrameId = requestAnimationFrame(scanLoop)
  }

  function stopScanning(): void {
    isScanning.value = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    stop()
    log.info('Scan arrêté')
  }

  function clearResult(): void {
    lastResult.value = null
    scanError.value = null
  }

  return {
    isScanning,
    lastResult,
    scanError,
    scanCount,
    cameraError,
    initScanner,
    startScanning,
    stopScanning,
    clearResult,
    switchCamera
  }
}
