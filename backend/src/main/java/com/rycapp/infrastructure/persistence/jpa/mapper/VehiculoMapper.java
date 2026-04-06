package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.Vehiculo;
import com.rycapp.infrastructure.persistence.jpa.entity.UsuarioEntity;
import com.rycapp.infrastructure.persistence.jpa.entity.VehiculoEntity;

public final class VehiculoMapper {
    private VehiculoMapper() {}

    public static Vehiculo toDomain(VehiculoEntity entity) {
        if (entity == null) return null;
        Long conductorId = entity.getConductor() != null ? entity.getConductor().getId() : null;
        return new Vehiculo(
                entity.getId(),
                entity.getPlaca(),
                entity.getClase(),
                entity.getMarca(),
                entity.getModelo(),
                entity.getEstado(),
                conductorId
        );
    }

    public static VehiculoEntity toEntity(Vehiculo domain, UsuarioEntity conductor) {
        if (domain == null) return null;
        var e = new VehiculoEntity();
        e.setId(domain.id());
        e.setPlaca(domain.placa());
        e.setClase(domain.clase());
        e.setMarca(domain.marca());
        e.setModelo(domain.modelo());
        e.setEstado(domain.estado());
        e.setConductor(conductor);
        return e;
    }
}
