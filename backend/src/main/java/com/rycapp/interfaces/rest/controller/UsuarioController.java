package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.UsuarioUseCase;
import com.rycapp.interfaces.rest.dto.usuario.UsuarioCreateRequest;
import com.rycapp.interfaces.rest.dto.usuario.UsuarioPendienteResponse;
import com.rycapp.interfaces.rest.dto.usuario.UsuarioResponse;
import com.rycapp.interfaces.rest.dto.usuario.UsuarioUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioUseCase useCase;

    public UsuarioController(UsuarioUseCase useCase) {
        this.useCase = useCase;
    }

    private static UsuarioResponse toResponse(com.rycapp.domain.model.Usuario u) {
        return new UsuarioResponse(u.id(), u.rolId(), u.cedula(), u.nombre(), u.apellido(), u.estado());
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody UsuarioCreateRequest req) {
        var created = useCase.crear(req.rolId(), req.cedula(), req.nombre(), req.apellido());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> editar(@PathVariable Long id, @Valid @RequestBody UsuarioUpdateRequest req) {
        var updated = useCase.editar(id, req.rolId(), req.cedula(), req.nombre(), req.apellido(), req.estado());
        return ResponseEntity.ok(toResponse(updated));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar() {
        return ResponseEntity.ok(useCase.listar().stream().map(UsuarioController::toResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(useCase.obtener(id)));
    }

    @GetMapping("/conductores")
    public ResponseEntity<List<UsuarioResponse>> conductores() {
        return ResponseEntity.ok(useCase.listarConductores().stream().map(UsuarioController::toResponse).toList());
    }

    @GetMapping("/pendientes-activacion")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<UsuarioPendienteResponse>> pendientesActivacion() {
        var items = useCase.listarPendientesActivacion().stream()
                .map(p -> new UsuarioPendienteResponse(p.id(), p.cedula(), p.nombre(), p.apellido(), p.correo()))
                .toList();
        return ResponseEntity.ok(items);
    }

    @PostMapping("/{id}/activar")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UsuarioResponse> activarCuenta(@PathVariable Long id) {
        useCase.activarCuentaRegistrada(id);
        return ResponseEntity.ok(toResponse(useCase.obtener(id)));
    }
}
