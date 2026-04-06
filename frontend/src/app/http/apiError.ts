import type { AxiosError } from 'axios'

export type ApiErrorResponse = {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  fieldErrors?: Record<string, string>
  code?: string
}

export function getApiErrorMessage(err: unknown): string {
  const fallback = 'Ocurrió un error inesperado. Intenta nuevamente.'
  if (!err) return fallback

  const axiosErr = err as AxiosError<ApiErrorResponse>
  const data = axiosErr.response?.data
  const msg = data?.message || axiosErr.message
  return msg || fallback
}

export function getFieldErrors(err: unknown): Record<string, string> | undefined {
  const axiosErr = err as AxiosError<ApiErrorResponse>
  return axiosErr.response?.data?.fieldErrors
}

export function getApiErrorCode(err: unknown): string | undefined {
  const axiosErr = err as AxiosError<ApiErrorResponse>
  return axiosErr.response?.data?.code
}

