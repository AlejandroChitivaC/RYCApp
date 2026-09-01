package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.ReporteUseCase;
import com.rycapp.interfaces.rest.dto.reporte.ReporteDashboardResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

import static org.springframework.format.annotation.DateTimeFormat.ISO;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteUseCase useCase;

    public ReporteController(ReporteUseCase useCase) {
        this.useCase = useCase;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ReporteDashboardResponse> dashboard(
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = ISO.DATE_TIME) Instant from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = ISO.DATE_TIME) Instant to,
            @RequestParam(value = "lineaNegocioId", required = false) Long lineaNegocioId,
            @RequestParam(value = "proveedorId", required = false) Long proveedorId
    ) {
        var r = useCase.resumen(from, to, lineaNegocioId, proveedorId);
        return ResponseEntity.ok(new ReporteDashboardResponse(
                r.operaciones(),
                r.ingresos(),
                r.costos(),
                r.utilidad(),
                r.serieMensual().stream()
                        .map(s -> new ReporteDashboardResponse.SerieMensualItem(
                                s.periodo(), s.operaciones(), s.ingresos(), s.costos()))
                        .toList(),
                r.porLinea().stream()
                        .map(s -> new ReporteDashboardResponse.SerieLineaItem(
                                s.lineaNegocioId(), s.lineaNegocio(), s.operaciones(), s.ingresos()))
                        .toList()
        ));
    }
}
