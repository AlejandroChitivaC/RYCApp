package com.rycapp.application.service;

import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.NominaUseCase;
import com.rycapp.application.ports.out.NominaRepository;
import com.rycapp.application.ports.out.TipoCostoRepository;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.domain.model.FlujosCosto;
import com.rycapp.domain.model.Nomina;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class NominaService implements NominaUseCase {
    private final NominaRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final TipoCostoRepository tipoCostoRepository;

    public NominaService(
            NominaRepository repository,
            UsuarioRepository usuarioRepository,
            TipoCostoRepository tipoCostoRepository
    ) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.tipoCostoRepository = tipoCostoRepository;
    }

    @Override
    public Nomina crear(
            String usuarioRegistroId,
            String tipoCostoId,
            String usuarioDebitadoId,
            Instant fechaInicio,
            Instant fechaFin,
            String medioPago,
            BigDecimal valor,
            String descripcion
    ) {
        if (usuarioDebitadoId == null || usuarioDebitadoId.isBlank()) {
            throw new IllegalArgumentException("Debe asignar el usuario al que se le debita.");
        }
        usuarioRepository.findById(usuarioRegistroId)
                .orElseThrow(() -> new NotFoundException("Usuario registro no encontrado (id=" + usuarioRegistroId + ")."));
        usuarioRepository.findById(usuarioDebitadoId)
                .orElseThrow(() -> new NotFoundException("Usuario debitado no encontrado (id=" + usuarioDebitadoId + ")."));
        var tipo = tipoCostoRepository.findById(tipoCostoId)
                .orElseThrow(() -> new NotFoundException("Tipo de costo no encontrado (id=" + tipoCostoId + ")."));
        FlujosCosto.exigirNomina(tipo);
        return repository.save(new Nomina(
                null,
                usuarioRegistroId,
                tipoCostoId,
                usuarioDebitadoId,
                Instant.now(),
                fechaInicio,
                fechaFin,
                medioPago,
                valor,
                descripcion
        ));
    }

    @Override
    public List<Nomina> listar() {
        return repository.findAll();
    }

    @Override
    public Nomina obtener(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Nómina no encontrada (id=" + id + ")."));
    }
}
