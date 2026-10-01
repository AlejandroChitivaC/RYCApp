package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.RolUseCase;
import com.rycapp.interfaces.rest.dto.rol.RolResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RolController {
    private final RolUseCase useCase;

    public RolController(RolUseCase useCase) {
        this.useCase = useCase;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<List<RolResponse>> listar() {
        var items = useCase.listar().stream().map(r -> new RolResponse(r.id(), r.descripcion())).toList();
        return ResponseEntity.ok(items);
    }
}
