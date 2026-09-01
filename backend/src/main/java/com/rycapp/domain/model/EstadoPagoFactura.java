package com.rycapp.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class EstadoPagoFactura {
    public static final String PAGADO = "PAGADO";
    public static final String PENDIENTE = "PENDIENTE";
    public static final String VENCIDO = "VENCIDO";

    private static final BigDecimal CERO = new BigDecimal("0.01");

    private EstadoPagoFactura() {}

    public static String calcular(BigDecimal saldo, LocalDate fechaVencimiento, LocalDate hoy) {
        BigDecimal s = saldo != null ? saldo : BigDecimal.ZERO;
        if (s.abs().compareTo(CERO) < 0) {
            return PAGADO;
        }
        if (fechaVencimiento != null && fechaVencimiento.isBefore(hoy)) {
            return VENCIDO;
        }
        return PENDIENTE;
    }
}
