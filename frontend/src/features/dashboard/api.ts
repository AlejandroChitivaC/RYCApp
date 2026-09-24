import { http } from '../../app/http/httpClient'
import type { ReporteDashboard } from './types'

export const reportesApi = {
  dashboard: async (params?: {
    from?: string
    to?: string
    lineaNegocioId?: string
    proveedorId?: string
  }) =>
    (
      await http.get<ReporteDashboard>('/api/reportes/dashboard', {
        params,
      })
    ).data,
}
