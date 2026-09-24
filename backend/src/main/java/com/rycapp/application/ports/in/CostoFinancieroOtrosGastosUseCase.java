package com.rycapp.application.ports.in;

import com.rycapp.domain.model.CostoFinancieroOtrosGastos;

import java.math.BigDecimal;
import java.util.List;

public interface CostoFinancieroOtrosGastosUseCase {
    CostoFinancieroOtrosGastos crear(String usuarioRegistroId, String tipoCostoId, String medioPago, BigDecimal valor, String descripcion);
    List<CostoFinancieroOtrosGastos> listar();
    CostoFinancieroOtrosGastos obtener(String id);
}
