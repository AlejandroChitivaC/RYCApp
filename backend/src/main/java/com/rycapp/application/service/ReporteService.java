package com.rycapp.application.service;

import com.rycapp.application.ports.in.ReporteUseCase;
import com.rycapp.application.ports.out.CostoAdministrativoRepository;
import com.rycapp.application.ports.out.CostoFinancieroOtrosGastosRepository;
import com.rycapp.application.ports.out.CostoVehiculoRepository;
import com.rycapp.application.ports.out.LineaNegocioRepository;
import com.rycapp.application.ports.out.NominaRepository;
import com.rycapp.application.ports.out.OperacionRepository;
import com.rycapp.domain.model.LineaNegocio;
import com.rycapp.domain.model.Operacion;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReporteService implements ReporteUseCase {

    private final OperacionRepository operacionRepository;
    private final LineaNegocioRepository lineaNegocioRepository;
    private final NominaRepository nominaRepository;
    private final CostoAdministrativoRepository costoAdministrativoRepository;
    private final CostoVehiculoRepository costoVehiculoRepository;
    private final CostoFinancieroOtrosGastosRepository costoFinancieroRepository;

    public ReporteService(
            OperacionRepository operacionRepository,
            LineaNegocioRepository lineaNegocioRepository,
            NominaRepository nominaRepository,
            CostoAdministrativoRepository costoAdministrativoRepository,
            CostoVehiculoRepository costoVehiculoRepository,
            CostoFinancieroOtrosGastosRepository costoFinancieroRepository
    ) {
        this.operacionRepository = operacionRepository;
        this.lineaNegocioRepository = lineaNegocioRepository;
        this.nominaRepository = nominaRepository;
        this.costoAdministrativoRepository = costoAdministrativoRepository;
        this.costoVehiculoRepository = costoVehiculoRepository;
        this.costoFinancieroRepository = costoFinancieroRepository;
    }

    @Override
    public DashboardReport resumen(
            Instant fromInclusive,
            Instant toInclusive,
            String lineaNegocioId,
            String proveedorId
    ) {
        List<Operacion> operaciones = operacionRepository.filter(
                fromInclusive, toInclusive, lineaNegocioId, null, proveedorId
        );

        BigDecimal ingresos = operaciones.stream()
                .map(o -> o.valor() != null ? o.valor() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CostoPunto> costos = collectCostos(fromInclusive, toInclusive);
        BigDecimal totalCostos = costos.stream()
                .map(CostoPunto::valor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, String> nombresLinea = new LinkedHashMap<>();
        for (LineaNegocio linea : lineaNegocioRepository.findAll()) {
            if (linea.id() != null) {
                nombresLinea.put(linea.id(), linea.lineaNegocio());
            }
        }

        return new DashboardReport(
                operaciones.size(),
                ingresos,
                totalCostos,
                ingresos.subtract(totalCostos),
                serieMensual(operaciones, costos, fromInclusive, toInclusive),
                porLinea(operaciones, nombresLinea)
        );
    }

    private List<CostoPunto> collectCostos(Instant from, Instant to) {
        List<CostoPunto> out = new ArrayList<>();
        nominaRepository.findByFechaInsercionBetween(from, to)
                .forEach(n -> out.add(new CostoPunto(n.fechaInsercion(), n.valor())));
        costoAdministrativoRepository.findByFechaInsercionBetween(from, to)
                .forEach(c -> out.add(new CostoPunto(c.fechaInsercion(), c.valor())));
        costoVehiculoRepository.findByFechaInsercionBetween(from, to)
                .forEach(c -> out.add(new CostoPunto(c.fechaInsercion(), c.valor())));
        costoFinancieroRepository.findByFechaInsercionBetween(from, to)
                .forEach(c -> out.add(new CostoPunto(c.fechaInsercion(), c.valor())));
        return out;
    }

    private static List<SerieMensual> serieMensual(
            List<Operacion> operaciones,
            List<CostoPunto> costos,
            Instant from,
            Instant to
    ) {
        YearMonth start;
        YearMonth end;
        if (from != null && to != null) {
            start = YearMonth.from(from.atZone(ZoneOffset.UTC));
            end = YearMonth.from(to.atZone(ZoneOffset.UTC));
        } else {
            end = YearMonth.now(ZoneOffset.UTC);
            start = end.minusMonths(5);
        }
        if (start.isAfter(end)) {
            YearMonth tmp = start;
            start = end;
            end = tmp;
        }

        Map<YearMonth, Acumulado> meses = new LinkedHashMap<>();
        for (YearMonth ym = start; !ym.isAfter(end); ym = ym.plusMonths(1)) {
            meses.put(ym, new Acumulado());
        }

        for (Operacion o : operaciones) {
            if (o.fechaInsercion() == null) {
                continue;
            }
            YearMonth ym = YearMonth.from(o.fechaInsercion().atZone(ZoneOffset.UTC));
            Acumulado acc = meses.get(ym);
            if (acc == null) {
                continue;
            }
            acc.operaciones++;
            acc.ingresos = acc.ingresos.add(o.valor() != null ? o.valor() : BigDecimal.ZERO);
        }
        for (CostoPunto c : costos) {
            if (c.fecha() == null) {
                continue;
            }
            YearMonth ym = YearMonth.from(c.fecha().atZone(ZoneOffset.UTC));
            Acumulado acc = meses.get(ym);
            if (acc == null) {
                continue;
            }
            acc.costos = acc.costos.add(c.valor() != null ? c.valor() : BigDecimal.ZERO);
        }

        List<SerieMensual> serie = new ArrayList<>();
        for (Map.Entry<YearMonth, Acumulado> e : meses.entrySet()) {
            Acumulado acc = e.getValue();
            serie.add(new SerieMensual(e.getKey().toString(), acc.operaciones, acc.ingresos, acc.costos));
        }
        return serie;
    }

    private static List<SerieLinea> porLinea(List<Operacion> operaciones, Map<String, String> nombres) {
        Map<String, Acumulado> porId = new LinkedHashMap<>();
        for (Operacion o : operaciones) {
            Acumulado acc = porId.computeIfAbsent(o.lineaNegocioId(), k -> new Acumulado());
            acc.operaciones++;
            acc.ingresos = acc.ingresos.add(o.valor() != null ? o.valor() : BigDecimal.ZERO);
        }
        return porId.entrySet().stream()
                .map(e -> new SerieLinea(
                        e.getKey(),
                        nombres.getOrDefault(e.getKey(), "Línea " + e.getKey()),
                        e.getValue().operaciones,
                        e.getValue().ingresos
                ))
                .sorted(Comparator.comparing(SerieLinea::ingresos).reversed())
                .toList();
    }

    private record CostoPunto(Instant fecha, BigDecimal valor) {}

    private static final class Acumulado {
        long operaciones;
        BigDecimal ingresos = BigDecimal.ZERO;
        BigDecimal costos = BigDecimal.ZERO;
    }
}
