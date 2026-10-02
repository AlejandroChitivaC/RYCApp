package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.MaterialUseCase;
import com.rycapp.interfaces.rest.dto.material.MaterialCreateRequest;
import com.rycapp.interfaces.rest.dto.material.MaterialResponse;
import com.rycapp.interfaces.rest.dto.material.MaterialUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/materiales")
public class MaterialController {
    private final MaterialUseCase useCase;

    public MaterialController(MaterialUseCase useCase) {
        this.useCase = useCase;
    }

    private static MaterialResponse toRes(com.rycapp.domain.model.Material m) {
        return new MaterialResponse(m.id(), m.material(), m.descripcion());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<MaterialResponse> crear(@Valid @RequestBody MaterialCreateRequest req) {
        var created = useCase.crear(req.material(), req.descripcion());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(toRes(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<MaterialResponse> editar(@PathVariable String id, @Valid @RequestBody MaterialUpdateRequest req) {
        return ResponseEntity.ok(toRes(useCase.editar(id, req.material(), req.descripcion())));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<List<MaterialResponse>> listar() {
        return ResponseEntity.ok(useCase.listar().stream().map(MaterialController::toRes).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<MaterialResponse> obtener(@PathVariable String id) {
        return ResponseEntity.ok(toRes(useCase.obtener(id)));
    }
}
