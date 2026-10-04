import { ApiError } from './ApiError'

const baseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')
const tokenKey = 'nagorneva_admin_token'

export const tokenStorage = {
  get: () => localStorage.getItem(tokenKey),
  set: (token: string) => localStorage.setItem(tokenKey, token),
  clear: () => localStorage.removeItem(tokenKey),
}

function parseError(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null) {
    const message = (body as Record<string, unknown>).error ?? (body as Record<string, unknown>).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

async function request<T>(path: string, init: RequestInit, withAuthorization: boolean): Promise<T> {
  const headers = new Headers(init.headers)
  if (withAuthorization) {
    const token = tokenStorage.get()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers })
  if (withAuthorization && (response.status === 401 || response.status === 403)) {
    window.dispatchEvent(new Event('nagorneva:auth-expired'))
  }
  if (!response.ok) {
    let body: unknown
    try {
      body = await response.json()
    } catch {
      body = await response.text().catch(() => '')
    }
    throw new ApiError(parseError(body, `Ошибка запроса (${response.status})`), response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return request<T>(path, init, true)
}

export function publicApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return request<T>(path, init, false)
}

export const apiUrl = baseUrl
