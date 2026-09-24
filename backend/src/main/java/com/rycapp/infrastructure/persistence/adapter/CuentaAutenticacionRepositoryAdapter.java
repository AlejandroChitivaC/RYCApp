package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.CuentaAutenticacionRepository;
import com.rycapp.domain.model.CuentaAutenticacion;
import com.rycapp.infrastructure.persistence.dynamo.DynamoSupport;
import com.rycapp.infrastructure.persistence.dynamo.item.UsuarioItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.util.Optional;

@Repository
public class CuentaAutenticacionRepositoryAdapter implements CuentaAutenticacionRepository {
    private final DynamoDbTable<UsuarioItem> table;

    public CuentaAutenticacionRepositoryAdapter(DynamoDbTable<UsuarioItem> usuariosTable) {
        this.table = usuariosTable;
    }

    @Override
    public CuentaAutenticacion save(CuentaAutenticacion cuenta) {
        UsuarioItem item = DynamoSupport.findOne(table, cuenta.usuarioId())
                .orElseThrow(() -> new IllegalStateException("Usuario no existe para la cuenta " + cuenta.usuarioId()));
        item.applyCuenta(cuenta);
        table.putItem(item);
        return item.toCuenta();
    }

    @Override
    public Optional<CuentaAutenticacion> findByCorreoIgnoreCase(String correo) {
        return DynamoSupport.queryOne(table.index("correo-index"), DynamoSupport.lower(correo))
                .map(UsuarioItem::toCuenta);
    }

    @Override
    public Optional<CuentaAutenticacion> findByUsuarioId(String usuarioId) {
        return DynamoSupport.findOne(table, usuarioId)
                .map(UsuarioItem::toCuenta)
                .filter(c -> c != null);
    }

    @Override
    public boolean existsByCorreoIgnoreCase(String correo) {
        return DynamoSupport.exists(table.index("correo-index"), DynamoSupport.lower(correo));
    }
}
