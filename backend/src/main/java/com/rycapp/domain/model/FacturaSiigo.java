package com.rycapp.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record FacturaSiigo(
        Long id,
        Long operacionId,
        String siigoInvoiceId,
        String numero,
        String prefijo,
        LocalDate fecha,
        LocalDate fechaVencimiento,
        String identificacionCliente,
        String nombreCliente,
        BigDecimal total,
        BigDecimal saldo,
        String estadoPago,
        String observaciones,
        Instant fechaSincronizacion
) {}
