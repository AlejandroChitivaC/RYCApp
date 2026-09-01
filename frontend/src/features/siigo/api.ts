import { http } from '../../app/http/httpClient'
import type { SiigoConsulta, SiigoFactura, SiigoHealth, SiigoSyncResult } from './types'

export const siigoApi = {
  health: async () => (await http.get<SiigoHealth>('/api/siigo/health')).data,
  consulta: async () => (await http.get<SiigoConsulta>('/api/siigo/consulta')).data,
  sincronizar: async () =>
    (await http.post<SiigoSyncResult>('/api/siigo/sincronizar', undefined, { timeout: 120000 })).data,
  facturas: async () => (await http.get<SiigoFactura[]>('/api/siigo/facturas')).data,
}
