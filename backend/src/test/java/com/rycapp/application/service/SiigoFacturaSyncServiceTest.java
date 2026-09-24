package com.rycapp.application.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SiigoFacturaSyncServiceTest {

    @Test
    void extraeUuidDeObservaciones() {
        var id = SiigoFacturaSyncService.extraerOperacionId(
                "Factura de la operación #550e8400-e29b-41d4-a716-446655440000",
                null
        );
        assertTrue(id.isPresent());
        assertEquals("550e8400-e29b-41d4-a716-446655440000", id.get());
    }

    @Test
    void extraePrefijoOp() {
        var id = SiigoFacturaSyncService.extraerOperacionId(
                null,
                "OP-550e8400-e29b-41d4-a716-446655440000"
        );
        assertEquals("550e8400-e29b-41d4-a716-446655440000", id.orElseThrow());
    }
}
