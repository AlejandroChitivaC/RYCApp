package com.rycapp.application.ports.in;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface ReporteUseCase {

    DashboardReport resumen(
            Instant fromInclusive,
            Instant toInclusive,
            Long lineaNegocioId,
            Long proveedorId
    );

    record DashboardReport(
            long operaciones,
            BigDecimal ingresos,
            BigDecimal costos,
            BigDecimal utilidad,
            List<SerieMensual> serieMensual,
            List<SerieLinea> porLinea
    ) {}

    record SerieMensual(
            String periodo,
            long operaciones,
            BigDecimal ingresos,
            BigDecimal costos
    ) {}

    record SerieLinea(
            Long lineaNegocioId,
            String lineaNegocio,
            long operaciones,
            BigDecimal ingresos
    ) {}
}
