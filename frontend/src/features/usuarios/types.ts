export type Rol = {
  id: number
  descripcion: string
}

export type Usuario = {
  id: number
  rolId: number
  cedula: string
  nombre: string
  apellido: string
  estado: string
}

export type UsuarioCreate = {
  rolId: number
  cedula: string
  nombre: string
  apellido: string
}

export type UsuarioUpdate = {
  rolId: number
  cedula: string
  nombre: string
  apellido: string
  estado: string
}

export type UsuarioPendienteActivacion = {
  id: number
  cedula: string
  nombre: string
  apellido: string
  correo: string
}
