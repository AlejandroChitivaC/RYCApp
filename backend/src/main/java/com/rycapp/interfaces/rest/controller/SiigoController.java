package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.SiigoConnectionUseCase;
import com.rycapp.application.ports.in.SiigoFacturaSyncUseCase;
import com.rycapp.interfaces.rest.dto.siigo.SiigoConsultaResponse;
import com.rycapp.interfaces.rest.dto.siigo.SiigoFacturaResponse;
import com.rycapp.interfaces.rest.dto.siigo.SiigoHealthResponse;
import com.rycapp.interfaces.rest.dto.siigo.SiigoSyncResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/siigo")
public class SiigoController {

    private final SiigoConnectionUseCase useCase;
    private final SiigoFacturaSyncUseCase syncUseCase;

    public SiigoController(SiigoConnectionUseCase useCase, SiigoFacturaSyncUseCase syncUseCase) {
        this.useCase = useCase;
        this.syncUseCase = syncUseCase;
    }

    /**
     * Prueba de conectividad: autentica contra Siigo y confirma que se obtiene un token.
     * No expone access_token ni credenciales.
     */
    @GetMapping("/health")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
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
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
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

    @PostMapping("/sincronizar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<SiigoSyncResponse> sincronizar() {
        var result = syncUseCase.sincronizar();
        return ResponseEntity.ok(new SiigoSyncResponse(
                result.ok(),
                result.configured(),
                result.message(),
                result.leidas(),
                result.guardadas(),
                result.vinculadas(),
                result.omitidasBorrador()
        ));
    }

    @GetMapping("/facturas")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<List<SiigoFacturaResponse>> facturas() {
        var items = syncUseCase.listarFacturas().stream()
                .map(f -> new SiigoFacturaResponse(
                        f.id(),
                        f.operacionId(),
                        f.siigoInvoiceId(),
                        f.numero(),
                        f.prefijo(),
                        f.fecha(),
                        f.fechaVencimiento(),
                        f.identificacionCliente(),
                        f.nombreCliente(),
                        f.total(),
                        f.saldo(),
                        f.estadoPago(),
                        f.observaciones(),
                        f.fechaSincronizacion()
                ))
                .toList();
        return ResponseEntity.ok(items);
    }
}
