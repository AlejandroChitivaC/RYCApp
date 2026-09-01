package com.rycapp.application.service;

import com.rycapp.application.ports.in.SiigoFacturaSyncUseCase;
import com.rycapp.application.ports.out.FacturaSiigoRepository;
import com.rycapp.application.ports.out.OperacionRepository;
import com.rycapp.application.ports.out.ProveedorRepository;
import com.rycapp.application.ports.out.SiigoAuthPort;
import com.rycapp.application.ports.out.SiigoAuthPort.SiigoAuthException;
import com.rycapp.application.ports.out.SiigoQueryPort;
import com.rycapp.application.ports.out.SiigoQueryPort.InvoiceSummary;
import com.rycapp.application.ports.out.SiigoQueryPort.SiigoQueryException;
import com.rycapp.domain.model.EstadoPagoFactura;
import com.rycapp.domain.model.FacturaSiigo;
import com.rycapp.domain.model.Operacion;
import com.rycapp.domain.model.OperacionEstados;
import com.rycapp.infrastructure.siigo.SiigoProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SiigoFacturaSyncService implements SiigoFacturaSyncUseCase {

    private static final Logger log = LoggerFactory.getLogger(SiigoFacturaSyncService.class);
    private static final Pattern OP_REF = Pattern.compile(
            "(?i)(?:OP-|operaci[oó]n\\s*#?\\s*)(\\d+)"
    );
    private static final AtomicBoolean RUNNING = new AtomicBoolean(false);

    private final SiigoAuthPort siigoAuthPort;
    private final SiigoQueryPort siigoQueryPort;
    private final FacturaSiigoRepository facturaSiigoRepository;
    private final OperacionRepository operacionRepository;
    private final ProveedorRepository proveedorRepository;
    private final SiigoProperties properties;

    public SiigoFacturaSyncService(
            SiigoAuthPort siigoAuthPort,
            SiigoQueryPort siigoQueryPort,
            FacturaSiigoRepository facturaSiigoRepository,
            OperacionRepository operacionRepository,
            ProveedorRepository proveedorRepository,
            SiigoProperties properties
    ) {
        this.siigoAuthPort = siigoAuthPort;
        this.siigoQueryPort = siigoQueryPort;
        this.facturaSiigoRepository = facturaSiigoRepository;
        this.operacionRepository = operacionRepository;
        this.proveedorRepository = proveedorRepository;
        this.properties = properties;
    }

    @Override
    public SyncResult sincronizar() {
        if (!siigoAuthPort.credentialsConfigured()) {
            return new SyncResult(false, false, "Credenciales Siigo no configuradas.", 0, 0, 0, 0);
        }
        if (!RUNNING.compareAndSet(false, true)) {
            return new SyncResult(false, true, "Ya hay una sincronización en curso.", 0, 0, 0, 0);
        }
        try {
            var token = siigoAuthPort.obtenerToken();
            List<Operacion> confirmadas = operacionRepository.findByEstado(OperacionEstados.CONFIRMADA);

            int leidas = 0;
            int guardadas = 0;
            int vinculadas = 0;
            int omitidasBorrador = 0;

            int page = 1;
            int maxPages = Math.max(1, properties.invoiceMaxPages());
            int pageSize = Math.max(1, properties.invoicePageSize());

            while (page <= maxPages) {
                var batch = siigoQueryPort.listarFacturas(token.accessToken(), page, pageSize);
                if (batch.results() == null || batch.results().isEmpty()) {
                    break;
                }
                for (InvoiceSummary inv : batch.results()) {
                    leidas++;
                    if (esBorrador(inv.stampStatus())) {
                        omitidasBorrador++;
                        continue;
                    }
                    Long operacionId = resolverOperacion(inv, confirmadas);
                    FacturaSiigo guardada = upsert(inv, operacionId);
                    guardadas++;
                    if (guardada.operacionId() != null) {
                        vinculadas++;
                    }
                }
                if (batch.results().size() < pageSize) {
                    break;
                }
                if (batch.totalResults() > 0 && leidas >= batch.totalResults()) {
                    break;
                }
                page++;
            }

            String msg = "Sincronización de facturas Siigo completada.";
            log.info("[Siigo] Sync OK | leidas={} guardadas={} vinculadas={} omitidasBorrador={}",
                    leidas, guardadas, vinculadas, omitidasBorrador);
            return new SyncResult(true, true, msg, leidas, guardadas, vinculadas, omitidasBorrador);
        } catch (SiigoAuthException | SiigoQueryException | IllegalStateException ex) {
            log.warn("[Siigo] Sync falló | {}", ex.getMessage());
            return new SyncResult(false, true, ex.getMessage(), 0, 0, 0, 0);
        } finally {
            RUNNING.set(false);
        }
    }

    @Override
    public List<FacturaSiigo> listarFacturas() {
        return facturaSiigoRepository.findAll();
    }

    private FacturaSiigo upsert(InvoiceSummary inv, Long operacionId) {
        LocalDate fecha = parseDate(inv.date());
        LocalDate vencimiento = parseDate(inv.dueDate());
        LocalDate hoy = LocalDate.now(ZoneOffset.UTC);
        String estadoPago = EstadoPagoFactura.calcular(inv.balance(), vencimiento, hoy);
        Instant now = Instant.now();

        Long id = null;
        Long operacionFinal = operacionId;
        var existente = facturaSiigoRepository.findBySiigoInvoiceId(inv.id());
        if (existente.isPresent()) {
            id = existente.get().id();
            if (operacionFinal == null) {
                operacionFinal = existente.get().operacionId();
            }
        }

        String numero = inv.name() != null && !inv.name().isBlank()
                ? inv.name()
                : (inv.number() != null ? String.valueOf(inv.number()) : null);

        return facturaSiigoRepository.save(new FacturaSiigo(
                id,
                operacionFinal,
                inv.id(),
                numero,
                inv.prefix(),
                fecha,
                vencimiento,
                inv.customerIdentification(),
                null,
                inv.total() != null ? inv.total() : BigDecimal.ZERO,
                inv.balance() != null ? inv.balance() : BigDecimal.ZERO,
                estadoPago,
                inv.observations(),
                now
        ));
    }

    private Long resolverOperacion(InvoiceSummary inv, List<Operacion> confirmadas) {
        Optional<Long> porTexto = extraerOperacionId(inv.observations(), inv.name());
        if (porTexto.isPresent()) {
            Long id = porTexto.get();
            boolean confirmada = confirmadas.stream().anyMatch(o -> o.id().equals(id));
            return confirmada ? id : null;
        }

        String nit = soloDigitos(inv.customerIdentification());
        if (nit.isEmpty()) {
            return null;
        }

        var proveedor = proveedorRepository.findByNitIgnoreCase(inv.customerIdentification().trim());
        if (proveedor.isEmpty() && !nit.equals(inv.customerIdentification().trim())) {
            proveedor = confirmadas.stream()
                    .map(Operacion::proveedorId)
                    .distinct()
                    .map(proveedorRepository::findById)
                    .flatMap(Optional::stream)
                    .filter(p -> soloDigitos(p.nit()).equals(nit))
                    .findFirst();
        }
        if (proveedor.isEmpty()) {
            return null;
        }
        Long proveedorId = proveedor.get().id();
        BigDecimal total = inv.total() != null ? inv.total() : BigDecimal.ZERO;
        LocalDate fechaFactura = parseDate(inv.date());

        List<Operacion> candidatas = confirmadas.stream()
                .filter(o -> o.proveedorId().equals(proveedorId))
                .filter(o -> mismoValor(o.valor(), total))
                .toList();

        if (candidatas.size() == 1) {
            return candidatas.getFirst().id();
        }
        if (fechaFactura != null && candidatas.size() > 1) {
            List<Operacion> porFecha = candidatas.stream()
                    .filter(o -> mismaFecha(o, fechaFactura))
                    .toList();
            if (porFecha.size() == 1) {
                return porFecha.getFirst().id();
            }
        }
        return null;
    }

    static Optional<Long> extraerOperacionId(String observations, String name) {
        for (String text : new String[]{observations, name}) {
            if (text == null || text.isBlank()) {
                continue;
            }
            Matcher m = OP_REF.matcher(text);
            if (m.find()) {
                return Optional.of(Long.parseLong(m.group(1)));
            }
        }
        return Optional.empty();
    }

    private static boolean esBorrador(String stampStatus) {
        if (stampStatus == null || stampStatus.isBlank()) {
            return false;
        }
        String s = stampStatus.toLowerCase(Locale.ROOT);
        return s.contains("draft") || s.contains("borrador");
    }

    private static boolean mismoValor(BigDecimal a, BigDecimal b) {
        if (a == null || b == null) {
            return false;
        }
        return a.setScale(2, java.math.RoundingMode.HALF_UP)
                .compareTo(b.setScale(2, java.math.RoundingMode.HALF_UP)) == 0;
    }

    private static boolean mismaFecha(Operacion o, LocalDate fecha) {
        if (fechaEn(o.fechaInicio(), fecha) || fechaEn(o.fechaFin(), fecha) || fechaEn(o.fechaInsercion(), fecha)) {
            return true;
        }
        return false;
    }

    private static boolean fechaEn(Instant instant, LocalDate fecha) {
        if (instant == null) {
            return false;
        }
        return LocalDate.ofInstant(instant, ZoneOffset.UTC).equals(fecha);
    }

    private static LocalDate parseDate(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(raw.substring(0, Math.min(10, raw.length())));
        } catch (Exception ex) {
            return null;
        }
    }

    private static String soloDigitos(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("\\D", "");
    }
}
