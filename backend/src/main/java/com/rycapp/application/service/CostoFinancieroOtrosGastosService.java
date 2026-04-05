package com.rycapp.application.service;

import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.CostoFinancieroOtrosGastosUseCase;
import com.rycapp.application.ports.out.CostoFinancieroOtrosGastosRepository;
import com.rycapp.application.ports.out.TipoCostoRepository;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.domain.model.CostoFinancieroOtrosGastos;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class CostoFinancieroOtrosGastosService implements CostoFinancieroOtrosGastosUseCase {
    private final CostoFinancieroOtrosGastosRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final TipoCostoRepository tipoCostoRepository;

    public CostoFinancieroOtrosGastosService(
            CostoFinancieroOtrosGastosRepository repository,
            UsuarioRepository usuarioRepository,
            TipoCostoRepository tipoCostoRepository
    ) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.tipoCostoRepository = tipoCostoRepository;
    }

    @Override
    public CostoFinancieroOtrosGastos crear(Long usuarioRegistroId, Long tipoCostoId, String medioPago, BigDecimal valor, String descripcion) {
        usuarioRepository.findById(usuarioRegistroId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado (id=" + usuarioRegistroId + ")."));
        tipoCostoRepository.findById(tipoCostoId)
                .orElseThrow(() -> new NotFoundException("Tipo de costo no encontrado (id=" + tipoCostoId + ")."));
        return repository.save(new CostoFinancieroOtrosGastos(
                null, usuarioRegistroId, tipoCostoId, Instant.now(), medioPago, valor, descripcion
        ));
    }

    @Override
    public List<CostoFinancieroOtrosGastos> listar() {
        return repository.findAll();
    }

    @Override
    public CostoFinancieroOtrosGastos obtener(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Registro no encontrado (id=" + id + ")."));
    }
}
