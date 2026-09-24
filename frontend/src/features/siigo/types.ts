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
  action: 'HEALTH' | 'CONSULTA' | 'SYNC'
  level: SiigoLogLevel
  title: string
  message: string
  detail?: string
}

export type SiigoSyncResult = {
  ok: boolean
  configured: boolean
  message: string
  leidas: number
  guardadas: number
  vinculadas: number
  omitidasBorrador: number
}

export type SiigoFactura = {
  id: string
  operacionId: string | null
  siigoInvoiceId: string
  numero: string | null
  prefijo: string | null
  fecha: string | null
  fechaVencimiento: string | null
  identificacionCliente: string | null
  nombreCliente: string | null
  total: string
  saldo: string
  estadoPago: string
  observaciones: string | null
  fechaSincronizacion: string
}
