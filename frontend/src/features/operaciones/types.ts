export type Operacion = {
  id: number
  usuarioRegistroId: number
  lineaNegocioId: number
  vehiculoId: number
  materialId: number
  proveedorId: number
  fechaInsercion: string
  fechaInicio: string | null
  fechaFin: string | null
  medioPago: string
  valor: string
  descripcion: string | null
  estado: string
  estadoPago: string | null
  facturaSiigo: string | null
}

export type OperacionCreate = {
  lineaNegocioId: number
  vehiculoId: number
  materialId: number
  proveedorId: number
  fechaInicio?: string
  fechaFin?: string
  medioPago: string
  valor: number
  descripcion?: string
}
