package com.rycapp.application.ports.in;

import com.rycapp.domain.model.CostoFinancieroOtrosGastos;

import java.math.BigDecimal;
import java.util.List;

public interface CostoFinancieroOtrosGastosUseCase {
    CostoFinancieroOtrosGastos crear(Long usuarioRegistroId, Long tipoCostoId, String medioPago, BigDecimal valor, String descripcion);
    List<CostoFinancieroOtrosGastos> listar();
    CostoFinancieroOtrosGastos obtener(Long id);
}
