export type Rol = {
  id: string
  descripcion: string
}

export type Usuario = {
  id: string
  rolId: string
  cedula: string
  nombre: string
  apellido: string
  estado: string
}

export type UsuarioCreate = {
  rolId: string
  cedula: string
  nombre: string
  apellido: string
}

export type UsuarioUpdate = {
  rolId: string
  cedula: string
  nombre: string
  apellido: string
  estado: string
}

export type UsuarioPendienteActivacion = {
  id: string
  cedula: string
  nombre: string
  apellido: string
  correo: string
}
