package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.TipoCostoUseCase;
import com.rycapp.interfaces.rest.dto.tipocosto.TipoCostoCreateRequest;
import com.rycapp.interfaces.rest.dto.tipocosto.TipoCostoResponse;
import com.rycapp.interfaces.rest.dto.tipocosto.TipoCostoUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/tipos-costo")
public class TipoCostoController {
    private final TipoCostoUseCase useCase;

    public TipoCostoController(TipoCostoUseCase useCase) {
        this.useCase = useCase;
    }

    private static TipoCostoResponse toRes(com.rycapp.domain.model.TipoCosto t) {
        return new TipoCostoResponse(t.id(), t.tipoCosto(), t.flujo(), t.descripcion(), t.estado());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<TipoCostoResponse> crear(@Valid @RequestBody TipoCostoCreateRequest req) {
        var created = useCase.crear(req.tipoCosto(), req.flujo(), req.descripcion());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(toRes(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<TipoCostoResponse> editar(@PathVariable String id, @Valid @RequestBody TipoCostoUpdateRequest req) {
        return ResponseEntity.ok(toRes(useCase.editar(id, req.tipoCosto(), req.flujo(), req.descripcion(), req.estado())));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<List<TipoCostoResponse>> listar() {
        return ResponseEntity.ok(useCase.listar().stream().map(TipoCostoController::toRes).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<TipoCostoResponse> obtener(@PathVariable String id) {
        return ResponseEntity.ok(toRes(useCase.obtener(id)));
    }
}
