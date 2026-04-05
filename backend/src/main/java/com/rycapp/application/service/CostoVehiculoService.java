package com.rycapp.application.service;

import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.CostoVehiculoUseCase;
import com.rycapp.application.ports.out.CostoVehiculoRepository;
import com.rycapp.application.ports.out.TipoCostoRepository;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.application.ports.out.VehiculoRepository;
import com.rycapp.domain.model.CostoVehiculo;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class CostoVehiculoService implements CostoVehiculoUseCase {
    private final CostoVehiculoRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final TipoCostoRepository tipoCostoRepository;
    private final VehiculoRepository vehiculoRepository;

    public CostoVehiculoService(
            CostoVehiculoRepository repository,
            UsuarioRepository usuarioRepository,
            TipoCostoRepository tipoCostoRepository,
            VehiculoRepository vehiculoRepository
    ) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.tipoCostoRepository = tipoCostoRepository;
        this.vehiculoRepository = vehiculoRepository;
    }

    @Override
    public CostoVehiculo crear(
            Long usuarioRegistroId,
            Long tipoCostoId,
            Long vehiculoId,
            Instant fechaInicio,
            Instant fechaFin,
            String medioPago,
            BigDecimal valor,
            String motivo,
            String descripcion
    ) {
        usuarioRepository.findById(usuarioRegistroId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado (id=" + usuarioRegistroId + ")."));
        tipoCostoRepository.findById(tipoCostoId)
                .orElseThrow(() -> new NotFoundException("Tipo de costo no encontrado (id=" + tipoCostoId + ")."));
        vehiculoRepository.findById(vehiculoId)
                .orElseThrow(() -> new NotFoundException("Vehículo no encontrado (id=" + vehiculoId + ")."));
        return repository.save(new CostoVehiculo(
                null,
                usuarioRegistroId,
                tipoCostoId,
                vehiculoId,
                Instant.now(),
                fechaInicio,
                fechaFin,
                medioPago,
                valor,
                motivo,
                descripcion
        ));
    }

    @Override
    public List<CostoVehiculo> listar() {
        return repository.findAll();
    }

    @Override
    public CostoVehiculo obtener(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Costo vehículo no encontrado (id=" + id + ")."));
    }
}
