package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.NominaRepository;
import com.rycapp.domain.model.Nomina;
import com.rycapp.infrastructure.persistence.jpa.entity.NominaEntity;
import com.rycapp.infrastructure.persistence.jpa.mapper.NominaMapper;
import com.rycapp.infrastructure.persistence.jpa.mapper.TimeMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.NominaJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.TipoCostoJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.UsuarioJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class NominaRepositoryAdapter implements NominaRepository {
    private final NominaJpaRepository jpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final TipoCostoJpaRepository tipoCostoJpaRepository;

    public NominaRepositoryAdapter(
            NominaJpaRepository jpaRepository,
            UsuarioJpaRepository usuarioJpaRepository,
            TipoCostoJpaRepository tipoCostoJpaRepository
    ) {
        this.jpaRepository = jpaRepository;
        this.usuarioJpaRepository = usuarioJpaRepository;
        this.tipoCostoJpaRepository = tipoCostoJpaRepository;
    }

    @Override
    public Nomina save(Nomina n) {
        var e = new NominaEntity();
        e.setId(n.id());
        e.setUsuarioRegistro(usuarioJpaRepository.getReferenceById(n.usuarioRegistroId()));
        e.setTipoCosto(tipoCostoJpaRepository.getReferenceById(n.tipoCostoId()));
        e.setUsuarioDebitado(usuarioJpaRepository.getReferenceById(n.usuarioDebitadoId()));
        e.setFechaInsercion(TimeMapper.toLocalDateTimeUtc(n.fechaInsercion()));
        e.setFechaInicio(n.fechaInicio() != null ? TimeMapper.toLocalDateTimeUtc(n.fechaInicio()) : null);
        e.setFechaFin(n.fechaFin() != null ? TimeMapper.toLocalDateTimeUtc(n.fechaFin()) : null);
        e.setMedioPago(n.medioPago());
        e.setValor(n.valor());
        e.setDescripcion(n.descripcion());
        var saved = jpaRepository.save(e);
        return jpaRepository.findOneFetched(saved.getId()).map(NominaMapper::toDomain).orElseThrow();
    }

    @Override
    public Optional<Nomina> findById(Long id) {
        return jpaRepository.findOneFetched(id).map(NominaMapper::toDomain);
    }

    @Override
    public List<Nomina> findAll() {
        return jpaRepository.findAllFetched().stream().map(NominaMapper::toDomain).toList();
    }
}
