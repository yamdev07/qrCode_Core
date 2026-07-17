import QRCode from 'qrcode'
import type { QRCodeData } from '@modules/generator/types/generator.types'
import { qrOptionsSchema } from '@core/utils/validators'
import { ValidationError } from '@core/errors/AppError'
import { log } from '@core/logger/logger'

export async function generateQRCode(data: QRCodeData): Promise<string> {
  const validation = qrOptionsSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError('Options QR code invalides', {
      errors: validation.error.flatten()
    })
  }

  const validated = validation.data
  const options: QRCode.QRCodeRenderersOptions = {
    errorCorrectionLevel: validated.errorCorrectionLevel,
    margin: validated.margin,
    width: validated.size,
    color: {
      dark: validated.foreground,
      light: validated.background
    }
  }

  try {
    let result: string

    switch (validated.format) {
      case 'svg':
        result = await QRCode.toString(validated.url, { ...options, type: 'svg' })
        break
      case 'png':
        result = await QRCode.toDataURL(validated.url, { ...options, type: 'image/png' })
        break
      case 'dataUrl':
      default:
        result = await QRCode.toDataURL(validated.url, options)
        break
    }

    log.qrGenerated(validated.url, validated.size)
    return result
  } catch (error) {
    log.error('Échec génération QR code', error)
    throw error
  }
}

export function downloadQRCode(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  log.info(`QR code téléchargé: ${filename}`)
}

export function getSvgBlob(svgString: string): Blob {
  return new Blob([svgString], { type: 'image/svg+xml' })
}

export function downloadSvgQRCode(svgString: string, filename: string): void {
  const blob = getSvgBlob(svgString)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  log.info(`QR code SVG téléchargé: ${filename}`)
}
