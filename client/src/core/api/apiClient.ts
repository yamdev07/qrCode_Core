// src/core/api/apiClient.ts
import { ofetch } from 'ofetch'
import { ApiError } from '@core/errors/AppError'
import { log } from '@core/logger/logger'

const BASE_URL = import.meta.env.VITE_API_URL || ''

export const apiClient = ofetch.create({
  baseURL: BASE_URL,
  timeout: 15000,
  retry: 1,
  retryDelay: 1000,

  async onRequest({ request, options }) {
    const startTime = performance.now()
    ;(options as any)._startTime = startTime
    log.debug(`Requête ${options.method?.toUpperCase() || 'GET'} ${request}`)
  },

  async onResponse({ response, options }) {
    const duration = Math.round(performance.now() - ((options as any)._startTime as number))
    log.apiCall(options.method?.toUpperCase() || 'GET', response.url, duration)
    if (!response.ok) {
      const body = (response as any)._data
      throw new ApiError(body?.message || `Erreur HTTP ${response.status}`, response.status, body)
    }

  },

  async onResponseError({ response, options }) {
    const duration = Math.round(performance.now() - ((options as any)._startTime as number))
    log.error(`Erreur API ${response.status} sur ${response.url} (${duration}ms)`)
    throw new ApiError(`Erreur serveur (${response.status})`, response.status, { url: response.url })
  }
})

export async function apiGet<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
  return apiClient<T>(endpoint, { method: 'GET', params })
}

export async function apiPost<T>(endpoint: string, body?: any): Promise<T> {
  return apiClient<T>(endpoint, { method: 'POST', body })
}

export async function apiPut<T>(endpoint: string, body?: any): Promise<T> {
  return apiClient<T>(endpoint, { method: 'PUT', body })
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: 'DELETE' })
}
