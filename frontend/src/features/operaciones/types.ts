export type Operacion = {
  id: string
  usuarioRegistroId: string
  lineaNegocioId: string
  vehiculoId: string
  materialId: string
  proveedorId: string
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
  lineaNegocioId: string
  vehiculoId: string
  materialId: string
  proveedorId: string
  fechaInicio: string
  fechaFin: string
  medioPago: string
  valor: number
  descripcion?: string
}
