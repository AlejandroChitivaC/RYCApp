package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Proveedor;

import java.util.List;

public interface ProveedorUseCase {
    Proveedor crear(String nombre, String nit, String departamento, String municipio, String descripcion);
    Proveedor editar(Long id, String nombre, String nit, String departamento, String municipio, String descripcion);
    Proveedor cambiarEstado(Long id, String estado);
    List<Proveedor> listar();
    Proveedor obtener(Long id);
}
