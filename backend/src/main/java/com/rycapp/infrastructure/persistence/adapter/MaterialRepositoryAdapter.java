package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.MaterialRepository;
import com.rycapp.application.util.Ids;
import com.rycapp.domain.model.Material;
import com.rycapp.infrastructure.persistence.dynamo.DynamoSupport;
import com.rycapp.infrastructure.persistence.dynamo.item.MaterialItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.util.List;
import java.util.Optional;

@Repository
public class MaterialRepositoryAdapter implements MaterialRepository {
    private final DynamoDbTable<MaterialItem> table;

    public MaterialRepositoryAdapter(DynamoDbTable<MaterialItem> materialesTable) {
        this.table = materialesTable;
    }

    @Override
    public Material save(Material material) {
        MaterialItem item = MaterialItem.from(new Material(
                Ids.oNuevo(material.id()), material.material(), material.descripcion()
        ));
        table.putItem(item);
        return item.toDomain();
    }

    @Override
    public Optional<Material> findById(String id) {
        return DynamoSupport.findOne(table, id).map(MaterialItem::toDomain);
    }

    @Override
    public List<Material> findAll() {
        return DynamoSupport.scanAll(table).stream().map(MaterialItem::toDomain).toList();
    }

    @Override
    public boolean existsByMaterialIgnoreCase(String nombre) {
        return DynamoSupport.exists(table.index("nombre-index"), DynamoSupport.lower(nombre));
    }
}
