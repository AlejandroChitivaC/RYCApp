package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Usuario;
import com.rycapp.domain.model.UsuarioPendienteActivacion;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository {
    Usuario save(Usuario usuario);
    Optional<Usuario> findById(String id);
    List<Usuario> findAll();
    boolean existsByCedulaIgnoreCase(String cedula);

    boolean tieneRolDescripcion(String usuarioId, String rolDescripcion);

    List<Usuario> findByRolDescripcion(String rolDescripcion);

    List<UsuarioPendienteActivacion> listarPendientesActivacionCorreoVerificado();

    Optional<String> findCorreoCuentaByUsuarioId(String usuarioId);

    List<String> findCorreosAdministradores();
}
