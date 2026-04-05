package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.MaterialUseCase;
import com.rycapp.interfaces.rest.dto.material.MaterialCreateRequest;
import com.rycapp.interfaces.rest.dto.material.MaterialResponse;
import com.rycapp.interfaces.rest.dto.material.MaterialUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<MaterialResponse> crear(@Valid @RequestBody MaterialCreateRequest req) {
        var created = useCase.crear(req.material(), req.descripcion());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(toRes(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialResponse> editar(@PathVariable Long id, @Valid @RequestBody MaterialUpdateRequest req) {
        return ResponseEntity.ok(toRes(useCase.editar(id, req.material(), req.descripcion())));
    }

    @GetMapping
    public ResponseEntity<List<MaterialResponse>> listar() {
        return ResponseEntity.ok(useCase.listar().stream().map(MaterialController::toRes).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(toRes(useCase.obtener(id)));
    }
}
