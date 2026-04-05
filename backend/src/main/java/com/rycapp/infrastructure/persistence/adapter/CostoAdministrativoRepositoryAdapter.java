package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.CostoAdministrativoRepository;
import com.rycapp.domain.model.CostoAdministrativo;
import com.rycapp.infrastructure.persistence.jpa.entity.CostoAdministrativoEntity;
import com.rycapp.infrastructure.persistence.jpa.mapper.CostoAdministrativoMapper;
import com.rycapp.infrastructure.persistence.jpa.mapper.TimeMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.CostoAdministrativoJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.TipoCostoJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.UsuarioJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CostoAdministrativoRepositoryAdapter implements CostoAdministrativoRepository {
    private final CostoAdministrativoJpaRepository jpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final TipoCostoJpaRepository tipoCostoJpaRepository;

    public CostoAdministrativoRepositoryAdapter(
            CostoAdministrativoJpaRepository jpaRepository,
            UsuarioJpaRepository usuarioJpaRepository,
            TipoCostoJpaRepository tipoCostoJpaRepository
    ) {
        this.jpaRepository = jpaRepository;
        this.usuarioJpaRepository = usuarioJpaRepository;
        this.tipoCostoJpaRepository = tipoCostoJpaRepository;
    }

    @Override
    public CostoAdministrativo save(CostoAdministrativo c) {
        var e = new CostoAdministrativoEntity();
        e.setId(c.id());
        e.setUsuarioRegistro(usuarioJpaRepository.getReferenceById(c.usuarioRegistroId()));
        e.setTipoCosto(tipoCostoJpaRepository.getReferenceById(c.tipoCostoId()));
        e.setFechaInsercion(TimeMapper.toLocalDateTimeUtc(c.fechaInsercion()));
        e.setFechaInicio(c.fechaInicio() != null ? TimeMapper.toLocalDateTimeUtc(c.fechaInicio()) : null);
        e.setFechaFin(c.fechaFin() != null ? TimeMapper.toLocalDateTimeUtc(c.fechaFin()) : null);
        e.setMedioPago(c.medioPago());
        e.setValor(c.valor());
        e.setDescripcion(c.descripcion());
        var saved = jpaRepository.save(e);
        return jpaRepository.findOneFetched(saved.getId()).map(CostoAdministrativoMapper::toDomain).orElseThrow();
    }

    @Override
    public Optional<CostoAdministrativo> findById(Long id) {
        return jpaRepository.findOneFetched(id).map(CostoAdministrativoMapper::toDomain);
    }

    @Override
    public List<CostoAdministrativo> findAll() {
        return jpaRepository.findAllFetched().stream().map(CostoAdministrativoMapper::toDomain).toList();
    }
}
