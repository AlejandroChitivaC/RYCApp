export type Material = {
  id: number
  material: string
  descripcion: string | null
}

export type MaterialCreate = {
  material: string
  descripcion?: string
}

export type MaterialUpdate = MaterialCreate
