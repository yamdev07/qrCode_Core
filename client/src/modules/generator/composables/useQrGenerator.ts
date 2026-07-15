import { ref, reactive, computed } from 'vue'
import { generateQRCode, downloadQRCode, downloadSvgQRCode } from '@modules/generator/services/qrGenerator.service'
import { useQrHistory } from '@modules/generator/composables/useQrHistory'
import { handleError } from '@core/errors/errorHandler'
import { urlSchema } from '@core/utils/validators'
import type { QRCodeData } from '@modules/generator/types/generator.types'

const formData = reactive<QRCodeData>({
  url: '',
  size: 256,
  format: 'png',
  errorCorrectionLevel: 'M',
  foreground: '#000000',
  background: '#FFFFFF',
  margin: 4
})

const generatedQR = ref<string | null>(null)
const isGenerating = ref(false)
const errorMessage = ref<string | null>(null)

export function useQrGenerator() {
  const { addToHistory } = useQrHistory()

  const isUrlValid = computed(() => {
    if (!formData.url) return null
    return urlSchema.safeParse(formData.url).success
  })

  async function generate(): Promise<string | null> {
    if (!formData.url) {
      errorMessage.value = "L'URL est requise"
      return null
    }

    errorMessage.value = null
    isGenerating.value = true

    try {
      const qrData = await generateQRCode({ ...formData })
      generatedQR.value = qrData
      addToHistory({
        url: formData.url,
        size: formData.size,
        format: formData.format
      })
      return qrData
    } catch (error) {
      const appError = handleError(error, 'useQrGenerator.generate')
      errorMessage.value = appError.message
      generatedQR.value = null
      return null
    } finally {
      isGenerating.value = false
    }
  }

  function download(filename?: string): void {
    if (!generatedQR.value) return

    const name = filename || `qr-code-${Date.now()}`

    try {
      if (formData.format === 'svg') {
        downloadSvgQRCode(generatedQR.value, `${name}.svg`)
      } else {
        downloadQRCode(generatedQR.value, `${name}.${formData.format}`)
      }
    } catch (error) {
      handleError(error, 'useQrGenerator.download')
    }
  }

  function reset(): void {
    formData.url = ''
    formData.size = 256
    formData.format = 'png'
    formData.errorCorrectionLevel = 'M'
    formData.foreground = '#000000'
    formData.background = '#FFFFFF'
    formData.margin = 4
    generatedQR.value = null
    errorMessage.value = null
  }

  return {
    formData,
    generatedQR,
    isGenerating,
    errorMessage,
    isUrlValid,
    generate,
    download,
    reset
  }
}
