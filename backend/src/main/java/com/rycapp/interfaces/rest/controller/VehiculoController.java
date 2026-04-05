package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.VehiculoUseCase;
import com.rycapp.interfaces.rest.dto.vehiculo.VehiculoCreateRequest;
import com.rycapp.interfaces.rest.dto.vehiculo.VehiculoResponse;
import com.rycapp.interfaces.rest.dto.vehiculo.VehiculoUpdateRequest;
import com.rycapp.interfaces.rest.mapper.VehiculoDtoMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/vehiculos")
public class VehiculoController {
    private final VehiculoUseCase useCase;

    public VehiculoController(VehiculoUseCase useCase) {
        this.useCase = useCase;
    }

    @PostMapping
    public ResponseEntity<VehiculoResponse> crear(@Valid @RequestBody VehiculoCreateRequest req) {
        var created = useCase.crear(req.placa(), req.clase(), req.marca(), req.modelo());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(VehiculoDtoMapper.toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehiculoResponse> editar(@PathVariable Long id, @Valid @RequestBody VehiculoUpdateRequest req) {
        var updated = useCase.editar(id, req.placa(), req.clase(), req.marca(), req.modelo());
        return ResponseEntity.ok(VehiculoDtoMapper.toResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<VehiculoResponse>> listar() {
        var items = useCase.listar().stream().map(VehiculoDtoMapper::toResponse).toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehiculoResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(VehiculoDtoMapper.toResponse(useCase.obtener(id)));
    }
}
