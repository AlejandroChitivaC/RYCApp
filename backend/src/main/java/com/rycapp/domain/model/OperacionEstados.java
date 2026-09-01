package com.rycapp.domain.model;

public final class OperacionEstados {
    public static final String REGISTRADA = "REGISTRADA";
    public static final String CONFIRMADA = "CONFIRMADA";

    private OperacionEstados() {}

    public static boolean esConfirmada(String estado) {
        return CONFIRMADA.equalsIgnoreCase(estado);
    }
}
