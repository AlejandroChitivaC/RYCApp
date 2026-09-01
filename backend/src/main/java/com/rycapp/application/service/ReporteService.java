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
import java.util.stream.Collectors;

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
            Long lineaNegocioId,
            Long proveedorId
    ) {
        List<Operacion> operaciones = operacionRepository.filter(
                fromInclusive, toInclusive, lineaNegocioId, null, proveedorId
        );

        BigDecimal ingresos = operaciones.stream()
                .map(o -> o.valor() != null ? o.valor() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Instant> costosFechas = new ArrayList<>();
        List<BigDecimal> costosValores = new ArrayList<>();
        collectCostos(fromInclusive, toInclusive, costosFechas, costosValores);
        BigDecimal costos = costosValores.stream().reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, LineaNegocio> lineas = lineaNegocioRepository.findAll().stream()
                .filter(l -> l.id() != null)
                .collect(Collectors.toMap(l -> String.valueOf(l.id()), l -> l, (a, b) -> a));

        return new DashboardReport(
                operaciones.size(),
                ingresos,
                costos,
                ingresos.subtract(costos),
                serieMensual(operaciones, costosFechas, costosValores, fromInclusive, toInclusive),
                porLinea(operaciones, lineas)
        );
    }

    private void collectCostos(
            Instant from,
            Instant to,
            List<Instant> fechas,
            List<BigDecimal> valores
    ) {
        nominaRepository.findAll().forEach(n -> addIfInRange(n.fechaInsercion(), n.valor(), from, to, fechas, valores));
        costoAdministrativoRepository.findAll().forEach(c -> addIfInRange(c.fechaInsercion(), c.valor(), from, to, fechas, valores));
        costoVehiculoRepository.findAll().forEach(c -> addIfInRange(c.fechaInsercion(), c.valor(), from, to, fechas, valores));
        costoFinancieroRepository.findAll().forEach(c -> addIfInRange(c.fechaInsercion(), c.valor(), from, to, fechas, valores));
    }

    private static void addIfInRange(
            Instant fecha,
            BigDecimal valor,
            Instant from,
            Instant to,
            List<Instant> fechas,
            List<BigDecimal> valores
    ) {
        if (fecha == null) {
            return;
        }
        if (from != null && fecha.isBefore(from)) {
            return;
        }
        if (to != null && fecha.isAfter(to)) {
            return;
        }
        fechas.add(fecha);
        valores.add(valor != null ? valor : BigDecimal.ZERO);
    }

    private static List<SerieMensual> serieMensual(
            List<Operacion> operaciones,
            List<Instant> costosFechas,
            List<BigDecimal> costosValores,
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

        Map<YearMonth, long[]> ops = new LinkedHashMap<>();
        Map<YearMonth, BigDecimal> ing = new LinkedHashMap<>();
        Map<YearMonth, BigDecimal> cos = new LinkedHashMap<>();
        for (YearMonth ym = start; !ym.isAfter(end); ym = ym.plusMonths(1)) {
            ops.put(ym, new long[]{0});
            ing.put(ym, BigDecimal.ZERO);
            cos.put(ym, BigDecimal.ZERO);
        }

        for (Operacion o : operaciones) {
            if (o.fechaInsercion() == null) {
                continue;
            }
            YearMonth ym = YearMonth.from(o.fechaInsercion().atZone(ZoneOffset.UTC));
            if (!ops.containsKey(ym)) {
                continue;
            }
            ops.get(ym)[0]++;
            ing.put(ym, ing.get(ym).add(o.valor() != null ? o.valor() : BigDecimal.ZERO));
        }
        for (int i = 0; i < costosFechas.size(); i++) {
            YearMonth ym = YearMonth.from(costosFechas.get(i).atZone(ZoneOffset.UTC));
            if (!cos.containsKey(ym)) {
                continue;
            }
            cos.put(ym, cos.get(ym).add(costosValores.get(i)));
        }

        List<SerieMensual> serie = new ArrayList<>();
        for (YearMonth ym : ops.keySet()) {
            serie.add(new SerieMensual(
                    ym.toString(),
                    ops.get(ym)[0],
                    ing.get(ym),
                    cos.get(ym)
            ));
        }
        return serie;
    }

    private static List<SerieLinea> porLinea(List<Operacion> operaciones, Map<String, LineaNegocio> lineas) {
        Map<Long, long[]> counts = new LinkedHashMap<>();
        Map<Long, BigDecimal> ingresos = new LinkedHashMap<>();
        for (Operacion o : operaciones) {
            Long id = o.lineaNegocioId();
            counts.computeIfAbsent(id, k -> new long[]{0})[0]++;
            ingresos.merge(id, o.valor() != null ? o.valor() : BigDecimal.ZERO, BigDecimal::add);
        }
        return counts.entrySet().stream()
                .map(e -> {
                    LineaNegocio ln = lineas.get(String.valueOf(e.getKey()));
                    String nombre = ln != null ? ln.lineaNegocio() : ("Línea #" + e.getKey());
                    return new SerieLinea(e.getKey(), nombre, e.getValue()[0], ingresos.getOrDefault(e.getKey(), BigDecimal.ZERO));
                })
                .sorted(Comparator.comparing(SerieLinea::ingresos).reversed())
                .toList();
    }
}
