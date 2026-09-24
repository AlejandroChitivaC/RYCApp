package com.rycapp.application.ports.in;

import com.rycapp.domain.model.LineaNegocio;

import java.util.List;

public interface LineaNegocioUseCase {
    LineaNegocio crear(String lineaNegocio, String descripcion);
    LineaNegocio editar(String id, String lineaNegocio, String descripcion);
    List<LineaNegocio> listar();
    LineaNegocio cambiarEstado(String id, String estado);
    LineaNegocio obtener(String id);
}
