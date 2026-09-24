package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.CostoAdministrativoUseCase;
import com.rycapp.interfaces.rest.dto.costoadmin.CostoAdministrativoCreateRequest;
import com.rycapp.interfaces.rest.dto.costoadmin.CostoAdministrativoResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/costos-administrativos")
public class CostoAdministrativoController {
    private final CostoAdministrativoUseCase useCase;

    public CostoAdministrativoController(CostoAdministrativoUseCase useCase) {
        this.useCase = useCase;
    }

    private static CostoAdministrativoResponse toRes(com.rycapp.domain.model.CostoAdministrativo c) {
        return new CostoAdministrativoResponse(
                c.id(),
                c.usuarioRegistroId(),
                c.tipoCostoId(),
                c.fechaInsercion(),
                c.fechaInicio(),
                c.fechaFin(),
                c.medioPago(),
                c.valor(),
                c.descripcion()
        );
    }

    @PostMapping
    public ResponseEntity<CostoAdministrativoResponse> crear(@Valid @RequestBody CostoAdministrativoCreateRequest req) {
        var created = useCase.crear(
                req.usuarioRegistroId(),
                req.tipoCostoId(),
                req.fechaInicio(),
                req.fechaFin(),
                req.medioPago(),
                req.valor(),
                req.descripcion()
        );
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(toRes(created));
    }

    @GetMapping
    public ResponseEntity<List<CostoAdministrativoResponse>> listar() {
        return ResponseEntity.ok(useCase.listar().stream().map(CostoAdministrativoController::toRes).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CostoAdministrativoResponse> obtener(@PathVariable String id) {
        return ResponseEntity.ok(toRes(useCase.obtener(id)));
    }
}
