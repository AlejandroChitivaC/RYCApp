package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.CostoFinancieroOtrosGastosRepository;
import com.rycapp.domain.model.CostoFinancieroOtrosGastos;
import com.rycapp.infrastructure.persistence.jpa.entity.CostoFinancieroOtrosGastosEntity;
import com.rycapp.infrastructure.persistence.jpa.mapper.CostoFinancieroOtrosGastosMapper;
import com.rycapp.infrastructure.persistence.jpa.mapper.TimeMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.CostoFinancieroOtrosGastosJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.TipoCostoJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.UsuarioJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CostoFinancieroOtrosGastosRepositoryAdapter implements CostoFinancieroOtrosGastosRepository {
    private final CostoFinancieroOtrosGastosJpaRepository jpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final TipoCostoJpaRepository tipoCostoJpaRepository;

    public CostoFinancieroOtrosGastosRepositoryAdapter(
            CostoFinancieroOtrosGastosJpaRepository jpaRepository,
            UsuarioJpaRepository usuarioJpaRepository,
            TipoCostoJpaRepository tipoCostoJpaRepository
    ) {
        this.jpaRepository = jpaRepository;
        this.usuarioJpaRepository = usuarioJpaRepository;
        this.tipoCostoJpaRepository = tipoCostoJpaRepository;
    }

    @Override
    public CostoFinancieroOtrosGastos save(CostoFinancieroOtrosGastos c) {
        var e = new CostoFinancieroOtrosGastosEntity();
        e.setId(c.id());
        e.setUsuarioRegistro(usuarioJpaRepository.getReferenceById(c.usuarioRegistroId()));
        e.setTipoCosto(tipoCostoJpaRepository.getReferenceById(c.tipoCostoId()));
        e.setFechaInsercion(TimeMapper.toLocalDateTimeUtc(c.fechaInsercion()));
        e.setMedioPago(c.medioPago());
        e.setValor(c.valor());
        e.setDescripcion(c.descripcion());
        var saved = jpaRepository.save(e);
        return jpaRepository.findOneFetched(saved.getId()).map(CostoFinancieroOtrosGastosMapper::toDomain).orElseThrow();
    }

    @Override
    public Optional<CostoFinancieroOtrosGastos> findById(Long id) {
        return jpaRepository.findOneFetched(id).map(CostoFinancieroOtrosGastosMapper::toDomain);
    }

    @Override
    public List<CostoFinancieroOtrosGastos> findAll() {
        return jpaRepository.findAllFetched().stream().map(CostoFinancieroOtrosGastosMapper::toDomain).toList();
    }
}
