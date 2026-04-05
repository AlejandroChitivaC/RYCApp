package com.rycapp.interfaces.rest.dto.proveedor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProveedorUpdateRequest(
        @NotBlank(message = "Nombre es obligatorio.")
        @Size(max = 160, message = "Nombre no debe exceder 160 caracteres.")
        String nombre,

        @NotBlank(message = "NIT es obligatorio.")
        @Size(max = 30, message = "NIT no debe exceder 30 caracteres.")
        String nit,

        @Size(max = 80, message = "Departamento no debe exceder 80 caracteres.")
        String departamento,

        @Size(max = 80, message = "Municipio no debe exceder 80 caracteres.")
        String municipio,

        @Size(max = 500, message = "Descripcion no debe exceder 500 caracteres.")
        String descripcion
) {}
