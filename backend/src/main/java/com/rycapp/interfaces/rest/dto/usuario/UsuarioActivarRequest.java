package com.rycapp.interfaces.rest.dto.usuario;

import jakarta.validation.constraints.NotNull;

public record UsuarioActivarRequest(
        @NotNull(message = "Debe indicar el rol a asignar (Conductor o Contador).")
        String rolId
) {}
