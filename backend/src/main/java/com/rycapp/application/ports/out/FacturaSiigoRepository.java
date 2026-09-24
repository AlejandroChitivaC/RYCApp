package com.rycapp.application.ports.out;

import com.rycapp.domain.model.FacturaSiigo;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface FacturaSiigoRepository {
    FacturaSiigo save(FacturaSiigo factura);

    Optional<FacturaSiigo> findBySiigoInvoiceId(String siigoInvoiceId);

    List<FacturaSiigo> findAll();

    List<FacturaSiigo> findByOperacionIds(Collection<String> operacionIds);
}
