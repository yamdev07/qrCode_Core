import type { QRCodeFormat } from '@core/types/global.types'

export type QRCodeData = {
  url: string
  size: number
  format: QRCodeFormat
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  foreground: string
  background: string
  margin: number
}

export type QRHistoryItem = {
  id: string
  url: string
  size: number
  format: QRCodeFormat
  createdAt: string
  label?: string
}

export type QRGeneratorState = {
  currentQR: string | null // dataUrl
  history: QRHistoryItem[]
  isGenerating: boolean
}
