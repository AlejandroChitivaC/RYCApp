package com.rycapp.interfaces.rest.dto.vehiculo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VehiculoCreateRequest(
        @NotBlank(message = "La placa es obligatoria.")
        @Size(max = 20, message = "La placa no debe exceder 20 caracteres.")
        String placa,

        @NotBlank(message = "La clase es obligatoria.")
        @Size(max = 60, message = "La clase no debe exceder 60 caracteres.")
        String clase,

        @NotBlank(message = "La marca es obligatoria.")
        @Size(max = 60, message = "La marca no debe exceder 60 caracteres.")
        String marca,

        @NotBlank(message = "El modelo es obligatorio.")
        @Size(max = 60, message = "El modelo no debe exceder 60 caracteres.")
        String modelo,

        @NotNull(message = "El vehículo debe tener un conductor asignado.")
        String conductorId
) {}
