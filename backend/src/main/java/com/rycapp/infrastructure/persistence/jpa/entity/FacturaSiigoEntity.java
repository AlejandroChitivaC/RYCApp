package com.rycapp.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Factura_Siigo")
public class FacturaSiigoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Factura_Siigo")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Operacion")
    private OperacionEntity operacion;

    @Column(name = "Siigo_Invoice_Id", nullable = false, unique = true, length = 64)
    private String siigoInvoiceId;

    @Column(name = "Numero", length = 80)
    private String numero;

    @Column(name = "Prefijo", length = 20)
    private String prefijo;

    @Column(name = "Fecha")
    private LocalDate fecha;

    @Column(name = "Fecha_Vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "Identificacion_Cliente", length = 30)
    private String identificacionCliente;

    @Column(name = "Nombre_Cliente", length = 200)
    private String nombreCliente;

    @Column(name = "Total", nullable = false, precision = 14, scale = 2)
    private BigDecimal total;

    @Column(name = "Saldo", nullable = false, precision = 14, scale = 2)
    private BigDecimal saldo;

    @Column(name = "Estado_Pago", nullable = false, length = 20)
    private String estadoPago;

    @Column(name = "Observaciones", length = 1000)
    private String observaciones;

    @Column(name = "Fecha_Sincronizacion", nullable = false)
    private LocalDateTime fechaSincronizacion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OperacionEntity getOperacion() {
        return operacion;
    }

    public void setOperacion(OperacionEntity operacion) {
        this.operacion = operacion;
    }

    public String getSiigoInvoiceId() {
        return siigoInvoiceId;
    }

    public void setSiigoInvoiceId(String siigoInvoiceId) {
        this.siigoInvoiceId = siigoInvoiceId;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getPrefijo() {
        return prefijo;
    }

    public void setPrefijo(String prefijo) {
        this.prefijo = prefijo;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalDate getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(LocalDate fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public String getIdentificacionCliente() {
        return identificacionCliente;
    }

    public void setIdentificacionCliente(String identificacionCliente) {
        this.identificacionCliente = identificacionCliente;
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }

    public String getEstadoPago() {
        return estadoPago;
    }

    public void setEstadoPago(String estadoPago) {
        this.estadoPago = estadoPago;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public LocalDateTime getFechaSincronizacion() {
        return fechaSincronizacion;
    }

    public void setFechaSincronizacion(LocalDateTime fechaSincronizacion) {
        this.fechaSincronizacion = fechaSincronizacion;
    }
}
