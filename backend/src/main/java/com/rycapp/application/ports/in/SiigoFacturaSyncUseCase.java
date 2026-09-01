package com.rycapp.application.ports.in;

import com.rycapp.domain.model.FacturaSiigo;

import java.util.List;

public interface SiigoFacturaSyncUseCase {

    SyncResult sincronizar();

    List<FacturaSiigo> listarFacturas();

    record SyncResult(
            boolean ok,
            boolean configured,
            String message,
            int leidas,
            int guardadas,
            int vinculadas,
            int omitidasBorrador
    ) {}
}
