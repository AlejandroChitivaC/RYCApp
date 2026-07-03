export type Ticket = {
  id: number
  operacionId: number
  usuarioCargaId: number
  numeroTicket: string | null
  nombreArchivoOriginal: string
  tipoContenidoOriginal: string
  tamanoBytesOriginal: number
  fechaCarga: string
}

export type TicketAuditoria = {
  id: number
  ticketId: number
  usuarioId: number
  usuarioNombre: string
  usuarioApellido: string
  fechaAccion: string
  accion: string
}
