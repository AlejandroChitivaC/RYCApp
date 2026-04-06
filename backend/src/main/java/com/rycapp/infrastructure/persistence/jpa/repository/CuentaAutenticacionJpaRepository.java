package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.CuentaAutenticacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
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

    Optional<CuentaAutenticacionEntity> findByUsuario_Id(Long usuarioId);

    @Query("""
            select c from CuentaAutenticacionEntity c
            join fetch c.usuario u
            where u.estado = 'PENDIENTE_APROBACION' and c.correoVerificado = true
            order by u.id desc
            """)
    List<CuentaAutenticacionEntity> findCuentasPendientesActivacion();

    @Query("""
            select c.correo from CuentaAutenticacionEntity c
            join c.usuario u
            join u.rol r
            where r.descripcion = 'Administrador'
            """)
    List<String> findCorreosAdministradores();
}
