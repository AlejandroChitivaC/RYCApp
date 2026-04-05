package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.CostoVehiculoRepository;
import com.rycapp.domain.model.CostoVehiculo;
import com.rycapp.infrastructure.persistence.jpa.entity.CostoVehiculoEntity;
import com.rycapp.infrastructure.persistence.jpa.mapper.CostoVehiculoMapper;
import com.rycapp.infrastructure.persistence.jpa.mapper.TimeMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.CostoVehiculoJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.TipoCostoJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.UsuarioJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.VehiculoJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CostoVehiculoRepositoryAdapter implements CostoVehiculoRepository {
    private final CostoVehiculoJpaRepository jpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final TipoCostoJpaRepository tipoCostoJpaRepository;
    private final VehiculoJpaRepository vehiculoJpaRepository;

    public CostoVehiculoRepositoryAdapter(
            CostoVehiculoJpaRepository jpaRepository,
            UsuarioJpaRepository usuarioJpaRepository,
            TipoCostoJpaRepository tipoCostoJpaRepository,
            VehiculoJpaRepository vehiculoJpaRepository
    ) {
        this.jpaRepository = jpaRepository;
        this.usuarioJpaRepository = usuarioJpaRepository;
        this.tipoCostoJpaRepository = tipoCostoJpaRepository;
        this.vehiculoJpaRepository = vehiculoJpaRepository;
    }

    @Override
    public CostoVehiculo save(CostoVehiculo c) {
        var e = new CostoVehiculoEntity();
        e.setId(c.id());
        e.setUsuarioRegistro(usuarioJpaRepository.getReferenceById(c.usuarioRegistroId()));
        e.setTipoCosto(tipoCostoJpaRepository.getReferenceById(c.tipoCostoId()));
        e.setVehiculo(vehiculoJpaRepository.getReferenceById(c.vehiculoId()));
        e.setFechaInsercion(TimeMapper.toLocalDateTimeUtc(c.fechaInsercion()));
        e.setFechaInicio(c.fechaInicio() != null ? TimeMapper.toLocalDateTimeUtc(c.fechaInicio()) : null);
        e.setFechaFin(c.fechaFin() != null ? TimeMapper.toLocalDateTimeUtc(c.fechaFin()) : null);
        e.setMedioPago(c.medioPago());
        e.setValor(c.valor());
        e.setMotivo(c.motivo());
        e.setDescripcion(c.descripcion());
        var saved = jpaRepository.save(e);
        return jpaRepository.findOneFetched(saved.getId()).map(CostoVehiculoMapper::toDomain).orElseThrow();
    }

    @Override
    public Optional<CostoVehiculo> findById(Long id) {
        return jpaRepository.findOneFetched(id).map(CostoVehiculoMapper::toDomain);
    }

    @Override
    public List<CostoVehiculo> findAll() {
        return jpaRepository.findAllFetched().stream().map(CostoVehiculoMapper::toDomain).toList();
    }
}
