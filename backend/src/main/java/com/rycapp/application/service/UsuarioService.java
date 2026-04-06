package com.rycapp.application.service;

import com.rycapp.application.exception.ConflictException;
import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.UsuarioUseCase;
import com.rycapp.application.ports.out.RolRepository;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.domain.model.Rol;
import com.rycapp.domain.model.Usuario;
import com.rycapp.domain.model.UsuarioEstados;
import com.rycapp.domain.model.UsuarioPendienteActivacion;
import com.rycapp.infrastructure.mail.MailAccountNotifications;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class UsuarioService implements UsuarioUseCase {
    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);
    private static final String ESTADO_PENDIENTE_APROBACION = "PENDIENTE_APROBACION";
    private static final String ESTADO_ACTIVO = "ACTIVO";
    private static final String ROL_CONDUCTOR = "Conductor";
    private static final String ROL_CONTADOR = "Contador";
    private static final String ROL_USUARIO_REGISTRADO = "Usuario registrado";

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final MailAccountNotifications mailAccountNotifications;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            MailAccountNotifications mailAccountNotifications
    ) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.mailAccountNotifications = mailAccountNotifications;
    }

    @Override
    public Usuario crear(Long rolId, String cedula, String nombre, String apellido) {
        rolRepository.findById(rolId)
                .orElseThrow(() -> new NotFoundException("Rol no encontrado (id=" + rolId + ")."));
        if (usuarioRepository.existsByCedulaIgnoreCase(cedula)) {
            throw new ConflictException("Ya existe un usuario con la cédula '" + cedula + "'.");
        }
        var created = usuarioRepository.save(new Usuario(null, rolId, cedula, nombre, apellido, ESTADO_ACTIVO));
        log.info("Usuario creado id={} cedula={}", created.id(), created.cedula());
        return created;
    }

    @Override
    public Usuario editar(Long id, Long rolId, String cedula, String nombre, String apellido, String estado) {
        if (!UsuarioEstados.esPermitidoEnEdicion(estado)) {
            throw new ConflictException(
                    "Estado de usuario no permitido. Use uno de: " + String.join(", ", UsuarioEstados.valoresParaEdicion())
            );
        }
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

    @Override
    public List<UsuarioPendienteActivacion> listarPendientesActivacion() {
        return usuarioRepository.listarPendientesActivacionCorreoVerificado();
    }

    @Override
    @Transactional
    public void activarCuentaRegistrada(Long usuarioId, Long rolAsignarId) {
        var u = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado (id=" + usuarioId + ")."));
        if (!ESTADO_PENDIENTE_APROBACION.equalsIgnoreCase(u.estado())) {
            throw new ConflictException("Este usuario no está pendiente de activación.");
        }
        var rolActual = rolRepository.findById(u.rolId())
                .orElseThrow(() -> new ConflictException("Rol del usuario no encontrado."));
        if (!ROL_USUARIO_REGISTRADO.equalsIgnoreCase(rolActual.descripcion())) {
            throw new ConflictException("Solo se pueden activar cuentas con rol temporal «Usuario registrado».");
        }
        var rolNuevo = rolRepository.findById(rolAsignarId)
                .orElseThrow(() -> new NotFoundException("Rol no encontrado (id=" + rolAsignarId + ")."));
        String desc = rolNuevo.descripcion();
        if (!ROL_CONDUCTOR.equalsIgnoreCase(desc) && !ROL_CONTADOR.equalsIgnoreCase(desc)) {
            throw new ConflictException("Al activar solo se puede asignar el rol Conductor o Contador.");
        }
        usuarioRepository.save(new Usuario(
                u.id(),
                rolAsignarId,
                u.cedula(),
                u.nombre(),
                u.apellido(),
                ESTADO_ACTIVO
        ));
        usuarioRepository.findCorreoCuentaByUsuarioId(usuarioId).ifPresent(correo ->
                mailAccountNotifications.notificarUsuarioCuentaActivada(correo, u.nombre())
        );
        log.info("Cuenta de usuario id={} activada con rol id={} ({})", usuarioId, rolAsignarId, desc);
    }

    @Override
    public List<Usuario> listarConductores() {
        return usuarioRepository.findByRolDescripcion(ROL_CONDUCTOR);
    }

    @Override
    public List<String> catalogoEstadosUsuarioEdicion() {
        return UsuarioEstados.valoresParaEdicion();
    }

    @Override
    public List<Rol> rolesAsignablesAlActivarRegistro() {
        var out = new ArrayList<Rol>();
        rolRepository.findByDescripcion(ROL_CONDUCTOR).ifPresent(out::add);
        rolRepository.findByDescripcion(ROL_CONTADOR).ifPresent(out::add);
        return out;
    }
}
