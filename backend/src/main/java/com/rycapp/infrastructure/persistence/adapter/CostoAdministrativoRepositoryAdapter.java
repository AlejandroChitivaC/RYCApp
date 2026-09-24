package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.CostoAdministrativoRepository;
import com.rycapp.domain.model.CostoAdministrativo;
import com.rycapp.infrastructure.persistence.dynamo.item.CostoItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class CostoAdministrativoRepositoryAdapter implements CostoAdministrativoRepository {
    private final CostoTableSupport costos;

    public CostoAdministrativoRepositoryAdapter(DynamoDbTable<CostoItem> costosTable) {
        this.costos = new CostoTableSupport(costosTable);
    }

    @Override
    public CostoAdministrativo save(CostoAdministrativo entity) {
        return costos.save(CostoItem.from(entity)).toAdministrativo();
    }

    @Override
    public Optional<CostoAdministrativo> findById(String id) {
        return costos.findById(id)
                .filter(i -> CostoItem.ADMINISTRATIVO.equals(i.getCategoria()))
                .map(CostoItem::toAdministrativo);
    }

    @Override
    public List<CostoAdministrativo> findAll() {
        return costos.mapCategoria(CostoItem.ADMINISTRATIVO, CostoItem::toAdministrativo);
    }

    @Override
    public List<CostoAdministrativo> findByFechaInsercionBetween(Instant from, Instant to) {
        return costos.findByCategoriaAndFecha(CostoItem.ADMINISTRATIVO, from, to).stream()
                .map(CostoItem::toAdministrativo)
                .toList();
    }
}
