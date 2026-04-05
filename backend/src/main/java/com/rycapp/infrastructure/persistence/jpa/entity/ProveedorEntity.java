package com.rycapp.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Proveedor")
public class ProveedorEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Proveedor")
    private Long id;

    @Column(name = "Nombre", nullable = false, length = 160)
    private String nombre;

    @Column(name = "NIT", nullable = false, length = 30, unique = true)
    private String nit;

    @Column(name = "Departamento", length = 80)
    private String departamento;

    @Column(name = "Municipio", length = 80)
    private String municipio;

    @Column(name = "Descripcion", length = 500)
    private String descripcion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getNit() {
        return nit;
    }

    public void setNit(String nit) {
        this.nit = nit;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
