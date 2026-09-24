package com.rycapp.infrastructure.persistence.dynamo.item;

import com.rycapp.domain.model.CostoAdministrativo;
import com.rycapp.domain.model.CostoFinancieroOtrosGastos;
import com.rycapp.domain.model.CostoVehiculo;
import com.rycapp.domain.model.Nomina;
import com.rycapp.infrastructure.persistence.dynamo.InstantIsoConverter;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbConvertedBy;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondarySortKey;

import java.math.BigDecimal;
import java.time.Instant;

@DynamoDbBean
public class CostoItem {
    public static final String NOMINA = "NOMINA";
    public static final String ADMINISTRATIVO = "ADMINISTRATIVO";
    public static final String VEHICULO = "VEHICULO";
    public static final String FINANCIERO = "FINANCIERO";

    private String id;
    private String categoria;
    private String usuarioRegistroId;
    private String tipoCostoId;
    private String usuarioDebitadoId;
    private String vehiculoId;
    private Instant fechaInsercion;
    private Instant fechaInicio;
    private Instant fechaFin;
    private String medioPago;
    private BigDecimal valor;
    private String motivo;
    private String descripcion;

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    @DynamoDbSecondaryPartitionKey(indexNames = "categoria-fecha-index")
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getUsuarioRegistroId() { return usuarioRegistroId; }
    public void setUsuarioRegistroId(String usuarioRegistroId) { this.usuarioRegistroId = usuarioRegistroId; }

    public String getTipoCostoId() { return tipoCostoId; }
    public void setTipoCostoId(String tipoCostoId) { this.tipoCostoId = tipoCostoId; }

    public String getUsuarioDebitadoId() { return usuarioDebitadoId; }
    public void setUsuarioDebitadoId(String usuarioDebitadoId) { this.usuarioDebitadoId = usuarioDebitadoId; }

    public String getVehiculoId() { return vehiculoId; }
    public void setVehiculoId(String vehiculoId) { this.vehiculoId = vehiculoId; }

    @DynamoDbConvertedBy(InstantIsoConverter.class)
    @DynamoDbSecondarySortKey(indexNames = "categoria-fecha-index")
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

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Nomina toNomina() {
        return new Nomina(id, usuarioRegistroId, tipoCostoId, usuarioDebitadoId,
                fechaInsercion, fechaInicio, fechaFin, medioPago, valor, descripcion);
    }

    public CostoAdministrativo toAdministrativo() {
        return new CostoAdministrativo(id, usuarioRegistroId, tipoCostoId,
                fechaInsercion, fechaInicio, fechaFin, medioPago, valor, descripcion);
    }

    public CostoVehiculo toVehiculo() {
        return new CostoVehiculo(id, usuarioRegistroId, tipoCostoId, vehiculoId,
                fechaInsercion, fechaInicio, fechaFin, medioPago, valor, motivo, descripcion);
    }

    public CostoFinancieroOtrosGastos toFinanciero() {
        return new CostoFinancieroOtrosGastos(id, usuarioRegistroId, tipoCostoId,
                fechaInsercion, medioPago, valor, descripcion);
    }

    public static CostoItem from(Nomina d) {
        CostoItem i = base(d.id(), NOMINA, d.usuarioRegistroId(), d.tipoCostoId(),
                d.fechaInsercion(), d.fechaInicio(), d.fechaFin(), d.medioPago(), d.valor(), d.descripcion());
        i.setUsuarioDebitadoId(d.usuarioDebitadoId());
        return i;
    }

    public static CostoItem from(CostoAdministrativo d) {
        return base(d.id(), ADMINISTRATIVO, d.usuarioRegistroId(), d.tipoCostoId(),
                d.fechaInsercion(), d.fechaInicio(), d.fechaFin(), d.medioPago(), d.valor(), d.descripcion());
    }

    public static CostoItem from(CostoVehiculo d) {
        CostoItem i = base(d.id(), VEHICULO, d.usuarioRegistroId(), d.tipoCostoId(),
                d.fechaInsercion(), d.fechaInicio(), d.fechaFin(), d.medioPago(), d.valor(), d.descripcion());
        i.setVehiculoId(d.vehiculoId());
        i.setMotivo(d.motivo());
        return i;
    }

    public static CostoItem from(CostoFinancieroOtrosGastos d) {
        return base(d.id(), FINANCIERO, d.usuarioRegistroId(), d.tipoCostoId(),
                d.fechaInsercion(), null, null, d.medioPago(), d.valor(), d.descripcion());
    }

    private static CostoItem base(
            String id,
            String categoria,
            String usuarioRegistroId,
            String tipoCostoId,
            Instant fechaInsercion,
            Instant fechaInicio,
            Instant fechaFin,
            String medioPago,
            BigDecimal valor,
            String descripcion
    ) {
        CostoItem i = new CostoItem();
        i.setId(id);
        i.setCategoria(categoria);
        i.setUsuarioRegistroId(usuarioRegistroId);
        i.setTipoCostoId(tipoCostoId);
        i.setFechaInsercion(fechaInsercion);
        i.setFechaInicio(fechaInicio);
        i.setFechaFin(fechaFin);
        i.setMedioPago(medioPago);
        i.setValor(valor);
        i.setDescripcion(descripcion);
        return i;
    }
}
