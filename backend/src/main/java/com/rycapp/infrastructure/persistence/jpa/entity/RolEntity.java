package com.rycapp.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Rol")
public class RolEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Rol")
    private Long id;

    @Column(name = "Descripcion", nullable = false, length = 120)
    private String descripcion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
