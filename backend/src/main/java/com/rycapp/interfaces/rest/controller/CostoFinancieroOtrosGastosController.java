package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.CostoFinancieroOtrosGastosUseCase;
import com.rycapp.interfaces.rest.dto.costofinanciero.CostoFinancieroCreateRequest;
import com.rycapp.interfaces.rest.dto.costofinanciero.CostoFinancieroResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/costos-financieros")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
public class CostoFinancieroOtrosGastosController {
    private final CostoFinancieroOtrosGastosUseCase useCase;

    public CostoFinancieroOtrosGastosController(CostoFinancieroOtrosGastosUseCase useCase) {
        this.useCase = useCase;
    }

    private static CostoFinancieroResponse toRes(com.rycapp.domain.model.CostoFinancieroOtrosGastos c) {
        return new CostoFinancieroResponse(
                c.id(), c.usuarioRegistroId(), c.tipoCostoId(), c.fechaInsercion(), c.medioPago(), c.valor(), c.descripcion()
        );
    }

    @PostMapping
    public ResponseEntity<CostoFinancieroResponse> crear(@Valid @RequestBody CostoFinancieroCreateRequest req) {
        var created = useCase.crear(req.usuarioRegistroId(), req.tipoCostoId(), req.medioPago(), req.valor(), req.descripcion());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(toRes(created));
    }

    @GetMapping
    public ResponseEntity<List<CostoFinancieroResponse>> listar() {
        return ResponseEntity.ok(useCase.listar().stream().map(CostoFinancieroOtrosGastosController::toRes).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CostoFinancieroResponse> obtener(@PathVariable String id) {
        return ResponseEntity.ok(toRes(useCase.obtener(id)));
    }
}
