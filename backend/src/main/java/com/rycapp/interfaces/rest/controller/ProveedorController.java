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
    public ResponseEntity<ProveedorResponse> crear(@Valid @RequestBody ProveedorCreateRequest req) {
        var created = useCase.crear(req.nombre(), req.nit(), req.departamento(), req.municipio(), req.descripcion());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(toRes(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProveedorResponse> editar(@PathVariable Long id, @Valid @RequestBody ProveedorUpdateRequest req) {
        return ResponseEntity.ok(toRes(useCase.editar(id, req.nombre(), req.nit(), req.departamento(), req.municipio(), req.descripcion())));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ProveedorResponse> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ProveedorEstadoRequest req
    ) {
        return ResponseEntity.ok(toRes(useCase.cambiarEstado(id, req.estado())));
    }

    @GetMapping
    public ResponseEntity<List<ProveedorResponse>> listar() {
        return ResponseEntity.ok(useCase.listar().stream().map(ProveedorController::toRes).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProveedorResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(toRes(useCase.obtener(id)));
    }
}
