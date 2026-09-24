package com.rycapp.infrastructure.persistence.dynamo.item;

import com.rycapp.domain.model.Operacion;
import com.rycapp.infrastructure.persistence.dynamo.InstantIsoConverter;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbConvertedBy;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondarySortKey;

import java.math.BigDecimal;
import java.time.Instant;

@DynamoDbBean
public class OperacionItem {
    private String id;
    private String usuarioRegistroId;
    private String lineaNegocioId;
    private String vehiculoId;
    private String materialId;
    private String proveedorId;
    private Instant fechaInsercion;
    private Instant fechaInicio;
    private Instant fechaFin;
    private String medioPago;
    private BigDecimal valor;
    private String descripcion;
    private String estado;

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsuarioRegistroId() { return usuarioRegistroId; }
    public void setUsuarioRegistroId(String usuarioRegistroId) { this.usuarioRegistroId = usuarioRegistroId; }

    public String getLineaNegocioId() { return lineaNegocioId; }
    public void setLineaNegocioId(String lineaNegocioId) { this.lineaNegocioId = lineaNegocioId; }

    public String getVehiculoId() { return vehiculoId; }
    public void setVehiculoId(String vehiculoId) { this.vehiculoId = vehiculoId; }

    public String getMaterialId() { return materialId; }
    public void setMaterialId(String materialId) { this.materialId = materialId; }

    public String getProveedorId() { return proveedorId; }
    public void setProveedorId(String proveedorId) { this.proveedorId = proveedorId; }

    @DynamoDbConvertedBy(InstantIsoConverter.class)
    @DynamoDbSecondarySortKey(indexNames = "estado-fecha-index")
    public Instant getFechaInsercion() { return fechaInsercion; }
    public void setFechaInsercion(Instant fechaInsercion) { this.fechaInsercion = fechaInsercion; }

    @DynamoDbConvertedBy(InstantIsoConverter.class)
    public Instant getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(Instant fechaInicio) { this.fechaInicio = fechaInicio; }

    @DynamoDbConvertedBy(InstantIsoConverter.class)
    public Instant getFechaFin() { return fechaFin; }
    public void setFechaFin(Instant fechaFin) { this.fechaFin = fechaFin; }

    public String getMedioPago() { return medioPago; }
    public void setMedioPago(String medioPago) { this.medioPago = medioPago; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    @DynamoDbSecondaryPartitionKey(indexNames = "estado-fecha-index")
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Operacion toDomain() {
        return new Operacion(
                id, usuarioRegistroId, lineaNegocioId, vehiculoId, materialId, proveedorId,
                fechaInsercion, fechaInicio, fechaFin, medioPago, valor, descripcion, estado
        );
    }

    public static OperacionItem from(Operacion d) {
        OperacionItem i = new OperacionItem();
        i.setId(d.id());
        i.setUsuarioRegistroId(d.usuarioRegistroId());
        i.setLineaNegocioId(d.lineaNegocioId());
        i.setVehiculoId(d.vehiculoId());
        i.setMaterialId(d.materialId());
        i.setProveedorId(d.proveedorId());
        i.setFechaInsercion(d.fechaInsercion());
        i.setFechaInicio(d.fechaInicio());
        i.setFechaFin(d.fechaFin());
        i.setMedioPago(d.medioPago());
        i.setValor(d.valor());
        i.setDescripcion(d.descripcion());
        i.setEstado(d.estado());
        return i;
    }
}
