export type Vehiculo = {
  id: number
  placa: string
  clase: string
  marca: string
  modelo: string
  estado: string
  conductorId: number | null
  conductorNombre: string | null
}

export type VehiculoCreate = {
  placa: string
  clase: string
  marca: string
  modelo: string
  conductorId?: number | null
}

export type VehiculoUpdate = VehiculoCreate
