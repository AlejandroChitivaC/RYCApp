package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.RolRepository;
import com.rycapp.application.util.Ids;
import com.rycapp.domain.model.Rol;
import com.rycapp.infrastructure.persistence.dynamo.DynamoSupport;
import com.rycapp.infrastructure.persistence.dynamo.item.RolItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.util.List;
import java.util.Optional;

@Repository
public class RolRepositoryAdapter implements RolRepository {
    private final DynamoDbTable<RolItem> table;

    public RolRepositoryAdapter(DynamoDbTable<RolItem> rolesTable) {
        this.table = rolesTable;
    }

    @Override
    public Rol save(Rol rol) {
        RolItem item = RolItem.from(new Rol(Ids.oNuevo(rol.id()), rol.descripcion()));
        table.putItem(item);
        return item.toDomain();
    }

    @Override
    public Optional<Rol> findById(String id) {
        return DynamoSupport.findOne(table, id).map(RolItem::toDomain);
    }

    @Override
    public List<Rol> findAll() {
        return DynamoSupport.scanAll(table).stream().map(RolItem::toDomain).toList();
    }

    @Override
    public Optional<Rol> findByDescripcion(String descripcion) {
        return DynamoSupport.queryOne(table.index("descripcion-index"), DynamoSupport.lower(descripcion))
                .map(RolItem::toDomain);
    }
}
