package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository {
    Usuario save(Usuario usuario);
    Optional<Usuario> findById(Long id);
    List<Usuario> findAll();
    boolean existsByCedulaIgnoreCase(String cedula);
}
