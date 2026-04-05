package com.rycapp.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Linea_Negocio")
public class LineaNegocioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Linea_Negocio")
    private Long id;

    @Column(name = "Linea_Negocio", nullable = false, length = 120, unique = true)
    private String lineaNegocio;

    @Column(name = "Descripcion", length = 500)
    private String descripcion;

    @Column(name = "Estado", nullable = false, length = 32)
    private String estado;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLineaNegocio() {
        return lineaNegocio;
    }

    public void setLineaNegocio(String lineaNegocio) {
        this.lineaNegocio = lineaNegocio;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
