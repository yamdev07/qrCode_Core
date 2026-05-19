import { describe, it, expect } from 'vitest'
import { parseScanResult } from '@modules/scanner/services/qrScanner.service'

describe('qrScanner.service', () => {
  describe('parseScanResult', () => {
    it('devrait détecter une URL standard', () => {
      const result = parseScanResult('https://exemple.com/page')
      expect(result.format).toBe('url')
      expect(result.content).toBe('https://exemple.com/page')
    })

    it('devrait détecter une session de présence', () => {
      const result = parseScanResult('https://app.com/session/abc-123')
      expect(result.format).toBe('presence')
      expect(result.sessionId).toBe('abc-123')
    })

    it('devrait détecter du texte simple', () => {
      const result = parseScanResult('Hello World')
      expect(result.format).toBe('text')
    })

    it('devrait avoir un timestamp', () => {
      const result = parseScanResult('test')
      expect(result.timestamp).toBeTruthy()
      expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(Date.now())
    })
  })
})
