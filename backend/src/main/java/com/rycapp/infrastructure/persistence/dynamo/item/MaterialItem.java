package com.rycapp.infrastructure.persistence.dynamo.item;

import com.rycapp.domain.model.Material;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

@DynamoDbBean
public class MaterialItem {
    private String id;
    private String material;
    private String nombreLower;
    private String descripcion;

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    @DynamoDbSecondaryPartitionKey(indexNames = "nombre-index")
    public String getNombreLower() { return nombreLower; }
    public void setNombreLower(String nombreLower) { this.nombreLower = nombreLower; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Material toDomain() {
        return new Material(id, material, descripcion);
    }

    public static MaterialItem from(Material d) {
        MaterialItem i = new MaterialItem();
        i.setId(d.id());
        i.setMaterial(d.material());
        i.setNombreLower(d.material() == null ? null : d.material().trim().toLowerCase());
        i.setDescripcion(d.descripcion());
        return i;
    }
}
