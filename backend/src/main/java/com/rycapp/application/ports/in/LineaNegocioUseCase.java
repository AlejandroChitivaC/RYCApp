package com.rycapp.application.ports.in;

import com.rycapp.domain.model.LineaNegocio;

import java.util.List;

public interface LineaNegocioUseCase {
    LineaNegocio crear(String lineaNegocio, String descripcion);
    LineaNegocio editar(Long id, String lineaNegocio, String descripcion);
    List<LineaNegocio> listar();
    LineaNegocio cambiarEstado(Long id, String estado);
    LineaNegocio obtener(Long id);
}
