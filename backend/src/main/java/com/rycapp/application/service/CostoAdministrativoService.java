package com.rycapp.application.service;

import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.CostoAdministrativoUseCase;
import com.rycapp.application.ports.out.CostoAdministrativoRepository;
import com.rycapp.application.ports.out.TipoCostoRepository;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.domain.model.CostoAdministrativo;
import com.rycapp.domain.model.FlujosCosto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class CostoAdministrativoService implements CostoAdministrativoUseCase {
    private final CostoAdministrativoRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final TipoCostoRepository tipoCostoRepository;

    public CostoAdministrativoService(
            CostoAdministrativoRepository repository,
            UsuarioRepository usuarioRepository,
            TipoCostoRepository tipoCostoRepository
    ) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.tipoCostoRepository = tipoCostoRepository;
    }

    @Override
    public CostoAdministrativo crear(
            String usuarioRegistroId,
            String tipoCostoId,
            Instant fechaInicio,
            Instant fechaFin,
            String medioPago,
            BigDecimal valor,
            String descripcion
    ) {
        usuarioRepository.findById(usuarioRegistroId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado (id=" + usuarioRegistroId + ")."));
        var tipo = tipoCostoRepository.findById(tipoCostoId)
                .orElseThrow(() -> new NotFoundException("Tipo de costo no encontrado (id=" + tipoCostoId + ")."));
        FlujosCosto.rechazarSiExigeAsignacion(tipo);
        return repository.save(new CostoAdministrativo(
                null,
                usuarioRegistroId,
                tipoCostoId,
                Instant.now(),
                fechaInicio,
                fechaFin,
                medioPago,
                valor,
                descripcion
        ));
    }

    @Override
    public List<CostoAdministrativo> listar() {
        return repository.findAll();
    }

    @Override
    public CostoAdministrativo obtener(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Costo administrativo no encontrado (id=" + id + ")."));
    }
}
