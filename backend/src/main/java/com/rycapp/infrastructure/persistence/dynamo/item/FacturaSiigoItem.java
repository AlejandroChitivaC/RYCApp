package com.rycapp.infrastructure.persistence.dynamo.item;

import com.rycapp.domain.model.FacturaSiigo;
import com.rycapp.infrastructure.persistence.dynamo.InstantIsoConverter;
import com.rycapp.infrastructure.persistence.dynamo.LocalDateIsoConverter;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbConvertedBy;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@DynamoDbBean
public class FacturaSiigoItem {
    private String id;
    private String operacionId;
    private String siigoInvoiceId;
    private String numero;
    private String prefijo;
    private LocalDate fecha;
    private LocalDate fechaVencimiento;
    private String identificacionCliente;
    private String nombreCliente;
    private BigDecimal total;
    private BigDecimal saldo;
    private String estadoPago;
    private String observaciones;
    private Instant fechaSincronizacion;

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    @DynamoDbSecondaryPartitionKey(indexNames = "operacion-index")
    public String getOperacionId() { return operacionId; }
    public void setOperacionId(String operacionId) { this.operacionId = operacionId; }

    public String getSiigoInvoiceId() { return siigoInvoiceId; }
    public void setSiigoInvoiceId(String siigoInvoiceId) { this.siigoInvoiceId = siigoInvoiceId; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public String getPrefijo() { return prefijo; }
    public void setPrefijo(String prefijo) { this.prefijo = prefijo; }

    @DynamoDbConvertedBy(LocalDateIsoConverter.class)
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    @DynamoDbConvertedBy(LocalDateIsoConverter.class)
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }

    public String getIdentificacionCliente() { return identificacionCliente; }
    public void setIdentificacionCliente(String identificacionCliente) { this.identificacionCliente = identificacionCliente; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public BigDecimal getSaldo() { return saldo; }
    public void setSaldo(BigDecimal saldo) { this.saldo = saldo; }

    public String getEstadoPago() { return estadoPago; }
    public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    @DynamoDbConvertedBy(InstantIsoConverter.class)
    public Instant getFechaSincronizacion() { return fechaSincronizacion; }
    public void setFechaSincronizacion(Instant fechaSincronizacion) { this.fechaSincronizacion = fechaSincronizacion; }

    public FacturaSiigo toDomain() {
        return new FacturaSiigo(
                id, operacionId, siigoInvoiceId, numero, prefijo, fecha, fechaVencimiento,
                identificacionCliente, nombreCliente, total, saldo, estadoPago, observaciones, fechaSincronizacion
        );
    }

    public static FacturaSiigoItem from(FacturaSiigo d) {
        FacturaSiigoItem i = new FacturaSiigoItem();
        i.setId(d.id());
        i.setOperacionId(d.operacionId());
        i.setSiigoInvoiceId(d.siigoInvoiceId());
        i.setNumero(d.numero());
        i.setPrefijo(d.prefijo());
        i.setFecha(d.fecha());
        i.setFechaVencimiento(d.fechaVencimiento());
        i.setIdentificacionCliente(d.identificacionCliente());
        i.setNombreCliente(d.nombreCliente());
        i.setTotal(d.total());
        i.setSaldo(d.saldo());
        i.setEstadoPago(d.estadoPago());
        i.setObservaciones(d.observaciones());
        i.setFechaSincronizacion(d.fechaSincronizacion());
        return i;
    }
}
