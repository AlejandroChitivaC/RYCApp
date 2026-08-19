export type SiigoHealth = {
  connected: boolean
  configured: boolean
  message: string
  tokenType: string | null
  expiresInSeconds: number | null
}

export type SiigoDocumentType = {
  id: number
  code: string | null
  name: string | null
  prefix: string | null
  active: boolean
}

export type SiigoUser = {
  id: number
  username: string | null
  email: string | null
  active: boolean
}

export type SiigoConsulta = {
  ok: boolean
  configured: boolean
  message: string
  baseUrl: string | null
  partnerId: string | null
  username: string | null
  documentTypesCount: number
  documentTypes: SiigoDocumentType[]
  usersTotal: number
  usersSample: SiigoUser[]
}

export type SiigoLogLevel = 'success' | 'warning' | 'error' | 'info'

export type SiigoLogEntry = {
  id: string
  at: string
  action: 'HEALTH' | 'CONSULTA'
  level: SiigoLogLevel
  title: string
  message: string
  detail?: string
}
