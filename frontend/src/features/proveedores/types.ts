export type Proveedor = {
  id: string
  nombre: string
  nit: string
  departamento: string | null
  municipio: string | null
  descripcion: string | null
  estado: string
}

export type ProveedorCreate = {
  nombre: string
  nit: string
  departamento?: string
  municipio?: string
  descripcion?: string
}

export type ProveedorUpdate = ProveedorCreate
