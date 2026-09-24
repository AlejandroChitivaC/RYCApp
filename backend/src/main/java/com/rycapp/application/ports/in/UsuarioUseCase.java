package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Rol;
import com.rycapp.domain.model.Usuario;
import com.rycapp.domain.model.UsuarioPendienteActivacion;

import java.util.List;

public interface UsuarioUseCase {
    Usuario crear(String rolId, String cedula, String nombre, String apellido);
    Usuario editar(String id, String rolId, String cedula, String nombre, String apellido, String estado);
    List<Usuario> listar();
    Usuario obtener(String id);

    List<UsuarioPendienteActivacion> listarPendientesActivacion();

    void activarCuentaRegistrada(String usuarioId, String rolAsignarId);

    List<Usuario> listarConductores();

    List<String> catalogoEstadosUsuarioEdicion();

    List<Rol> rolesAsignablesAlActivarRegistro();
}
