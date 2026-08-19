---
id: domain-value-objects
title: Value Objects
module: 02_DOMAIN
layer: domain
status: inferred
owner: domain
generated: 2026-07-13
version: "1.0.0"
depends_on: [domain-entities]
related_entities: []
related_modules: []
tags: [value-objects]
when_to_update: Si se introducen VOs tipados en domain
source_paths:
  - backend/src/main/java/com/rycapp/domain/model/
  - backend/src/main/java/com/rycapp/infrastructure/security/PasswordPolicy.java
---

# VALUE_OBJECTS.md

**No hay value objects tipados** en `domain.model` (no existen clases `Email`, `Placa`, `Nit`, `Money`, etc.).

## Conceptos tratados como VO implícitos (String/Number)

| Concepto | Representación | Validación |
|----------|----------------|------------|
| Cédula | `String` | unicidad DB/servicio |
| Placa | `String` | unicidad |
| NIT | `String` | unicidad |
| Estado | `String` | listas/constantes (`UsuarioEstados`, ACTIVO en maestros) |
| Medio de pago | `String` | **Pendiente de definición funcional** (catálogo cerrado no encontrado) |
| Valor monetario | `BigDecimal` / `DECIMAL(14,2)` | precisión DB |
| Hash SHA-256 | `String` | unicidad ticket |
| Password | `String` → BCrypt | `PasswordPolicy` (≥8, dígito, especial, ≤72) |
| OTP | numérico length 6 | `app.auth.otp-length` |
| Rol descripción | `String` | mapeo a authorities |

Introducir VOs reales requeriría cambio de código + ADR; hoy documentar solo estos implícitos.
