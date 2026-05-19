import { consola } from 'consola'
import { AppError } from '@core/errors/AppError'

type ErrorCallback = (error: AppError) => void

const listeners: ErrorCallback[] = []

export function onError(callback: ErrorCallback): () => void {
  listeners.push(callback)
  return () => {
    const index = listeners.indexOf(callback)
    if (index > -1) listeners.splice(index, 1)
  }
}

function notifyListeners(error: AppError): void {
  listeners.forEach(cb => {
    try {
      cb(error)
    } catch (e) {
      consola.error('Error in error listener:', e)
    }
  })
}

export function handleError(error: unknown, context?: string): AppError {
  if (error instanceof AppError) {
    consola.error(`[${error.code}] ${context ? `(${context}) ` : ''}${error.message}`, error.context)
    notifyListeners(error)
    return error
  }

  if (error instanceof Error) {
    const appError = new AppError(
      error.message,
      'UNHANDLED_ERROR',
      500,
      { originalError: error.name, context }
    )
    consola.error(`[${appError.code}] ${context ? `(${context}) ` : ''}${error.message}`)
    notifyListeners(appError)
    return appError
  }

  const unknownError = new AppError(
    'Une erreur inattendue est survenue',
    'UNKNOWN_ERROR',
    500,
    { originalError: String(error), context }
  )
  consola.error(`[${unknownError.code}] Erreur inconnue`, { error, context })
  notifyListeners(unknownError)
  return unknownError
}

export async function tryCatch<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (error) {
    const appError = handleError(error, context)
    return { data: null, error: appError }
  }
}
