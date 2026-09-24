package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.TipoCostoRepository;
import com.rycapp.application.util.Ids;
import com.rycapp.domain.model.TipoCosto;
import com.rycapp.infrastructure.persistence.dynamo.DynamoSupport;
import com.rycapp.infrastructure.persistence.dynamo.item.TipoCostoItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.util.List;
import java.util.Optional;

@Repository
public class TipoCostoRepositoryAdapter implements TipoCostoRepository {
    private final DynamoDbTable<TipoCostoItem> table;

    public TipoCostoRepositoryAdapter(DynamoDbTable<TipoCostoItem> tiposCostoTable) {
        this.table = tiposCostoTable;
    }

    @Override
    public TipoCosto save(TipoCosto tipo) {
        TipoCostoItem item = TipoCostoItem.from(new TipoCosto(
                Ids.oNuevo(tipo.id()), tipo.tipoCosto(), tipo.flujo(), tipo.descripcion(), tipo.estado()
        ));
        table.putItem(item);
        return item.toDomain();
    }

    @Override
    public Optional<TipoCosto> findById(String id) {
        return DynamoSupport.findOne(table, id).map(TipoCostoItem::toDomain);
    }

    @Override
    public List<TipoCosto> findAll() {
        return DynamoSupport.scanAll(table).stream().map(TipoCostoItem::toDomain).toList();
    }
}
