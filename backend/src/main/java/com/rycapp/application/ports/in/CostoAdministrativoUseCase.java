package com.rycapp.application.ports.in;

import com.rycapp.domain.model.CostoAdministrativo;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface CostoAdministrativoUseCase {
    CostoAdministrativo crear(
            String usuarioRegistroId,
            String tipoCostoId,
            Instant fechaInicio,
            Instant fechaFin,
            String medioPago,
            BigDecimal valor,
            String descripcion
    );

    List<CostoAdministrativo> listar();

    CostoAdministrativo obtener(String id);
}
