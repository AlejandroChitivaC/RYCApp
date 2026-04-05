package com.rycapp.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Operaciones_Lineas_Negocio")
public class OperacionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Operacion")
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Usuario_Registro", nullable = false)
    private UsuarioEntity usuarioRegistro;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Linea_Negocio", nullable = false)
    private LineaNegocioEntity lineaNegocio;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Vehiculo", nullable = false)
    private VehiculoEntity vehiculo;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Material", nullable = false)
    private MaterialEntity material;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Proveedor", nullable = false)
    private ProveedorEntity proveedor;

    @Column(name = "Fecha_Insercion", nullable = false)
    private LocalDateTime fechaInsercion;

    @Column(name = "Fecha_Inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "Fecha_Fin")
    private LocalDateTime fechaFin;

    @Column(name = "Medio_Pago", nullable = false, length = 60)
    private String medioPago;

    @Column(name = "Valor", nullable = false, precision = 14, scale = 2)
    private BigDecimal valor;

    @Column(name = "Descripcion", length = 500)
    private String descripcion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UsuarioEntity getUsuarioRegistro() {
        return usuarioRegistro;
    }

    public void setUsuarioRegistro(UsuarioEntity usuarioRegistro) {
        this.usuarioRegistro = usuarioRegistro;
    }

    public LineaNegocioEntity getLineaNegocio() {
        return lineaNegocio;
    }

    public void setLineaNegocio(LineaNegocioEntity lineaNegocio) {
        this.lineaNegocio = lineaNegocio;
    }

    public VehiculoEntity getVehiculo() {
        return vehiculo;
    }

    public void setVehiculo(VehiculoEntity vehiculo) {
        this.vehiculo = vehiculo;
    }

    public MaterialEntity getMaterial() {
        return material;
    }

    public void setMaterial(MaterialEntity material) {
        this.material = material;
    }

    public ProveedorEntity getProveedor() {
        return proveedor;
    }

    public void setProveedor(ProveedorEntity proveedor) {
        this.proveedor = proveedor;
    }

    public LocalDateTime getFechaInsercion() {
        return fechaInsercion;
    }

    public void setFechaInsercion(LocalDateTime fechaInsercion) {
        this.fechaInsercion = fechaInsercion;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }

    public String getMedioPago() {
        return medioPago;
    }

    public void setMedioPago(String medioPago) {
        this.medioPago = medioPago;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
