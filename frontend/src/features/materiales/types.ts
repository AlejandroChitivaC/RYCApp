export type Material = {
  id: string
  material: string
  descripcion: string | null
}

export type MaterialCreate = {
  material: string
  descripcion?: string
}

export type MaterialUpdate = MaterialCreate
