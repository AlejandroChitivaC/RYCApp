package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.LineaNegocioUseCase;
import com.rycapp.interfaces.rest.dto.lineanegocio.LineaNegocioCreateRequest;
import com.rycapp.interfaces.rest.dto.lineanegocio.LineaNegocioEstadoRequest;
import com.rycapp.interfaces.rest.dto.lineanegocio.LineaNegocioResponse;
import com.rycapp.interfaces.rest.dto.lineanegocio.LineaNegocioUpdateRequest;
import com.rycapp.interfaces.rest.mapper.LineaNegocioDtoMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/lineas-negocio")
public class LineaNegocioController {
    private final LineaNegocioUseCase useCase;

    public LineaNegocioController(LineaNegocioUseCase useCase) {
        this.useCase = useCase;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LineaNegocioResponse> crear(@Valid @RequestBody LineaNegocioCreateRequest req) {
        var created = useCase.crear(req.lineaNegocio(), req.descripcion());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(LineaNegocioDtoMapper.toResponse(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LineaNegocioResponse> editar(@PathVariable String id, @Valid @RequestBody LineaNegocioUpdateRequest req) {
        var updated = useCase.editar(id, req.lineaNegocio(), req.descripcion());
        return ResponseEntity.ok(LineaNegocioDtoMapper.toResponse(updated));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LineaNegocioResponse> cambiarEstado(@PathVariable String id, @Valid @RequestBody LineaNegocioEstadoRequest req) {
        var updated = useCase.cambiarEstado(id, req.estado());
        return ResponseEntity.ok(LineaNegocioDtoMapper.toResponse(updated));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<List<LineaNegocioResponse>> listar() {
        var items = useCase.listar().stream().map(LineaNegocioDtoMapper::toResponse).toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<LineaNegocioResponse> obtener(@PathVariable String id) {
        return ResponseEntity.ok(LineaNegocioDtoMapper.toResponse(useCase.obtener(id)));
    }
}
