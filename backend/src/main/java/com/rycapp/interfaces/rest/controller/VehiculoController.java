package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.VehiculoUseCase;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.domain.model.Vehiculo;
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
    private final UsuarioRepository usuarioRepository;

    public VehiculoController(VehiculoUseCase useCase, UsuarioRepository usuarioRepository) {
        this.useCase = useCase;
        this.usuarioRepository = usuarioRepository;
    }

    private VehiculoResponse toResponse(Vehiculo v) {
        String conductorNombre = null;
        if (v.conductorId() != null) {
            conductorNombre = usuarioRepository.findById(v.conductorId())
                    .map(u -> u.nombre() + " " + u.apellido())
                    .orElse(null);
        }
        return VehiculoDtoMapper.toResponse(v, conductorNombre);
    }

    @PostMapping
    public ResponseEntity<VehiculoResponse> crear(@Valid @RequestBody VehiculoCreateRequest req) {
        var created = useCase.crear(req.placa(), req.clase(), req.marca(), req.modelo(), req.conductorId());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehiculoResponse> editar(@PathVariable Long id, @Valid @RequestBody VehiculoUpdateRequest req) {
        var updated = useCase.editar(id, req.placa(), req.clase(), req.marca(), req.modelo(), req.conductorId());
        return ResponseEntity.ok(toResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<VehiculoResponse>> listar() {
        var items = useCase.listar().stream().map(this::toResponse).toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehiculoResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(useCase.obtener(id)));
    }
}
