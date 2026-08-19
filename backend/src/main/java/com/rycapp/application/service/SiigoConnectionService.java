package com.rycapp.application.service;

import com.rycapp.application.ports.in.SiigoConnectionUseCase;
import com.rycapp.application.ports.out.SiigoAuthPort;
import com.rycapp.application.ports.out.SiigoAuthPort.SiigoAuthException;
import com.rycapp.application.ports.out.SiigoQueryPort;
import com.rycapp.application.ports.out.SiigoQueryPort.SiigoQueryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SiigoConnectionService implements SiigoConnectionUseCase {

    private static final Logger log = LoggerFactory.getLogger(SiigoConnectionService.class);

    private final SiigoAuthPort siigoAuthPort;
    private final SiigoQueryPort siigoQueryPort;

    public SiigoConnectionService(SiigoAuthPort siigoAuthPort, SiigoQueryPort siigoQueryPort) {
        this.siigoAuthPort = siigoAuthPort;
        this.siigoQueryPort = siigoQueryPort;
    }

    @Override
    public HealthResult verificarConexion() {
        if (!siigoAuthPort.credentialsConfigured()) {
            return new HealthResult(
                    false,
                    false,
                    "Credenciales Siigo no configuradas (SIIGO_USERNAME / SIIGO_ACCESS_KEY).",
                    null,
                    null
            );
        }

        try {
            var token = siigoAuthPort.obtenerToken();
            log.info("[Siigo] Health OK | tokenType={} expiresIn={}s", token.tokenType(), token.expiresInSeconds());
            return new HealthResult(
                    true,
                    true,
                    "Conexión con Siigo API exitosa.",
                    token.tokenType(),
                    token.expiresInSeconds()
            );
        } catch (SiigoAuthException | IllegalStateException ex) {
            log.warn("[Siigo] Health falló | {}", ex.getMessage());
            return new HealthResult(false, true, ex.getMessage(), null, null);
        }
    }

    @Override
    public ConsultaResult consultarCuenta() {
        var meta = siigoAuthPort.connectionMeta();

        if (!siigoAuthPort.credentialsConfigured()) {
            return emptyFail(
                    false,
                    "Credenciales Siigo no configuradas (SIIGO_USERNAME / SIIGO_ACCESS_KEY).",
                    meta
            );
        }

        try {
            var token = siigoAuthPort.obtenerToken();
            var documentTypes = siigoQueryPort.listarTiposFacturaVenta(token.accessToken());
            var users = siigoQueryPort.resumenUsuarios(token.accessToken());

            var docItems = documentTypes.stream()
                    .map(d -> new DocumentTypeItem(d.id(), d.code(), d.name(), d.prefix(), d.active()))
                    .toList();
            var userItems = users.sample().stream()
                    .map(u -> new UserItem(u.id(), u.username(), u.email(), u.active()))
                    .toList();

            log.info(
                    "[Siigo] Consulta OK | tiposFV={} usersTotal={} partnerId={}",
                    docItems.size(),
                    users.totalResults(),
                    meta.partnerId()
            );

            return new ConsultaResult(
                    true,
                    true,
                    "Consulta a Siigo exitosa. Revisa tipos de factura y usuarios para confirmar que es la cuenta correcta.",
                    meta.baseUrl(),
                    meta.partnerId(),
                    meta.username(),
                    docItems.size(),
                    docItems,
                    users.totalResults(),
                    userItems
            );
        } catch (SiigoAuthException | SiigoQueryException | IllegalStateException ex) {
            log.warn("[Siigo] Consulta falló | {}", ex.getMessage());
            return emptyFail(true, ex.getMessage(), meta);
        }
    }

    private ConsultaResult emptyFail(boolean configured, String message, SiigoAuthPort.ConnectionMeta meta) {
        return new ConsultaResult(
                false,
                configured,
                message,
                meta.baseUrl(),
                meta.partnerId(),
                meta.username(),
                0,
                List.of(),
                0,
                List.of()
        );
    }
}
