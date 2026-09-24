package com.rycapp.application.ports.out;

import com.rycapp.domain.model.TipoCosto;

import java.util.List;
import java.util.Optional;

public interface TipoCostoRepository {
    TipoCosto save(TipoCosto tipoCosto);
    Optional<TipoCosto> findById(String id);
    List<TipoCosto> findAll();
}
