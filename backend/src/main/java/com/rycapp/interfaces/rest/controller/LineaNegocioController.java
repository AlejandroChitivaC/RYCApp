package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.LineaNegocioUseCase;
import com.rycapp.interfaces.rest.dto.lineanegocio.LineaNegocioCreateRequest;
import com.rycapp.interfaces.rest.dto.lineanegocio.LineaNegocioEstadoRequest;
import com.rycapp.interfaces.rest.dto.lineanegocio.LineaNegocioResponse;
import com.rycapp.interfaces.rest.dto.lineanegocio.LineaNegocioUpdateRequest;
import com.rycapp.interfaces.rest.mapper.LineaNegocioDtoMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<LineaNegocioResponse> crear(@Valid @RequestBody LineaNegocioCreateRequest req) {
        var created = useCase.crear(req.lineaNegocio(), req.descripcion());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(LineaNegocioDtoMapper.toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LineaNegocioResponse> editar(@PathVariable Long id, @Valid @RequestBody LineaNegocioUpdateRequest req) {
        var updated = useCase.editar(id, req.lineaNegocio(), req.descripcion());
        return ResponseEntity.ok(LineaNegocioDtoMapper.toResponse(updated));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<LineaNegocioResponse> cambiarEstado(@PathVariable Long id, @Valid @RequestBody LineaNegocioEstadoRequest req) {
        var updated = useCase.cambiarEstado(id, req.estado());
        return ResponseEntity.ok(LineaNegocioDtoMapper.toResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<LineaNegocioResponse>> listar() {
        var items = useCase.listar().stream().map(LineaNegocioDtoMapper::toResponse).toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LineaNegocioResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(LineaNegocioDtoMapper.toResponse(useCase.obtener(id)));
    }
}
