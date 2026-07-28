import jsQR from 'jsqr'
import type { ScanResult } from '@modules/scanner/types/scanner.types'
import { log } from '@core/logger/logger'

export function decodeQRCode(imageData: ImageData): string | null {
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert'
  })

  return result?.data ?? null
}

export function parseScanResult(content: string): ScanResult {
  const baseResult: Omit<ScanResult, 'format'> = {
    content,
    timestamp: new Date().toISOString()
  }

  try {
    const url = new URL(content)

    if (url.pathname.includes('/presence/') || url.pathname.includes('/session/')) {
      const parts = url.pathname.split('/')
      const sessionId = parts[parts.length - 1]

      log.qrScanned(content)
      return {
        ...baseResult,
        format: 'presence',
        sessionId: sessionId || undefined
      }
    }

    log.qrScanned(content)
    return { ...baseResult, format: 'url' }
  } catch {
    log.qrScanned(content)
    return { ...baseResult, format: 'text' }
  }
}

export function getScanRegion(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): ImageData | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}
