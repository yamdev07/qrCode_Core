// src/core/logger/logger.ts
import { consola } from 'consola'

const logger = consola.create({
  level: import.meta.env.DEV ? 5 : 3, // verbose in dev, warnings+ in prod
  defaults: {
    tag: 'QRApp'
  }
})

export const log = {
  debug: (message: string, ...args: unknown[]) => logger.debug(message, ...args),
  info: (message: string, ...args: unknown[]) => logger.info(message, ...args),
  warn: (message: string, ...args: unknown[]) => logger.warn(message, ...args),
  error: (message: string, ...args: unknown[]) => logger.error(message, ...args),
  success: (message: string, ...args: unknown[]) => logger.success(message, ...args),

  // métier logs
  qrGenerated: (url: string, size: number) => logger.info(`QR code généré: ${url} (${size}px)`),
  qrScanned: (content: string) => logger.info(`QR code scanné: ${content.substring(0, 50)}...`),
  presenceMarked: (sessionId: string, userId: string) => logger.success(`Présence marquée: session=${sessionId}, user=${userId}`),
  apiCall: (method: string, endpoint: string, duration: number) => logger.debug(`API ${method} ${endpoint} - ${duration}ms`)
}
