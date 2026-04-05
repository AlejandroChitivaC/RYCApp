export const APP_NAME = 'R&C Transportes'

function readBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.toString().trim()
  return raw && raw.length > 0 ? raw : 'http://localhost:8080'
}

export const API_BASE_URL = readBaseUrl()

