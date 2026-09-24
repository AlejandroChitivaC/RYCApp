export type Ticket = {
  id: string
  operacionId: string
  usuarioCargaId: string
  numeroTicket: string | null
  nombreArchivoOriginal: string
  tipoContenidoOriginal: string
  tamanoBytesOriginal: number
  fechaCarga: string
}

export type TicketAuditoria = {
  id: string
  ticketId: string
  usuarioId: string
  usuarioNombre: string
  usuarioApellido: string
  fechaAccion: string
  accion: string
}
