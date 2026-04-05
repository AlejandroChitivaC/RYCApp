package com.rycapp.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Vehiculo")
public class VehiculoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Vehiculo")
    private Long id;

    @Column(name = "Placa", nullable = false, length = 20, unique = true)
    private String placa;

    @Column(name = "Clase", nullable = false, length = 60)
    private String clase;

    @Column(name = "Marca", nullable = false, length = 60)
    private String marca;

    @Column(name = "Modelo", nullable = false, length = 60)
    private String modelo;

    @Column(name = "Estado", nullable = false, length = 32)
    private String estado;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getClase() {
        return clase;
    }

    public void setClase(String clase) {
        this.clase = clase;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
