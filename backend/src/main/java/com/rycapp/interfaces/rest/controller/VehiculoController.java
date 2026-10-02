package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.VehiculoUseCase;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.domain.model.Vehiculo;
import com.rycapp.interfaces.rest.dto.vehiculo.VehiculoCreateRequest;
import com.rycapp.interfaces.rest.dto.vehiculo.VehiculoEstadoRequest;
import com.rycapp.interfaces.rest.dto.vehiculo.VehiculoResponse;
import com.rycapp.interfaces.rest.dto.vehiculo.VehiculoUpdateRequest;
import com.rycapp.interfaces.rest.mapper.VehiculoDtoMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<VehiculoResponse> crear(@Valid @RequestBody VehiculoCreateRequest req) {
        var created = useCase.crear(req.placa(), req.clase(), req.marca(), req.modelo(), req.conductorId());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(toResponse(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<VehiculoResponse> editar(@PathVariable String id, @Valid @RequestBody VehiculoUpdateRequest req) {
        var updated = useCase.editar(id, req.placa(), req.clase(), req.marca(), req.modelo(), req.conductorId());
        return ResponseEntity.ok(toResponse(updated));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<VehiculoResponse> cambiarEstado(
            @PathVariable String id,
            @Valid @RequestBody VehiculoEstadoRequest req
    ) {
        return ResponseEntity.ok(toResponse(useCase.cambiarEstado(id, req.estado())));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<List<VehiculoResponse>> listar() {
        var items = useCase.listar().stream().map(this::toResponse).toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<VehiculoResponse> obtener(@PathVariable String id) {
        return ResponseEntity.ok(toResponse(useCase.obtener(id)));
    }
}
