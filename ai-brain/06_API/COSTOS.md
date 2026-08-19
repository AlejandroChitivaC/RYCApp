---
id: api-costos
title: Endpoints Costos
module: 06_API
layer: api
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [api-index]
related_modules: [nomina, costos-administrativos, costos-vehiculo, costos-financieros]
tags: [api, costos]
when_to_update: Cambios controllers de costos
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/
---

# Costos

Authz: autenticado (sin PreAuthorize fino). Patrón: POST `/`, GET `/`, GET `/<built-in function id>`.

| Base path | Controller |
|-----------|------------|
| `/api/nominas` | NominaController |
| `/api/costos-administrativos` | CostoAdministrativoController |
| `/api/costos-vehiculo` | CostoVehiculoController |
| `/api/costos-financieros` | CostoFinancieroOtrosGastosController |

**Gap:** sin páginas frontend equivalentes (solo API).
