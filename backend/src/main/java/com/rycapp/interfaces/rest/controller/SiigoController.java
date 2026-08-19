package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.SiigoConnectionUseCase;
import com.rycapp.interfaces.rest.dto.siigo.SiigoConsultaResponse;
import com.rycapp.interfaces.rest.dto.siigo.SiigoHealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/siigo")
public class SiigoController {

    private final SiigoConnectionUseCase useCase;

    public SiigoController(SiigoConnectionUseCase useCase) {
        this.useCase = useCase;
    }

    /**
     * Prueba de conectividad: autentica contra Siigo y confirma que se obtiene un token.
     * No expone access_token ni credenciales.
     */
    @GetMapping("/health")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<SiigoHealthResponse> health() {
        var result = useCase.verificarConexion();
        return ResponseEntity.ok(new SiigoHealthResponse(
                result.connected(),
                result.configured(),
                result.message(),
                result.tokenType(),
                result.expiresInSeconds()
        ));
    }

    /**
     * Consulta de solo lectura a catálogos Siigo (tipos FV + usuarios)
     * para confirmar que el token opera sobre la cuenta esperada.
     */
    @GetMapping("/consulta")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<SiigoConsultaResponse> consulta() {
        var result = useCase.consultarCuenta();
        var documentTypes = result.documentTypes().stream()
                .map(d -> new SiigoConsultaResponse.DocumentTypeItem(
                        d.id(), d.code(), d.name(), d.prefix(), d.active()))
                .toList();
        var users = result.usersSample().stream()
                .map(u -> new SiigoConsultaResponse.UserItem(
                        u.id(), u.username(), u.email(), u.active()))
                .toList();
        return ResponseEntity.ok(new SiigoConsultaResponse(
                result.ok(),
                result.configured(),
                result.message(),
                result.baseUrl(),
                result.partnerId(),
                result.username(),
                result.documentTypesCount(),
                documentTypes,
                result.usersTotal(),
                users
        ));
    }
}
