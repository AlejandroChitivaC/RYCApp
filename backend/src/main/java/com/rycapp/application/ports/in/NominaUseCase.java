package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Nomina;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface NominaUseCase {
    Nomina crear(
            Long usuarioRegistroId,
            Long tipoCostoId,
            Long usuarioDebitadoId,
            Instant fechaInicio,
            Instant fechaFin,
            String medioPago,
            BigDecimal valor,
            String descripcion
    );

    List<Nomina> listar();

    Nomina obtener(Long id);
}
