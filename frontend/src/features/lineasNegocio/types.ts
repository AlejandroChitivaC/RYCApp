export type LineaNegocio = {
  id: string
  lineaNegocio: string
  descripcion: string | null
  estado: string
}

export type LineaNegocioCreate = {
  lineaNegocio: string
  descripcion?: string
}

export type LineaNegocioUpdate = {
  lineaNegocio: string
  descripcion?: string
}
