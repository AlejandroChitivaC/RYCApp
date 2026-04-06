package com.rycapp.domain.model;

import java.util.List;

/**
 * Valores permitidos para {@code Usuario.estado} en edición y reglas de negocio.
 */
public final class UsuarioEstados {
    public static final String ACTIVO = "ACTIVO";
    public static final String INACTIVO = "INACTIVO";
    public static final String PENDIENTE_APROBACION = "PENDIENTE_APROBACION";

    private UsuarioEstados() {}

    public static List<String> valoresParaEdicion() {
        return List.of(ACTIVO, INACTIVO, PENDIENTE_APROBACION);
    }

    public static boolean esPermitidoEnEdicion(String estado) {
        return estado != null && valoresParaEdicion().contains(estado);
    }
}
