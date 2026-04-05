package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Usuario;

import java.util.List;

public interface UsuarioUseCase {
    Usuario crear(Long rolId, String cedula, String nombre, String apellido);
    Usuario editar(Long id, Long rolId, String cedula, String nombre, String apellido, String estado);
    List<Usuario> listar();
    Usuario obtener(Long id);
}
