package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.LineaNegocioRepository;
import com.rycapp.application.util.Ids;
import com.rycapp.domain.model.LineaNegocio;
import com.rycapp.infrastructure.persistence.dynamo.DynamoSupport;
import com.rycapp.infrastructure.persistence.dynamo.item.LineaNegocioItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.util.List;
import java.util.Optional;

@Repository
public class LineaNegocioRepositoryAdapter implements LineaNegocioRepository {
    private final DynamoDbTable<LineaNegocioItem> table;

    public LineaNegocioRepositoryAdapter(DynamoDbTable<LineaNegocioItem> lineasNegocioTable) {
        this.table = lineasNegocioTable;
    }

    @Override
    public LineaNegocio save(LineaNegocio linea) {
        LineaNegocioItem item = LineaNegocioItem.from(new LineaNegocio(
                Ids.oNuevo(linea.id()), linea.lineaNegocio(), linea.descripcion(), linea.estado()
        ));
        table.putItem(item);
        return item.toDomain();
    }

    @Override
    public Optional<LineaNegocio> findById(String id) {
        return DynamoSupport.findOne(table, id).map(LineaNegocioItem::toDomain);
    }

    @Override
    public List<LineaNegocio> findAll() {
        return DynamoSupport.scanAll(table).stream().map(LineaNegocioItem::toDomain).toList();
    }

    @Override
    public boolean existsByLineaNegocioIgnoreCase(String nombre) {
        return DynamoSupport.exists(table.index("nombre-index"), DynamoSupport.lower(nombre));
    }
}
