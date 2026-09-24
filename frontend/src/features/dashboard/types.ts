export type SerieMensual = {
  periodo: string
  operaciones: number
  ingresos: string
  costos: string
}

export type SerieLinea = {
  lineaNegocioId: string
  lineaNegocio: string
  operaciones: number
  ingresos: string
}

export type ReporteDashboard = {
  operaciones: number
  ingresos: string
  costos: string
  utilidad: string
  serieMensual: SerieMensual[]
  porLinea: SerieLinea[]
}
