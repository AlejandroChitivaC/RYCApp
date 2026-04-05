package com.rycapp.application.ports.in;

import com.rycapp.domain.model.TipoCosto;

import java.util.List;

public interface TipoCostoUseCase {
    TipoCosto crear(String tipoCosto, String flujo, String descripcion);
    TipoCosto editar(Long id, String tipoCosto, String flujo, String descripcion, String estado);
    List<TipoCosto> listar();
    TipoCosto obtener(Long id);
}
