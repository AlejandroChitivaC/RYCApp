package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Proveedor;

import java.util.List;

public interface ProveedorUseCase {
    Proveedor crear(String nombre, String nit, String departamento, String municipio, String descripcion);
    Proveedor editar(String id, String nombre, String nit, String departamento, String municipio, String descripcion);
    Proveedor cambiarEstado(String id, String estado);
    List<Proveedor> listar();
    Proveedor obtener(String id);
}
