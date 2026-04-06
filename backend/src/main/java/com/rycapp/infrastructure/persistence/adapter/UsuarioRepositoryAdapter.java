package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.domain.model.Usuario;
import com.rycapp.domain.model.UsuarioPendienteActivacion;
import com.rycapp.infrastructure.persistence.jpa.mapper.UsuarioMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.CuentaAutenticacionJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.RolJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.UsuarioJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UsuarioRepositoryAdapter implements UsuarioRepository {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final RolJpaRepository rolJpaRepository;
    private final CuentaAutenticacionJpaRepository cuentaAutenticacionJpaRepository;

    public UsuarioRepositoryAdapter(
            UsuarioJpaRepository usuarioJpaRepository,
            RolJpaRepository rolJpaRepository,
            CuentaAutenticacionJpaRepository cuentaAutenticacionJpaRepository
    ) {
        this.usuarioJpaRepository = usuarioJpaRepository;
        this.rolJpaRepository = rolJpaRepository;
        this.cuentaAutenticacionJpaRepository = cuentaAutenticacionJpaRepository;
    }

    @Override
    public Usuario save(Usuario usuario) {
        var rol = rolJpaRepository.getReferenceById(usuario.rolId());
        var saved = usuarioJpaRepository.save(UsuarioMapper.toEntity(usuario, rol));
        return usuarioJpaRepository.findOneFetched(saved.getId()).map(UsuarioMapper::toDomain).orElseThrow();
    }

    @Override
    public Optional<Usuario> findById(Long id) {
        return usuarioJpaRepository.findOneFetched(id).map(UsuarioMapper::toDomain);
    }

    @Override
    public List<Usuario> findAll() {
        return usuarioJpaRepository.findAllFetched().stream().map(UsuarioMapper::toDomain).toList();
    }

    @Override
    public boolean existsByCedulaIgnoreCase(String cedula) {
        return usuarioJpaRepository.existsByCedulaIgnoreCase(cedula);
    }

    @Override
    public boolean tieneRolDescripcion(Long usuarioId, String rolDescripcion) {
        return usuarioJpaRepository.findOneFetched(usuarioId)
                .map(u -> rolDescripcion.equalsIgnoreCase(u.getRol().getDescripcion()))
                .orElse(false);
    }

    @Override
    public List<Usuario> findByRolDescripcion(String rolDescripcion) {
        return usuarioJpaRepository.findAllByRolDescripcion(rolDescripcion).stream()
                .map(UsuarioMapper::toDomain)
                .toList();
    }

    @Override
    public List<UsuarioPendienteActivacion> listarPendientesActivacionCorreoVerificado() {
        return cuentaAutenticacionJpaRepository.findCuentasPendientesActivacion().stream()
                .map(c -> {
                    var u = c.getUsuario();
                    return new UsuarioPendienteActivacion(
                            u.getId(),
                            u.getCedula(),
                            u.getNombre(),
                            u.getApellido(),
                            c.getCorreo()
                    );
                })
                .toList();
    }

    @Override
    public Optional<String> findCorreoCuentaByUsuarioId(Long usuarioId) {
        return cuentaAutenticacionJpaRepository.findByUsuario_Id(usuarioId)
                .map(c -> c.getCorreo());
    }
}
