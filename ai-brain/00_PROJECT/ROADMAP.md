---
id: project-roadmap
title: Roadmap (inferido del código)
module: 00_PROJECT
layer: project
status: inferred
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: [project-overview]
related_entities: []
related_modules: [siigo, tickets, auth]
tags: [roadmap, evolution]
when_to_update: Nuevas migraciones Flyway, features UI, o comentarios de etapa en config
source_paths:
  - backend/src/main/resources/db/migration/
  - backend/src/main/resources/application.yml
  - frontend/src/features/
---

# ROADMAP.md

No hay roadmap oficial en el repo. Lo siguiente es una **línea temporal inferida** por migraciones y features presentes.

## Entregado (código existente)

| Fase inferida | Evidencia |
|---------------|-----------|
| Núcleo ER + seeds | `V1__init.sql` — roles, usuario, catálogos, operaciones, costos |
| Auth con cuenta + OTP | `V2__auth_cuenta_otp.sql` + `AuthService` |
| Conductor ↔ vehículo + flujo cuentas | `V3__vehiculo_conductor_flujo_cuentas.sql` |
| Rol Contador | `V4__rol_contador.sql` |
| OTP recuperación | `V5__cuenta_reset_otp.sql` |
| Tickets + contenido + auditoría | `V6__tickets.sql` + feature tickets |
| Portal SPA completo | features auth, dashboard, catálogos, operaciones, tickets, siigo |
| Deploy backend EC2 | workflow GitHub Actions |
| Siigo etapa conexión | comentario `application.yml`: *"solo auth/health en esta etapa"* + endpoint `/consulta` |

## En progreso / parcial

| Ítem | Evidencia |
|------|-----------|
| Siigo más allá de lectura de verificación | Solo `health` + `consulta`; sin sync de facturas/operaciones |
| UI de costos / tipos de costo | API backend existe; frontend sin pages (dashboard solo cuenta) |
| Features clientes / conductores | Directorios vacíos preparados |

## Pendiente de definición funcional

- Priorización de producto.
- Roadmap de facturación Siigo.
- Estrategia de tests y cobertura objetivo.
- CI/CD frontend (Amplify mencionado en comentarios; config no en repo).

## Evolución

Reemplazar este documento por un roadmap de producto cuando exista; hasta entonces, actualizar tras cada migración `Vn__*.sql` o feature nueva en `frontend/src/features/`.
