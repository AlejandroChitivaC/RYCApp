import { http } from '../../app/http/httpClient'
import type {
  CategoriaCosto,
  CostoCreate,
  CostoRegistro,
  TipoCosto,
  TipoCostoCreate,
  TipoCostoUpdate,
} from './types'

type CostoApiBase = {
  id: string
  usuarioRegistroId: string
  tipoCostoId: string
  fechaInsercion: string
  medioPago: string
  valor: string | number
  descripcion: string | null
}

type NominaApi = CostoApiBase & {
  usuarioDebitadoId: string
  fechaInicio: string | null
  fechaFin: string | null
}

type AdminApi = CostoApiBase & {
  fechaInicio: string | null
  fechaFin: string | null
}

type VehiculoApi = CostoApiBase & {
  vehiculoId: string
  fechaInicio: string | null
  fechaFin: string | null
  motivo: string | null
}

function base(categoria: CategoriaCosto, row: CostoApiBase): CostoRegistro {
  return {
    id: row.id,
    categoria,
    usuarioRegistroId: row.usuarioRegistroId,
    tipoCostoId: row.tipoCostoId,
    usuarioDebitadoId: null,
    vehiculoId: null,
    fechaInsercion: row.fechaInsercion,
    fechaInicio: null,
    fechaFin: null,
    medioPago: row.medioPago,
    valor: row.valor,
    motivo: null,
    descripcion: row.descripcion,
  }
}

export const tiposCostoApi = {
  list: async () => (await http.get<TipoCosto[]>('/api/tipos-costo')).data,
  create: async (payload: TipoCostoCreate) =>
    (await http.post<TipoCosto>('/api/tipos-costo', payload)).data,
  update: async (id: string, payload: TipoCostoUpdate) =>
    (await http.put<TipoCosto>(`/api/tipos-costo/${id}`, payload)).data,
}

export const costosApi = {
  list: async (): Promise<CostoRegistro[]> => {
    const [nominas, admin, vehiculos, financieros] = await Promise.all([
      http.get<NominaApi[]>('/api/nominas'),
      http.get<AdminApi[]>('/api/costos-administrativos'),
      http.get<VehiculoApi[]>('/api/costos-vehiculo'),
      http.get<CostoApiBase[]>('/api/costos-financieros'),
    ])
    return [
      ...nominas.data.map((row) => ({
        ...base('NOMINA', row),
        usuarioDebitadoId: row.usuarioDebitadoId,
        fechaInicio: row.fechaInicio,
        fechaFin: row.fechaFin,
      })),
      ...admin.data.map((row) => ({
        ...base('ADMINISTRATIVO', row),
        fechaInicio: row.fechaInicio,
        fechaFin: row.fechaFin,
      })),
      ...vehiculos.data.map((row) => ({
        ...base('VEHICULO', row),
        vehiculoId: row.vehiculoId,
        fechaInicio: row.fechaInicio,
        fechaFin: row.fechaFin,
        motivo: row.motivo,
      })),
      ...financieros.data.map((row) => base('FINANCIERO', row)),
    ]
  },

  create: async (payload: CostoCreate): Promise<CostoRegistro> => {
    const comun = {
      usuarioRegistroId: payload.usuarioRegistroId,
      tipoCostoId: payload.tipoCostoId,
      medioPago: payload.medioPago,
      valor: payload.valor,
      descripcion: payload.descripcion,
    }
    if (payload.categoria === 'NOMINA') {
      const created = (
        await http.post<NominaApi>('/api/nominas', {
          ...comun,
          usuarioDebitadoId: payload.usuarioDebitadoId,
          fechaInicio: payload.fechaInicio,
          fechaFin: payload.fechaFin,
        })
      ).data
      return {
        ...base('NOMINA', created),
        usuarioDebitadoId: created.usuarioDebitadoId,
        fechaInicio: created.fechaInicio,
        fechaFin: created.fechaFin,
      }
    }
    if (payload.categoria === 'ADMINISTRATIVO') {
      const created = (
        await http.post<AdminApi>('/api/costos-administrativos', {
          ...comun,
          fechaInicio: payload.fechaInicio,
          fechaFin: payload.fechaFin,
        })
      ).data
      return {
        ...base('ADMINISTRATIVO', created),
        fechaInicio: created.fechaInicio,
        fechaFin: created.fechaFin,
      }
    }
    if (payload.categoria === 'VEHICULO') {
      const created = (
        await http.post<VehiculoApi>('/api/costos-vehiculo', {
          ...comun,
          vehiculoId: payload.vehiculoId,
          fechaInicio: payload.fechaInicio,
          fechaFin: payload.fechaFin,
          motivo: payload.motivo,
        })
      ).data
      return {
        ...base('VEHICULO', created),
        vehiculoId: created.vehiculoId,
        fechaInicio: created.fechaInicio,
        fechaFin: created.fechaFin,
        motivo: created.motivo,
      }
    }
    const created = (await http.post<CostoApiBase>('/api/costos-financieros', comun)).data
    return base('FINANCIERO', created)
  },
}
