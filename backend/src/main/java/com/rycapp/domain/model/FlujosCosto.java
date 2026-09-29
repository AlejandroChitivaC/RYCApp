package com.rycapp.domain.model;

public final class FlujosCosto {
    public static final String NOMINA = "NOMINA";
    public static final String ADMINISTRATIVO = "ADMINISTRATIVO";
    public static final String VEHICULO = "VEHICULO";
    public static final String FINANCIERO = "FINANCIERO";

    private FlujosCosto() {}

    public static String normalizar(String flujo) {
        return flujo == null ? "" : flujo.trim().toUpperCase();
    }

    public static void exigirNomina(TipoCosto tipo) {
        if (!NOMINA.equals(normalizar(tipo.flujo()))) {
            throw new IllegalArgumentException("El tipo de costo debe ser de flujo nómina para debitar a un usuario.");
        }
    }

    public static void exigirVehiculo(TipoCosto tipo) {
        if (!VEHICULO.equals(normalizar(tipo.flujo()))) {
            throw new IllegalArgumentException("El tipo de costo debe ser de flujo vehículo para asignar un vehículo.");
        }
    }

    /** Administrativo y financiero no pueden usar un tipo que exige usuario o vehículo. */
    public static void rechazarSiExigeAsignacion(TipoCosto tipo) {
        String flujo = normalizar(tipo.flujo());
        if (NOMINA.equals(flujo)) {
            throw new IllegalArgumentException("Un tipo de costo de nómina exige el usuario al que se le debita.");
        }
        if (VEHICULO.equals(flujo)) {
            throw new IllegalArgumentException("Un tipo de costo de vehículo exige un vehículo asignado.");
        }
    }
}
