export type Vehiculo = {
  id: number
  placa: string
  clase: string
  marca: string
  modelo: string
  estado: string
}

export type VehiculoCreate = {
  placa: string
  clase: string
  marca: string
  modelo: string
}

export type VehiculoUpdate = VehiculoCreate
