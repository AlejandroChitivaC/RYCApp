---
id: database-dictionary
title: Diccionario de datos (resumen)
module: 05_DATABASE
layer: data
status: active
owner: data
generated: 2026-07-13
version: "1.0.0"
depends_on: [database-physical, domain-entities]
related_modules: []
tags: [database, dictionary]
when_to_update: Cambios de columnas
source_paths:
  - backend/src/main/resources/db/migration/V1__init.sql
  - backend/src/main/resources/db/migration/V6__tickets.sql
---

# DATA_DICTIONARY.md

Resumen de tablas principales (detalle exacto en migraciones SQL — fuente de verdad).

| Tabla | Columnas clave |
|-------|----------------|
| Rol | ID_Rol, Descripcion |
| Usuario | ID_Usuario, ID_Rol, Cedula, Nombre, Apellido, Estado |
| Cuenta_Autenticacion | vínculo Usuario, Correo, Password_Hash, flags OTP/verificación/reset |
| Vehiculo | ID_Vehiculo, Placa, Clase, Marca, Modelo, Estado, ID_Conductor |
| Linea_Negocio | ID_Linea_Negocio, Linea_Negocio, Descripcion, Estado |
| Material | ID_Material, Material, Descripcion |
| Proveedor | ID_Proveedor, Nombre, NIT, Departamento, Municipio, Descripcion |
| Tipo_Costo | ID_Tipo_Costo, Tipo_costo, Flujo, Descripcion, Estado |
| Operaciones_Lineas_Negocio | FKs + fechas + Medio_Pago + Valor + Descripcion |
| Nomina / Costos* | FKs + Valor + Medio_Pago (+ Motivo en vehículo) |
| Ticket | FKs + Numero + Hash + metadata archivo + Fecha_Carga |
| Ticket_Contenido | contenido binario PDF |
| Ticket_Auditoria | accion + usuario + fecha |

Para regeneración automática completa de columnas, parsear `V*.sql` (ver generator).
