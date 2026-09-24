package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.Proveedor;
import com.rycapp.infrastructure.persistence.jpa.entity.ProveedorEntity;

public final class ProveedorMapper {
    private ProveedorMapper() {}

    public static Proveedor toDomain(ProveedorEntity entity) {
        if (entity == null) return null;
        return new Proveedor(
                entity.getId(),
                entity.getNombre(),
                entity.getNit(),
                entity.getDepartamento(),
                entity.getMunicipio(),
                entity.getDescripcion(),
                entity.getEstado()
        );
    }

    public static ProveedorEntity toEntity(Proveedor domain) {
        if (domain == null) return null;
        var e = new ProveedorEntity();
        e.setId(domain.id());
        e.setNombre(domain.nombre());
        e.setNit(domain.nit());
        e.setDepartamento(domain.departamento());
        e.setMunicipio(domain.municipio());
        e.setDescripcion(domain.descripcion());
        e.setEstado(domain.estado());
        return e;
    }
}
