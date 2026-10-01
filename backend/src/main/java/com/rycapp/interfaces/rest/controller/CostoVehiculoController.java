package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.CostoVehiculoUseCase;
import com.rycapp.interfaces.rest.dto.costovehiculo.CostoVehiculoCreateRequest;
import com.rycapp.interfaces.rest.dto.costovehiculo.CostoVehiculoResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/costos-vehiculo")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
public class CostoVehiculoController {
    private final CostoVehiculoUseCase useCase;

    public CostoVehiculoController(CostoVehiculoUseCase useCase) {
        this.useCase = useCase;
    }

    private static CostoVehiculoResponse toRes(com.rycapp.domain.model.CostoVehiculo c) {
        return new CostoVehiculoResponse(
                c.id(),
                c.usuarioRegistroId(),
                c.tipoCostoId(),
                c.vehiculoId(),
                c.fechaInsercion(),
                c.fechaInicio(),
                c.fechaFin(),
                c.medioPago(),
                c.valor(),
                c.motivo(),
                c.descripcion()
        );
    }

    @PostMapping
    public ResponseEntity<CostoVehiculoResponse> crear(@Valid @RequestBody CostoVehiculoCreateRequest req) {
        var created = useCase.crear(
                req.usuarioRegistroId(),
                req.tipoCostoId(),
                req.vehiculoId(),
                req.fechaInicio(),
                req.fechaFin(),
                req.medioPago(),
                req.valor(),
                req.motivo(),
                req.descripcion()
        );
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(toRes(created));
    }

    @GetMapping
    public ResponseEntity<List<CostoVehiculoResponse>> listar() {
        return ResponseEntity.ok(useCase.listar().stream().map(CostoVehiculoController::toRes).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CostoVehiculoResponse> obtener(@PathVariable String id) {
        return ResponseEntity.ok(toRes(useCase.obtener(id)));
    }
}
