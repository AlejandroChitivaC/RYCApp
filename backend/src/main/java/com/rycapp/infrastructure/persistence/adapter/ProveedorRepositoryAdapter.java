package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.ProveedorRepository;
import com.rycapp.application.util.Ids;
import com.rycapp.domain.model.Proveedor;
import com.rycapp.infrastructure.persistence.dynamo.DynamoSupport;
import com.rycapp.infrastructure.persistence.dynamo.item.ProveedorItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.util.List;
import java.util.Optional;

@Repository
public class ProveedorRepositoryAdapter implements ProveedorRepository {
    private final DynamoDbTable<ProveedorItem> table;

    public ProveedorRepositoryAdapter(DynamoDbTable<ProveedorItem> proveedoresTable) {
        this.table = proveedoresTable;
    }

    @Override
    public Proveedor save(Proveedor proveedor) {
        ProveedorItem item = ProveedorItem.from(new Proveedor(
                Ids.oNuevo(proveedor.id()),
                proveedor.nombre(),
                proveedor.nit(),
                proveedor.departamento(),
                proveedor.municipio(),
                proveedor.descripcion(),
                proveedor.estado()
        ));
        table.putItem(item);
        return item.toDomain();
    }

    @Override
    public Optional<Proveedor> findById(String id) {
        return DynamoSupport.findOne(table, id).map(ProveedorItem::toDomain);
    }

    @Override
    public List<Proveedor> findAll() {
        return DynamoSupport.scanAll(table).stream().map(ProveedorItem::toDomain).toList();
    }

    @Override
    public Optional<Proveedor> findByNitIgnoreCase(String nit) {
        return DynamoSupport.queryOne(table.index("nit-index"), DynamoSupport.lower(nit))
                .map(ProveedorItem::toDomain);
    }

    @Override
    public boolean existsByNitIgnoreCase(String nit) {
        return DynamoSupport.exists(table.index("nit-index"), DynamoSupport.lower(nit));
    }
}
