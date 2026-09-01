package com.rycapp.interfaces.rest.dto.reporte;

import java.math.BigDecimal;
import java.util.List;

public record ReporteDashboardResponse(
        long operaciones,
        BigDecimal ingresos,
        BigDecimal costos,
        BigDecimal utilidad,
        List<SerieMensualItem> serieMensual,
        List<SerieLineaItem> porLinea
) {
    public record SerieMensualItem(
            String periodo,
            long operaciones,
            BigDecimal ingresos,
            BigDecimal costos
    ) {}

    public record SerieLineaItem(
            Long lineaNegocioId,
            String lineaNegocio,
            long operaciones,
            BigDecimal ingresos
    ) {}
}
