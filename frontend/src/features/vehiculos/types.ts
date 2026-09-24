export type Vehiculo = {
  id: string
  placa: string
  clase: string
  marca: string
  modelo: string
  estado: string
  conductorId: string | null
  conductorNombre: string | null
}

export type VehiculoCreate = {
  placa: string
  clase: string
  marca: string
  modelo: string
  conductorId: string
}

export type VehiculoUpdate = VehiculoCreate
