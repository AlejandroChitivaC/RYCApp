package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.OperacionUseCase;
import com.rycapp.interfaces.rest.dto.operacion.OperacionCreateRequest;
import com.rycapp.interfaces.rest.dto.operacion.OperacionResponse;
import com.rycapp.interfaces.rest.mapper.OperacionDtoMapper;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.Instant;
import java.util.List;

import static org.springframework.format.annotation.DateTimeFormat.ISO;

@RestController
@RequestMapping("/api/operaciones")
public class OperacionController {
    private final OperacionUseCase useCase;

    public OperacionController(OperacionUseCase useCase) {
        this.useCase = useCase;
    }

    @PostMapping
    public ResponseEntity<OperacionResponse> crear(@Valid @RequestBody OperacionCreateRequest req) {
        var created = useCase.crear(
                req.usuarioRegistroId(),
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

    @GetMapping("/{id}")
    public ResponseEntity<OperacionResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(OperacionDtoMapper.toResponse(useCase.obtener(id)));
    }

    @GetMapping
    public ResponseEntity<List<OperacionResponse>> listar(
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = ISO.DATE_TIME) Instant from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = ISO.DATE_TIME) Instant to,
            @RequestParam(value = "lineaNegocioId", required = false) Long lineaNegocioId,
            @RequestParam(value = "vehiculoId", required = false) Long vehiculoId
    ) {
        var items = useCase.filtrar(from, to, lineaNegocioId, vehiculoId).stream().map(OperacionDtoMapper::toResponse).toList();
        return ResponseEntity.ok(items);
    }
}
