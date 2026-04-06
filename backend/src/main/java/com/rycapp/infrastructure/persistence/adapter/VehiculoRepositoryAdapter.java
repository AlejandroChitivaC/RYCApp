package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.VehiculoRepository;
import com.rycapp.domain.model.Vehiculo;
import com.rycapp.infrastructure.persistence.jpa.mapper.VehiculoMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.UsuarioJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.VehiculoJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class VehiculoRepositoryAdapter implements VehiculoRepository {
    private final VehiculoJpaRepository jpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;

    public VehiculoRepositoryAdapter(VehiculoJpaRepository jpaRepository, UsuarioJpaRepository usuarioJpaRepository) {
        this.jpaRepository = jpaRepository;
        this.usuarioJpaRepository = usuarioJpaRepository;
    }

    @Override
    public Vehiculo save(Vehiculo vehiculo) {
        var conductor = vehiculo.conductorId() != null
                ? usuarioJpaRepository.getReferenceById(vehiculo.conductorId())
                : null;
        var saved = jpaRepository.save(VehiculoMapper.toEntity(vehiculo, conductor));
        return jpaRepository.findOneWithConductor(saved.getId()).map(VehiculoMapper::toDomain).orElseThrow();
    }

    @Override
    public Optional<Vehiculo> findById(Long id) {
        return jpaRepository.findOneWithConductor(id).map(VehiculoMapper::toDomain);
    }

    @Override
    public List<Vehiculo> findAll() {
        return jpaRepository.findAllWithConductor().stream().map(VehiculoMapper::toDomain).toList();
    }

    @Override
    public boolean existsByPlacaIgnoreCase(String placa) {
        return jpaRepository.existsByPlacaIgnoreCase(placa);
    }

    @Override
    public boolean conductorAsignadoOtroVehiculo(Long conductorId, Long excluirVehiculoId) {
        if (conductorId == null) {
            return false;
        }
        if (excluirVehiculoId == null) {
            return jpaRepository.existsByConductor_Id(conductorId);
        }
        return jpaRepository.existsByConductor_IdAndIdNot(conductorId, excluirVehiculoId);
    }
}

