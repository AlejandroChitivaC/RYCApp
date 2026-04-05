package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Material;

import java.util.List;

public interface MaterialUseCase {
    Material crear(String material, String descripcion);
    Material editar(Long id, String material, String descripcion);
    List<Material> listar();
    Material obtener(Long id);
}
