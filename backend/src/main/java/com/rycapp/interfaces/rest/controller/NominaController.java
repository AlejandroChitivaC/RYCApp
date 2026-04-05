package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.NominaUseCase;
import com.rycapp.interfaces.rest.dto.nomina.NominaCreateRequest;
import com.rycapp.interfaces.rest.dto.nomina.NominaResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/nominas")
public class NominaController {
    private final NominaUseCase useCase;

    public NominaController(NominaUseCase useCase) {
        this.useCase = useCase;
    }

    private static NominaResponse toRes(com.rycapp.domain.model.Nomina n) {
        return new NominaResponse(
                n.id(),
                n.usuarioRegistroId(),
                n.tipoCostoId(),
                n.usuarioDebitadoId(),
                n.fechaInsercion(),
                n.fechaInicio(),
                n.fechaFin(),
                n.medioPago(),
                n.valor(),
                n.descripcion()
        );
    }

    @PostMapping
    public ResponseEntity<NominaResponse> crear(@Valid @RequestBody NominaCreateRequest req) {
        var created = useCase.crear(
                req.usuarioRegistroId(),
                req.tipoCostoId(),
                req.usuarioDebitadoId(),
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
    public ResponseEntity<List<NominaResponse>> listar() {
        return ResponseEntity.ok(useCase.listar().stream().map(NominaController::toRes).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NominaResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(toRes(useCase.obtener(id)));
    }
}
