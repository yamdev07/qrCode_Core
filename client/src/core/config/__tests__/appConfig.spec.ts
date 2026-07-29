import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * Une erreur ici se propage jusque sur du papier : un QR imprimé garde l'URL
 * encodée au moment de la génération. D'où le test sur la valeur exacte.
 */
async function loadConfig(publicUrl?: string) {
  vi.resetModules()
  vi.stubEnv('VITE_PUBLIC_URL', publicUrl ?? '')
  return import('../appConfig')
}

describe('appConfig', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('utilise VITE_PUBLIC_URL quand il est défini', async () => {
    const { publicUrl } = await loadConfig('https://qrcode.anyxtech.com')
    expect(publicUrl('carte/abc123')).toBe('https://qrcode.anyxtech.com/carte/abc123')
  })

  it('ignore le slash final de la variable', async () => {
    const { publicUrl } = await loadConfig('https://qrcode.anyxtech.com/')
    expect(publicUrl('carte/abc123')).toBe('https://qrcode.anyxtech.com/carte/abc123')
  })

  it('accepte un chemin avec ou sans slash initial', async () => {
    const { publicUrl } = await loadConfig('https://qrcode.anyxtech.com')
    expect(publicUrl('/presence/AB12')).toBe('https://qrcode.anyxtech.com/presence/AB12')
  })

  it('retombe sur l’origine du navigateur si la variable est vide', async () => {
    const { publicUrl } = await loadConfig('')
    expect(publicUrl('carte/abc123')).toBe(`${window.location.origin}/carte/abc123`)
  })
})
