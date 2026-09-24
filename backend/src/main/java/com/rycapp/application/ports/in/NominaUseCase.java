package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Nomina;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface NominaUseCase {
    Nomina crear(
            String usuarioRegistroId,
            String tipoCostoId,
            String usuarioDebitadoId,
            Instant fechaInicio,
            Instant fechaFin,
            String medioPago,
            BigDecimal valor,
            String descripcion
    );

    List<Nomina> listar();

    Nomina obtener(String id);
}
