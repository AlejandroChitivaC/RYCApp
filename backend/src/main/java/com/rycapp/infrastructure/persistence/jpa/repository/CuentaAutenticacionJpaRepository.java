package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.CuentaAutenticacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CuentaAutenticacionJpaRepository extends JpaRepository<CuentaAutenticacionEntity, Long> {
    boolean existsByCorreoIgnoreCase(String correo);

    @Query("""
            select c from CuentaAutenticacionEntity c
            join fetch c.usuario u
            join fetch u.rol
            where lower(c.correo) = lower(:correo)
            """)
    Optional<CuentaAutenticacionEntity> findWithUsuarioByCorreoIgnoreCase(@Param("correo") String correo);
}
