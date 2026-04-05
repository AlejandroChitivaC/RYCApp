package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.Usuario;
import com.rycapp.infrastructure.persistence.jpa.entity.RolEntity;
import com.rycapp.infrastructure.persistence.jpa.entity.UsuarioEntity;

public final class UsuarioMapper {
    private UsuarioMapper() {}

    public static UsuarioEntity toEntity(Usuario domain, RolEntity rol) {
        if (domain == null) return null;
        var e = new UsuarioEntity();
        e.setId(domain.id());
        e.setRol(rol);
        e.setCedula(domain.cedula());
        e.setNombre(domain.nombre());
        e.setApellido(domain.apellido());
        e.setEstado(domain.estado());
        return e;
    }

    public static Usuario toDomain(UsuarioEntity entity) {
        if (entity == null) return null;
        return new Usuario(
                entity.getId(),
                entity.getRol().getId(),
                entity.getCedula(),
                entity.getNombre(),
                entity.getApellido(),
                entity.getEstado()
        );
    }
}
