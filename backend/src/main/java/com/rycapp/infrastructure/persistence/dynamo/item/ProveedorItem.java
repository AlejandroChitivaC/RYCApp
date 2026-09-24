package com.rycapp.infrastructure.persistence.dynamo.item;

import com.rycapp.domain.model.Proveedor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

@DynamoDbBean
public class ProveedorItem {
    private String id;
    private String nombre;
    private String nit;
    private String nitLower;
    private String departamento;
    private String municipio;
    private String descripcion;
    private String estado;

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getNit() { return nit; }
    public void setNit(String nit) { this.nit = nit; }

    @DynamoDbSecondaryPartitionKey(indexNames = "nit-index")
    public String getNitLower() { return nitLower; }
    public void setNitLower(String nitLower) { this.nitLower = nitLower; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public String getMunicipio() { return municipio; }
    public void setMunicipio(String municipio) { this.municipio = municipio; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Proveedor toDomain() {
        return new Proveedor(id, nombre, nit, departamento, municipio, descripcion, estado);
    }

    public static ProveedorItem from(Proveedor d) {
        ProveedorItem i = new ProveedorItem();
        i.setId(d.id());
        i.setNombre(d.nombre());
        i.setNit(d.nit());
        i.setNitLower(d.nit() == null ? null : d.nit().trim().toLowerCase());
        i.setDepartamento(d.departamento());
        i.setMunicipio(d.municipio());
        i.setDescripcion(d.descripcion());
        i.setEstado(d.estado());
        return i;
    }
}
