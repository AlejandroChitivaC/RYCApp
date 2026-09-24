package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.CostoFinancieroOtrosGastosRepository;
import com.rycapp.domain.model.CostoFinancieroOtrosGastos;
import com.rycapp.infrastructure.persistence.dynamo.item.CostoItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class CostoFinancieroOtrosGastosRepositoryAdapter implements CostoFinancieroOtrosGastosRepository {
    private final CostoTableSupport costos;

    public CostoFinancieroOtrosGastosRepositoryAdapter(DynamoDbTable<CostoItem> costosTable) {
        this.costos = new CostoTableSupport(costosTable);
    }

    @Override
    public CostoFinancieroOtrosGastos save(CostoFinancieroOtrosGastos entity) {
        return costos.save(CostoItem.from(entity)).toFinanciero();
    }

    @Override
    public Optional<CostoFinancieroOtrosGastos> findById(String id) {
        return costos.findById(id)
                .filter(i -> CostoItem.FINANCIERO.equals(i.getCategoria()))
                .map(CostoItem::toFinanciero);
    }

    @Override
    public List<CostoFinancieroOtrosGastos> findAll() {
        return costos.mapCategoria(CostoItem.FINANCIERO, CostoItem::toFinanciero);
    }

    @Override
    public List<CostoFinancieroOtrosGastos> findByFechaInsercionBetween(Instant from, Instant to) {
        return costos.findByCategoriaAndFecha(CostoItem.FINANCIERO, from, to).stream()
                .map(CostoItem::toFinanciero)
                .toList();
    }
}
