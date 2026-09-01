package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.OperacionUseCase;
import com.rycapp.application.ports.out.FacturaSiigoRepository;
import com.rycapp.domain.model.FacturaSiigo;
import com.rycapp.domain.model.Operacion;
import com.rycapp.infrastructure.security.JwtPrincipal;
import com.rycapp.interfaces.rest.dto.operacion.OperacionCreateRequest;
import com.rycapp.interfaces.rest.dto.operacion.OperacionResponse;
import com.rycapp.interfaces.rest.mapper.OperacionDtoMapper;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.format.annotation.DateTimeFormat.ISO;

@RestController
@RequestMapping("/api/operaciones")
public class OperacionController {
    private final OperacionUseCase useCase;
    private final FacturaSiigoRepository facturaSiigoRepository;

    public OperacionController(OperacionUseCase useCase, FacturaSiigoRepository facturaSiigoRepository) {
        this.useCase = useCase;
        this.facturaSiigoRepository = facturaSiigoRepository;
    }

    @PostMapping
    public ResponseEntity<OperacionResponse> crear(
            @AuthenticationPrincipal JwtPrincipal principal,
            @Valid @RequestBody OperacionCreateRequest req
    ) {
        var created = useCase.crear(
                principal.usuarioId(),
                req.lineaNegocioId(),
                req.vehiculoId(),
                req.materialId(),
                req.proveedorId(),
                req.fechaInicio(),
                req.fechaFin(),
                req.medioPago(),
                req.valor(),
                req.descripcion()
        );
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(OperacionDtoMapper.toResponse(created));
    }

    @GetMapping
    public ResponseEntity<List<OperacionResponse>> listar(
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = ISO.DATE_TIME) Instant from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = ISO.DATE_TIME) Instant to,
            @RequestParam(value = "lineaNegocioId", required = false) Long lineaNegocioId,
            @RequestParam(value = "vehiculoId", required = false) Long vehiculoId,
            @RequestParam(value = "proveedorId", required = false) Long proveedorId
    ) {
        var items = useCase.filtrar(from, to, lineaNegocioId, vehiculoId, proveedorId);
        return ResponseEntity.ok(mapWithFacturacion(items));
    }

    @GetMapping("/historial")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<List<OperacionResponse>> historial(
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = ISO.DATE_TIME) Instant from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = ISO.DATE_TIME) Instant to,
            @RequestParam(value = "lineaNegocioId", required = false) Long lineaNegocioId,
            @RequestParam(value = "proveedorId", required = false) Long proveedorId
    ) {
        var items = useCase.filtrar(from, to, lineaNegocioId, null, proveedorId);
        return ResponseEntity.ok(mapWithFacturacion(items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperacionResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(OperacionDtoMapper.toResponse(useCase.obtener(id)));
    }

    @PostMapping("/{id}/confirmar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<OperacionResponse> confirmar(@PathVariable Long id) {
        return ResponseEntity.ok(OperacionDtoMapper.toResponse(useCase.confirmar(id)));
    }

    private List<OperacionResponse> mapWithFacturacion(List<Operacion> items) {
        var ids = items.stream().map(Operacion::id).toList();
        Map<Long, FacturaSiigo> porOperacion = new HashMap<>();
        for (FacturaSiigo f : facturaSiigoRepository.findByOperacionIds(ids)) {
            if (f.operacionId() == null) {
                continue;
            }
            porOperacion.merge(f.operacionId(), f, (a, b) ->
                    Comparator.comparing(FacturaSiigo::fechaSincronizacion, Comparator.nullsLast(Comparator.naturalOrder()))
                            .compare(a, b) >= 0 ? a : b);
        }
        return items.stream()
                .map(o -> {
                    var f = porOperacion.get(o.id());
                    if (f == null) {
                        return OperacionDtoMapper.toResponse(o);
                    }
                    return OperacionDtoMapper.toResponse(o, f.estadoPago(), f.numero());
                })
                .toList();
    }
}
