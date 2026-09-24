package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.OperacionRepository;
import com.rycapp.application.util.Ids;
import com.rycapp.domain.model.Operacion;
import com.rycapp.domain.model.OperacionEstados;
import com.rycapp.infrastructure.persistence.dynamo.DynamoSupport;
import com.rycapp.infrastructure.persistence.dynamo.item.OperacionItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class OperacionRepositoryAdapter implements OperacionRepository {
    private final DynamoDbTable<OperacionItem> table;

    public OperacionRepositoryAdapter(DynamoDbTable<OperacionItem> operacionesTable) {
        this.table = operacionesTable;
    }

    @Override
    public Operacion save(Operacion operacion) {
        String estado = operacion.estado() != null ? operacion.estado() : OperacionEstados.REGISTRADA;
        OperacionItem item = OperacionItem.from(new Operacion(
                Ids.oNuevo(operacion.id()),
                operacion.usuarioRegistroId(),
                operacion.lineaNegocioId(),
                operacion.vehiculoId(),
                operacion.materialId(),
                operacion.proveedorId(),
                operacion.fechaInsercion(),
                operacion.fechaInicio(),
                operacion.fechaFin(),
                operacion.medioPago(),
                operacion.valor(),
                operacion.descripcion(),
                estado
        ));
        table.putItem(item);
        return item.toDomain();
    }

    @Override
    public Optional<Operacion> findById(String id) {
        return DynamoSupport.findOne(table, id).map(OperacionItem::toDomain);
    }

    @Override
    public List<Operacion> findAll() {
        return DynamoSupport.scanAll(table).stream().map(OperacionItem::toDomain).toList();
    }

    @Override
    public List<Operacion> findByEstado(String estado) {
        return DynamoSupport.queryAll(table.index("estado-fecha-index"), estado).stream()
                .map(OperacionItem::toDomain)
                .toList();
    }

    @Override
    public List<Operacion> filter(
            Instant fromInclusive,
            Instant toInclusive,
            String lineaNegocioId,
            String vehiculoId,
            String proveedorId
    ) {
        return findAll().stream()
                .filter(o -> inRange(o.fechaInsercion(), fromInclusive, toInclusive))
                .filter(o -> lineaNegocioId == null || lineaNegocioId.equals(o.lineaNegocioId()))
                .filter(o -> vehiculoId == null || vehiculoId.equals(o.vehiculoId()))
                .filter(o -> proveedorId == null || proveedorId.equals(o.proveedorId()))
                .toList();
    }

    private static boolean inRange(Instant fecha, Instant from, Instant to) {
        if (fecha == null) {
            return false;
        }
        if (from != null && fecha.isBefore(from)) {
            return false;
        }
        return to == null || !fecha.isAfter(to);
    }
}
