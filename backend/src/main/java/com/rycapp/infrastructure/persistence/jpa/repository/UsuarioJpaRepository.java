package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioJpaRepository extends JpaRepository<UsuarioEntity, Long> {
    boolean existsByCedulaIgnoreCase(String cedula);

    @Query("select u from UsuarioEntity u join fetch u.rol where u.id = :id")
    Optional<UsuarioEntity> findOneFetched(@Param("id") Long id);

    @Query("select u from UsuarioEntity u join fetch u.rol order by u.apellido, u.nombre")
    List<UsuarioEntity> findAllFetched();
}
