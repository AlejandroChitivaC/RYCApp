package com.rycapp.infrastructure.siigo;

import com.rycapp.application.ports.in.SiigoFacturaSyncUseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.siigo", name = "sync-enabled", havingValue = "true", matchIfMissing = true)
public class SiigoInvoiceSyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(SiigoInvoiceSyncScheduler.class);

    private final SiigoFacturaSyncUseCase syncUseCase;
    private final SiigoProperties properties;

    public SiigoInvoiceSyncScheduler(SiigoFacturaSyncUseCase syncUseCase, SiigoProperties properties) {
        this.syncUseCase = syncUseCase;
        this.properties = properties;
    }

    @Scheduled(fixedDelayString = "${app.siigo.sync-interval-ms:900000}", initialDelayString = "${app.siigo.sync-initial-delay-ms:120000}")
    public void sincronizarPeriodicamente() {
        if (!properties.credentialsConfigured()) {
            return;
        }
        log.info("[Siigo] Sincronización automática iniciada");
        var result = syncUseCase.sincronizar();
        if (!result.ok()) {
            log.warn("[Siigo] Sincronización automática: {}", result.message());
        }
    }
}
