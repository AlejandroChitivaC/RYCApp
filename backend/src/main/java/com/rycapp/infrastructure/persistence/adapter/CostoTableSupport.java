package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.util.Ids;
import com.rycapp.infrastructure.persistence.dynamo.DynamoSupport;
import com.rycapp.infrastructure.persistence.dynamo.item.CostoItem;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

final class CostoTableSupport {
    private final DynamoDbTable<CostoItem> table;

    CostoTableSupport(DynamoDbTable<CostoItem> table) {
        this.table = table;
    }

    CostoItem save(CostoItem item) {
        if (item.getId() == null) {
            item.setId(Ids.nuevo());
        }
        table.putItem(item);
        return item;
    }

    Optional<CostoItem> findById(String id) {
        return DynamoSupport.findOne(table, id);
    }

    List<CostoItem> findByCategoria(String categoria) {
        return DynamoSupport.queryAll(table.index("categoria-fecha-index"), categoria);
    }

    List<CostoItem> findByCategoriaAndFecha(String categoria, Instant from, Instant to) {
        if (from == null && to == null) {
            return findByCategoria(categoria);
        }
        Instant start = from != null ? from : Instant.EPOCH;
        Instant end = to != null ? to : Instant.parse("9999-12-31T23:59:59Z");
        List<CostoItem> out = new ArrayList<>();
        table.index("categoria-fecha-index").query(
                QueryConditional.sortBetween(
                        k -> k.partitionValue(categoria).sortValue(start.toString()),
                        k -> k.partitionValue(categoria).sortValue(end.toString())
                )
        ).stream().forEach(page -> out.addAll(page.items()));
        return out;
    }

    <T> List<T> mapCategoria(String categoria, Function<CostoItem, T> mapper) {
        return findByCategoria(categoria).stream().map(mapper).toList();
    }
}
