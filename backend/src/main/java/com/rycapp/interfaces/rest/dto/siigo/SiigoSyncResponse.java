package com.rycapp.interfaces.rest.dto.siigo;

public record SiigoSyncResponse(
        boolean ok,
        boolean configured,
        String message,
        int leidas,
        int guardadas,
        int vinculadas,
        int omitidasBorrador
) {}
