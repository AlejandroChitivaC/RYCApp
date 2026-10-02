package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.ProveedorUseCase;
import com.rycapp.interfaces.rest.dto.proveedor.ProveedorCreateRequest;
import com.rycapp.interfaces.rest.dto.proveedor.ProveedorEstadoRequest;
import com.rycapp.interfaces.rest.dto.proveedor.ProveedorResponse;
import com.rycapp.interfaces.rest.dto.proveedor.ProveedorUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {
    private final ProveedorUseCase useCase;

    public ProveedorController(ProveedorUseCase useCase) {
        this.useCase = useCase;
    }

    private static ProveedorResponse toRes(com.rycapp.domain.model.Proveedor p) {
        return new ProveedorResponse(p.id(), p.nombre(), p.nit(), p.departamento(), p.municipio(), p.descripcion(), p.estado());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ProveedorResponse> crear(@Valid @RequestBody ProveedorCreateRequest req) {
        var created = useCase.crear(req.nombre(), req.nit(), req.departamento(), req.municipio(), req.descripcion());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(toRes(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ProveedorResponse> editar(@PathVariable String id, @Valid @RequestBody ProveedorUpdateRequest req) {
        return ResponseEntity.ok(toRes(useCase.editar(id, req.nombre(), req.nit(), req.departamento(), req.municipio(), req.descripcion())));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ProveedorResponse> cambiarEstado(
            @PathVariable String id,
            @Valid @RequestBody ProveedorEstadoRequest req
    ) {
        return ResponseEntity.ok(toRes(useCase.cambiarEstado(id, req.estado())));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<List<ProveedorResponse>> listar() {
        return ResponseEntity.ok(useCase.listar().stream().map(ProveedorController::toRes).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<ProveedorResponse> obtener(@PathVariable String id) {
        return ResponseEntity.ok(toRes(useCase.obtener(id)));
    }
}
