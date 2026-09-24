package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.CostoVehiculoRepository;
import com.rycapp.domain.model.CostoVehiculo;
import com.rycapp.infrastructure.persistence.dynamo.item.CostoItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class CostoVehiculoRepositoryAdapter implements CostoVehiculoRepository {
    private final CostoTableSupport costos;

    public CostoVehiculoRepositoryAdapter(DynamoDbTable<CostoItem> costosTable) {
        this.costos = new CostoTableSupport(costosTable);
    }

    @Override
    public CostoVehiculo save(CostoVehiculo entity) {
        return costos.save(CostoItem.from(entity)).toVehiculo();
    }

    @Override
    public Optional<CostoVehiculo> findById(String id) {
        return costos.findById(id)
                .filter(i -> CostoItem.VEHICULO.equals(i.getCategoria()))
                .map(CostoItem::toVehiculo);
    }

    @Override
    public List<CostoVehiculo> findAll() {
        return costos.mapCategoria(CostoItem.VEHICULO, CostoItem::toVehiculo);
    }

    @Override
    public List<CostoVehiculo> findByFechaInsercionBetween(Instant from, Instant to) {
        return costos.findByCategoriaAndFecha(CostoItem.VEHICULO, from, to).stream()
                .map(CostoItem::toVehiculo)
                .toList();
    }
}
