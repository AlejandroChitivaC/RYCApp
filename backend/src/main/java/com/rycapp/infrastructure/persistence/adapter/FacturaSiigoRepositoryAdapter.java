package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.FacturaSiigoRepository;
import com.rycapp.domain.model.FacturaSiigo;
import com.rycapp.infrastructure.persistence.jpa.entity.FacturaSiigoEntity;
import com.rycapp.infrastructure.persistence.jpa.mapper.FacturaSiigoMapper;
import com.rycapp.infrastructure.persistence.jpa.mapper.TimeMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.FacturaSiigoJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.OperacionJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public class FacturaSiigoRepositoryAdapter implements FacturaSiigoRepository {

    private final FacturaSiigoJpaRepository facturaSiigoJpaRepository;
    private final OperacionJpaRepository operacionJpaRepository;

    public FacturaSiigoRepositoryAdapter(
            FacturaSiigoJpaRepository facturaSiigoJpaRepository,
            OperacionJpaRepository operacionJpaRepository
    ) {
        this.facturaSiigoJpaRepository = facturaSiigoJpaRepository;
        this.operacionJpaRepository = operacionJpaRepository;
    }

    @Override
    public FacturaSiigo save(FacturaSiigo factura) {
        FacturaSiigoEntity e = factura.id() != null
                ? facturaSiigoJpaRepository.findById(factura.id()).orElseGet(FacturaSiigoEntity::new)
                : facturaSiigoJpaRepository.findBySiigoInvoiceId(factura.siigoInvoiceId())
                .orElseGet(FacturaSiigoEntity::new);

        e.setSiigoInvoiceId(factura.siigoInvoiceId());
        e.setNumero(factura.numero());
        e.setPrefijo(factura.prefijo());
        e.setFecha(factura.fecha());
        e.setFechaVencimiento(factura.fechaVencimiento());
        e.setIdentificacionCliente(factura.identificacionCliente());
        e.setNombreCliente(factura.nombreCliente());
        e.setTotal(factura.total());
        e.setSaldo(factura.saldo());
        e.setEstadoPago(factura.estadoPago());
        e.setObservaciones(truncate(factura.observaciones(), 1000));
        e.setFechaSincronizacion(TimeMapper.toLocalDateTimeUtc(factura.fechaSincronizacion()));
        if (factura.operacionId() != null) {
            e.setOperacion(operacionJpaRepository.getReferenceById(factura.operacionId()));
        } else {
            e.setOperacion(null);
        }
        var saved = facturaSiigoJpaRepository.save(e);
        return FacturaSiigoMapper.toDomain(saved);
    }

    @Override
    public Optional<FacturaSiigo> findBySiigoInvoiceId(String siigoInvoiceId) {
        return facturaSiigoJpaRepository.findBySiigoInvoiceId(siigoInvoiceId).map(FacturaSiigoMapper::toDomain);
    }

    @Override
    public List<FacturaSiigo> findAll() {
        return facturaSiigoJpaRepository.findAllFetched().stream().map(FacturaSiigoMapper::toDomain).toList();
    }

    @Override
    public List<FacturaSiigo> findByOperacionIds(Collection<Long> operacionIds) {
        if (operacionIds == null || operacionIds.isEmpty()) {
            return List.of();
        }
        return facturaSiigoJpaRepository.findByOperacionIdInFetched(operacionIds).stream()
                .map(FacturaSiigoMapper::toDomain)
                .toList();
    }

    private static String truncate(String value, int max) {
        if (value == null || value.length() <= max) {
            return value;
        }
        return value.substring(0, max);
    }
}
