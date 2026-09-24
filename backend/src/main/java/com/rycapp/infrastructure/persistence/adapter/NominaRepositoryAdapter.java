package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.NominaRepository;
import com.rycapp.domain.model.Nomina;
import com.rycapp.infrastructure.persistence.dynamo.item.CostoItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class NominaRepositoryAdapter implements NominaRepository {
    private final CostoTableSupport costos;

    public NominaRepositoryAdapter(DynamoDbTable<CostoItem> costosTable) {
        this.costos = new CostoTableSupport(costosTable);
    }

    @Override
    public Nomina save(Nomina entity) {
        return costos.save(CostoItem.from(entity)).toNomina();
    }

    @Override
    public Optional<Nomina> findById(String id) {
        return costos.findById(id).filter(i -> CostoItem.NOMINA.equals(i.getCategoria())).map(CostoItem::toNomina);
    }

    @Override
    public List<Nomina> findAll() {
        return costos.mapCategoria(CostoItem.NOMINA, CostoItem::toNomina);
    }

    @Override
    public List<Nomina> findByFechaInsercionBetween(Instant from, Instant to) {
        return costos.findByCategoriaAndFecha(CostoItem.NOMINA, from, to).stream()
                .map(CostoItem::toNomina)
                .toList();
    }
}
