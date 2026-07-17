import { log } from '@core/logger/logger'

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

export interface QrCodeRecord {
  id: string
  url: string
  image_path: string
  mime_type: string
  format: string
  size: number
  margin: number
  foreground: string
  background: string
  error_correction_level: string
  created_at: string
}

export async function saveQrCode(
  url: string,
  imageDataUrl: string,
  options: {
    format?: string
    size?: number
    margin?: number
    foreground?: string
    background?: string
    errorCorrectionLevel?: string
  } = {}
): Promise<QrCodeRecord> {
  const res = await fetch(`${API}/qrcodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      imageDataUrl,
      format: options.format || 'png',
      size: options.size || 300,
      margin: options.margin || 2,
      foreground: options.foreground || '#000000',
      background: options.background || '#FFFFFF',
      errorCorrectionLevel: options.errorCorrectionLevel || 'M'
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
    throw new Error(err.error || `Erreur serveur (${res.status})`)
  }

  const record = await res.json()
  log.info(`QR code sauvegardé: ${record.id}`)
  return record
}

export async function getQrCodes(): Promise<QrCodeRecord[]> {
  const res = await fetch(`${API}/qrcodes`)
  if (!res.ok) return []
  return res.json()
}

export function getQrCodeImageUrl(imagePath: string): string {
  return `/uploads/${imagePath}`
}

export async function findQrCodeByUrl(url: string): Promise<QrCodeRecord | null> {
  const res = await fetch(`${API}/qrcodes/by-url?url=${encodeURIComponent(url)}`)
  if (!res.ok) return null
  return res.json()
}

export async function deleteQrCode(id: string): Promise<void> {
  const res = await fetch(`${API}/qrcodes/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Impossible de supprimer le QR code')
  log.info(`QR code supprimé: ${id}`)
}
