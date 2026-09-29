package com.rycapp.interfaces.rest.dto.operacion;

import jakarta.validation.constraints.NotBlank;

public record AsignarFacturaRequest(
        @NotBlank(message = "Debe seleccionar una factura de Siigo.")
        String facturaId
) {}
