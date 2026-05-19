import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useQrGenerator } from '../composables/useQrGenerator'

vi.mock('@core/logger/logger', () => ({
  log: {
    qrGenerated: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}))

describe('useQrGenerator composable', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should initialize with default options', () => {
    const { formData, generatedQR, isGenerating, errorMessage } = useQrGenerator()

    expect(formData.url).toBe('')
    expect(formData.size).toBe(256)
    expect(formData.format).toBe('png')
    expect(formData.foreground).toBe('#000000')
    expect(formData.background).toBe('#FFFFFF')
    expect(formData.margin).toBe(4)
    expect(generatedQR.value).toBeNull()
    expect(isGenerating.value).toBe(false)
    expect(errorMessage.value).toBeNull()
  })

  it('should validate URLs correctly', () => {
    const { formData, isUrlValid } = useQrGenerator()

    expect(isUrlValid.value).toBeNull()

    formData.url = 'invalid-url'
    expect(isUrlValid.value).toBe(false)

    formData.url = 'https://google.com'
    expect(isUrlValid.value).toBe(true)
  })

  it('should generate a QR code successfully', async () => {
    const { formData, generatedQR, generate, isGenerating } = useQrGenerator()

    formData.url = 'https://example.com'
    formData.format = 'png'

    const generatePromise = generate()
    expect(isGenerating.value).toBe(true)

    const result = await generatePromise

    expect(isGenerating.value).toBe(false)
    expect(result).toContain('data:image/png;base64')
    expect(generatedQR.value).toBe(result)
  })

  it('should set an error message on validation failure', async () => {
    const { formData, generatedQR, generate, errorMessage } = useQrGenerator()

    formData.url = 'invalid-url'

    const result = await generate()

    expect(result).toBeNull()
    expect(generatedQR.value).toBeNull()
    expect(errorMessage.value).toBeDefined()
  })

  it('should reset values correctly', () => {
    const { formData, generatedQR, reset } = useQrGenerator()

    formData.url = 'https://example.com'
    formData.size = 512
    generatedQR.value = 'mock-qr-data'

    reset()

    expect(formData.url).toBe('')
    expect(formData.size).toBe(256)
    expect(generatedQR.value).toBeNull()
  })
})
