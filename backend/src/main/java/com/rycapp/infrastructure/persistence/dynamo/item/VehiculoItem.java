package com.rycapp.infrastructure.persistence.dynamo.item;

import com.rycapp.domain.model.Vehiculo;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

@DynamoDbBean
public class VehiculoItem {
    private String id;
    private String placa;
    private String placaLower;
    private String clase;
    private String marca;
    private String modelo;
    private String estado;
    private String conductorId;

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    @DynamoDbSecondaryPartitionKey(indexNames = "placa-index")
    public String getPlacaLower() { return placaLower; }
    public void setPlacaLower(String placaLower) { this.placaLower = placaLower; }

    public String getClase() { return clase; }
    public void setClase(String clase) { this.clase = clase; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    @DynamoDbSecondaryPartitionKey(indexNames = "conductor-index")
    public String getConductorId() { return conductorId; }
    public void setConductorId(String conductorId) { this.conductorId = conductorId; }

    public Vehiculo toDomain() {
        return new Vehiculo(id, placa, clase, marca, modelo, estado, conductorId);
    }

    public static VehiculoItem from(Vehiculo d) {
        VehiculoItem i = new VehiculoItem();
        i.setId(d.id());
        i.setPlaca(d.placa());
        i.setPlacaLower(d.placa() == null ? null : d.placa().trim().toLowerCase());
        i.setClase(d.clase());
        i.setMarca(d.marca());
        i.setModelo(d.modelo());
        i.setEstado(d.estado());
        i.setConductorId(d.conductorId());
        return i;
    }
}
