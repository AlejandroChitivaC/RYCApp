package com.rycapp.infrastructure.persistence.dynamo.item;

import com.rycapp.domain.model.Rol;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

@DynamoDbBean
public class RolItem {
    private String id;
    private String descripcion;
    private String descripcionLower;

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    @DynamoDbSecondaryPartitionKey(indexNames = "descripcion-index")
    public String getDescripcionLower() { return descripcionLower; }
    public void setDescripcionLower(String descripcionLower) { this.descripcionLower = descripcionLower; }

    public Rol toDomain() {
        return new Rol(id, descripcion);
    }

    public static RolItem from(Rol rol) {
        RolItem item = new RolItem();
        item.setId(rol.id());
        item.setDescripcion(rol.descripcion());
        item.setDescripcionLower(rol.descripcion() == null ? null : rol.descripcion().trim().toLowerCase());
        return item;
    }
}
