import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useQrScanner } from '@modules/scanner/composables/useQrScanner'

const mockGetUserMedia = vi.fn()

Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
    enumerateDevices: vi.fn().mockResolvedValue([])
  },
  writable: true
})

describe('useQrScanner', () => {
  let scanner: ReturnType<typeof useQrScanner>

  beforeEach(() => {
    scanner = useQrScanner()
    vi.clearAllMocks()
  })

  it('devrait initialiser avec les valeurs par défaut', () => {
    expect(scanner.isScanning.value).toBe(false)
    expect(scanner.lastResult.value).toBeNull()
    expect(scanner.scanError.value).toBeNull()
    expect(scanner.scanCount.value).toBe(0)
  })

  it("ne devrait pas scanner sans initialisation d'éléments vidéo/canvas", async () => {
    await scanner.startScanning()
    expect(scanner.scanError.value).toBe('Scanner non initialisé')
    expect(scanner.isScanning.value).toBe(false)
  })

  it('clearResult devrait réinitialiser les résultats', () => {
    scanner.clearResult()
    expect(scanner.lastResult.value).toBeNull()
    expect(scanner.scanError.value).toBeNull()
  })

  it('stopScanning devrait arrêter le scan', () => {
    scanner.stopScanning()
    expect(scanner.isScanning.value).toBe(false)
  })
})
