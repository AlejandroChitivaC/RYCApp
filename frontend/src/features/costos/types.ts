export const CATEGORIAS_COSTO = [
  { value: 'NOMINA', label: 'Nómina' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
  { value: 'VEHICULO', label: 'Vehículo' },
  { value: 'FINANCIERO', label: 'Financiero' },
] as const

export type CategoriaCosto = (typeof CATEGORIAS_COSTO)[number]['value']

export function labelCategoria(value: string) {
  return CATEGORIAS_COSTO.find((c) => c.value === value)?.label ?? value
}

export type TipoCosto = {
  id: string
  tipoCosto: string
  flujo: string
  descripcion: string | null
  estado: string
}

export type TipoCostoCreate = {
  tipoCosto: string
  flujo: string
  descripcion?: string
}

export type TipoCostoUpdate = TipoCostoCreate & {
  estado: string
}

export type CostoRegistro = {
  id: string
  categoria: CategoriaCosto
  usuarioRegistroId: string
  tipoCostoId: string
  usuarioDebitadoId: string | null
  vehiculoId: string | null
  fechaInsercion: string
  fechaInicio: string | null
  fechaFin: string | null
  medioPago: string
  valor: string | number
  motivo: string | null
  descripcion: string | null
}

export type CostoCreate = {
  categoria: CategoriaCosto
  usuarioRegistroId: string
  tipoCostoId: string
  usuarioDebitadoId?: string
  vehiculoId?: string
  fechaInicio?: string
  fechaFin?: string
  medioPago: string
  valor: number
  motivo?: string
  descripcion?: string
}
