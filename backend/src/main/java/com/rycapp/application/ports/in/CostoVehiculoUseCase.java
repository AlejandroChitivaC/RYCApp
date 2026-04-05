package com.rycapp.application.ports.in;

import com.rycapp.domain.model.CostoVehiculo;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface CostoVehiculoUseCase {
    CostoVehiculo crear(
            Long usuarioRegistroId,
            Long tipoCostoId,
            Long vehiculoId,
            Instant fechaInicio,
            Instant fechaFin,
            String medioPago,
            BigDecimal valor,
            String motivo,
            String descripcion
    );

    List<CostoVehiculo> listar();

    CostoVehiculo obtener(Long id);
}
