export const APP_NAME = 'R&C Transportes'

function readBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.toString().trim() ?? ''
  if (import.meta.env.PROD) {
    return raw.startsWith('https://') ? raw : ''
  }
  return raw || 'http://localhost:8080'
}

export const API_BASE_URL = readBaseUrl()
