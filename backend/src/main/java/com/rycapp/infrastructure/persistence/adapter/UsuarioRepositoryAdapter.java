package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.application.util.Ids;
import com.rycapp.domain.model.Usuario;
import com.rycapp.domain.model.UsuarioPendienteActivacion;
import com.rycapp.infrastructure.persistence.dynamo.DynamoSupport;
import com.rycapp.infrastructure.persistence.dynamo.item.RolItem;
import com.rycapp.infrastructure.persistence.dynamo.item.UsuarioItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.util.List;
import java.util.Optional;

@Repository
public class UsuarioRepositoryAdapter implements UsuarioRepository {
    private final DynamoDbTable<UsuarioItem> table;
    private final DynamoDbTable<RolItem> roles;

    public UsuarioRepositoryAdapter(
            DynamoDbTable<UsuarioItem> usuariosTable,
            DynamoDbTable<RolItem> rolesTable
    ) {
        this.table = usuariosTable;
        this.roles = rolesTable;
    }

    @Override
    public Usuario save(Usuario usuario) {
        UsuarioItem item = usuario.id() == null
                ? new UsuarioItem()
                : DynamoSupport.findOne(table, usuario.id()).orElseGet(UsuarioItem::new);
        if (item.getId() == null) {
            item.setId(Ids.oNuevo(usuario.id()));
        }
        item.applyUsuario(usuario);
        DynamoSupport.findOne(roles, usuario.rolId()).ifPresent(r -> item.setRolDescripcion(r.getDescripcion()));
        table.putItem(item);
        return item.toUsuario();
    }

    @Override
    public Optional<Usuario> findById(String id) {
        return DynamoSupport.findOne(table, id).map(UsuarioItem::toUsuario);
    }

    @Override
    public List<Usuario> findAll() {
        return DynamoSupport.scanAll(table).stream().map(UsuarioItem::toUsuario).toList();
    }

    @Override
    public boolean existsByCedulaIgnoreCase(String cedula) {
        return DynamoSupport.exists(table.index("cedula-index"), DynamoSupport.lower(cedula));
    }

    @Override
    public boolean tieneRolDescripcion(String usuarioId, String rolDescripcion) {
        return DynamoSupport.findOne(table, usuarioId)
                .map(u -> rolDescripcion != null && rolDescripcion.equalsIgnoreCase(u.getRolDescripcion()))
                .orElse(false);
    }

    @Override
    public List<Usuario> findByRolDescripcion(String rolDescripcion) {
        String wanted = DynamoSupport.lower(rolDescripcion);
        return DynamoSupport.scanAll(table).stream()
                .filter(u -> u.getRolDescripcion() != null && wanted.equals(u.getRolDescripcion().toLowerCase()))
                .map(UsuarioItem::toUsuario)
                .toList();
    }

    @Override
    public List<UsuarioPendienteActivacion> listarPendientesActivacionCorreoVerificado() {
        return DynamoSupport.queryAll(table.index("estado-index"), "PENDIENTE_APROBACION").stream()
                .filter(u -> Boolean.TRUE.equals(u.getCorreoVerificado()))
                .map(u -> new UsuarioPendienteActivacion(u.getId(), u.getCedula(), u.getNombre(), u.getApellido(), u.getCorreo()))
                .toList();
    }

    @Override
    public Optional<String> findCorreoCuentaByUsuarioId(String usuarioId) {
        return DynamoSupport.findOne(table, usuarioId)
                .map(UsuarioItem::getCorreo)
                .filter(c -> c != null && !c.isBlank());
    }

    @Override
    public List<String> findCorreosAdministradores() {
        return DynamoSupport.scanAll(table).stream()
                .filter(u -> u.getRolDescripcion() != null && "Administrador".equalsIgnoreCase(u.getRolDescripcion()))
                .map(UsuarioItem::getCorreo)
                .filter(c -> c != null && !c.isBlank())
                .toList();
    }
}
