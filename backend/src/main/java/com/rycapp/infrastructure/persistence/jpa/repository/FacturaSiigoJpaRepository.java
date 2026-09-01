package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.FacturaSiigoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface FacturaSiigoJpaRepository extends JpaRepository<FacturaSiigoEntity, Long> {

    Optional<FacturaSiigoEntity> findBySiigoInvoiceId(String siigoInvoiceId);

    @Query("""
            select f from FacturaSiigoEntity f
            left join fetch f.operacion
            order by f.fecha desc, f.fechaSincronizacion desc, f.id desc
            """)
    List<FacturaSiigoEntity> findAllFetched();

    @Query("""
            select f from FacturaSiigoEntity f
            left join fetch f.operacion
            where f.operacion.id in :ids
            """)
    List<FacturaSiigoEntity> findByOperacionIdInFetched(@Param("ids") Collection<Long> ids);
}
