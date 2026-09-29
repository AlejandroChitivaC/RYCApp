package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.FacturaSiigoRepository;
import com.rycapp.application.util.Ids;
import com.rycapp.domain.model.FacturaSiigo;
import com.rycapp.infrastructure.persistence.dynamo.DynamoSupport;
import com.rycapp.infrastructure.persistence.dynamo.item.FacturaSiigoItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public class FacturaSiigoRepositoryAdapter implements FacturaSiigoRepository {
    private final DynamoDbTable<FacturaSiigoItem> table;

    public FacturaSiigoRepositoryAdapter(DynamoDbTable<FacturaSiigoItem> facturasSiigoTable) {
        this.table = facturasSiigoTable;
    }

    @Override
    public FacturaSiigo save(FacturaSiigo factura) {
        String id = factura.id() != null ? factura.id() : factura.siigoInvoiceId();
        if (id == null || id.isBlank()) {
            id = Ids.nuevo();
        }
        FacturaSiigoItem item = FacturaSiigoItem.from(new FacturaSiigo(
                id,
                factura.operacionId(),
                factura.siigoInvoiceId() != null ? factura.siigoInvoiceId() : id,
                factura.numero(),
                factura.prefijo(),
                factura.fecha(),
                factura.fechaVencimiento(),
                factura.identificacionCliente(),
                factura.nombreCliente(),
                factura.total(),
                factura.saldo(),
                factura.estadoPago(),
                factura.observaciones(),
                factura.fechaSincronizacion()
        ));
        table.putItem(item);
        return item.toDomain();
    }

    @Override
    public Optional<FacturaSiigo> findById(String id) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }
        return DynamoSupport.findOne(table, id).map(FacturaSiigoItem::toDomain);
    }

    @Override
    public Optional<FacturaSiigo> findBySiigoInvoiceId(String siigoInvoiceId) {
        return DynamoSupport.findOne(table, siigoInvoiceId).map(FacturaSiigoItem::toDomain);
    }

    @Override
    public List<FacturaSiigo> findAll() {
        return DynamoSupport.scanAll(table).stream().map(FacturaSiigoItem::toDomain).toList();
    }

    @Override
    public List<FacturaSiigo> findByOperacionIds(Collection<String> operacionIds) {
        Set<String> wanted = new HashSet<>(operacionIds);
        return findAll().stream()
                .filter(f -> f.operacionId() != null && wanted.contains(f.operacionId()))
                .toList();
    }
}
