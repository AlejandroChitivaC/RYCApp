package com.rycapp.infrastructure.persistence.dynamo.item;

import com.rycapp.domain.model.TipoCosto;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

@DynamoDbBean
public class TipoCostoItem {
    private String id;
    private String tipoCosto;
    private String flujo;
    private String descripcion;
    private String estado;

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTipoCosto() { return tipoCosto; }
    public void setTipoCosto(String tipoCosto) { this.tipoCosto = tipoCosto; }

    public String getFlujo() { return flujo; }
    public void setFlujo(String flujo) { this.flujo = flujo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public TipoCosto toDomain() {
        return new TipoCosto(id, tipoCosto, flujo, descripcion, estado);
    }

    public static TipoCostoItem from(TipoCosto d) {
        TipoCostoItem i = new TipoCostoItem();
        i.setId(d.id());
        i.setTipoCosto(d.tipoCosto());
        i.setFlujo(d.flujo());
        i.setDescripcion(d.descripcion());
        i.setEstado(d.estado());
        return i;
    }
}
