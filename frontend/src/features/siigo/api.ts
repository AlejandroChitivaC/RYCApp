import { http } from '../../app/http/httpClient'
import type { SiigoConsulta, SiigoHealth } from './types'

export const siigoApi = {
  health: async () => (await http.get<SiigoHealth>('/api/siigo/health')).data,
  consulta: async () => (await http.get<SiigoConsulta>('/api/siigo/consulta')).data,
}
