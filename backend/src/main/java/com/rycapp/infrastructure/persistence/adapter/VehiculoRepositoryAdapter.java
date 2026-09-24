package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.VehiculoRepository;
import com.rycapp.application.util.Ids;
import com.rycapp.domain.model.Vehiculo;
import com.rycapp.infrastructure.persistence.dynamo.DynamoSupport;
import com.rycapp.infrastructure.persistence.dynamo.item.VehiculoItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.util.List;
import java.util.Optional;

@Repository
public class VehiculoRepositoryAdapter implements VehiculoRepository {
    private final DynamoDbTable<VehiculoItem> table;

    public VehiculoRepositoryAdapter(DynamoDbTable<VehiculoItem> vehiculosTable) {
        this.table = vehiculosTable;
    }

    @Override
    public Vehiculo save(Vehiculo vehiculo) {
        VehiculoItem item = VehiculoItem.from(new Vehiculo(
                Ids.oNuevo(vehiculo.id()),
                vehiculo.placa(),
                vehiculo.clase(),
                vehiculo.marca(),
                vehiculo.modelo(),
                vehiculo.estado(),
                vehiculo.conductorId()
        ));
        table.putItem(item);
        return item.toDomain();
    }

    @Override
    public Optional<Vehiculo> findById(String id) {
        return DynamoSupport.findOne(table, id).map(VehiculoItem::toDomain);
    }

    @Override
    public List<Vehiculo> findAll() {
        return DynamoSupport.scanAll(table).stream().map(VehiculoItem::toDomain).toList();
    }

    @Override
    public boolean existsByPlacaIgnoreCase(String placa) {
        return DynamoSupport.exists(table.index("placa-index"), DynamoSupport.lower(placa));
    }

    @Override
    public boolean conductorAsignadoOtroVehiculo(String conductorId, String excluirVehiculoId) {
        if (conductorId == null || conductorId.isBlank()) {
            return false;
        }
        return DynamoSupport.queryAll(table.index("conductor-index"), conductorId).stream()
                .anyMatch(v -> excluirVehiculoId == null || !excluirVehiculoId.equals(v.getId()));
    }
}
