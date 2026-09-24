package com.rycapp.infrastructure.persistence.dynamo.item;

import com.rycapp.domain.model.LineaNegocio;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

@DynamoDbBean
public class LineaNegocioItem {
    private String id;
    private String lineaNegocio;
    private String nombreLower;
    private String descripcion;
    private String estado;

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLineaNegocio() { return lineaNegocio; }
    public void setLineaNegocio(String lineaNegocio) { this.lineaNegocio = lineaNegocio; }

    @DynamoDbSecondaryPartitionKey(indexNames = "nombre-index")
    public String getNombreLower() { return nombreLower; }
    public void setNombreLower(String nombreLower) { this.nombreLower = nombreLower; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LineaNegocio toDomain() {
        return new LineaNegocio(id, lineaNegocio, descripcion, estado);
    }

    public static LineaNegocioItem from(LineaNegocio d) {
        LineaNegocioItem i = new LineaNegocioItem();
        i.setId(d.id());
        i.setLineaNegocio(d.lineaNegocio());
        i.setNombreLower(d.lineaNegocio() == null ? null : d.lineaNegocio().trim().toLowerCase());
        i.setDescripcion(d.descripcion());
        i.setEstado(d.estado());
        return i;
    }
}
