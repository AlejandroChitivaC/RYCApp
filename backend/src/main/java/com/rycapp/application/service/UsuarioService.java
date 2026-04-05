package com.rycapp.application.service;

import com.rycapp.application.exception.ConflictException;
import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.UsuarioUseCase;
import com.rycapp.application.ports.out.RolRepository;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.domain.model.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService implements UsuarioUseCase {
    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
    }

    @Override
    public Usuario crear(Long rolId, String cedula, String nombre, String apellido) {
        rolRepository.findById(rolId)
                .orElseThrow(() -> new NotFoundException("Rol no encontrado (id=" + rolId + ")."));
        if (usuarioRepository.existsByCedulaIgnoreCase(cedula)) {
            throw new ConflictException("Ya existe un usuario con la cédula '" + cedula + "'.");
        }
        var created = usuarioRepository.save(new Usuario(null, rolId, cedula, nombre, apellido, "ACTIVO"));
        log.info("Usuario creado id={} cedula={}", created.id(), created.cedula());
        return created;
    }

    @Override
    public Usuario editar(Long id, Long rolId, String cedula, String nombre, String apellido, String estado) {
        var current = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado (id=" + id + ")."));
        rolRepository.findById(rolId)
                .orElseThrow(() -> new NotFoundException("Rol no encontrado (id=" + rolId + ")."));
        var cedulaChanged = !current.cedula().equalsIgnoreCase(cedula);
        if (cedulaChanged && usuarioRepository.existsByCedulaIgnoreCase(cedula)) {
            throw new ConflictException("Ya existe un usuario con la cédula '" + cedula + "'.");
        }
        var updated = usuarioRepository.save(new Usuario(id, rolId, cedula, nombre, apellido, estado));
        log.info("Usuario actualizado id={}", updated.id());
        return updated;
    }

    @Override
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    @Override
    public Usuario obtener(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado (id=" + id + ")."));
    }
}
