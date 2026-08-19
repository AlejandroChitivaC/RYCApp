---
id: architecture-dependencies
title: Dependencias del sistema
module: 01_ARCHITECTURE
layer: architecture
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_modules: [backend, frontend, siigo]
tags: [dependencies]
when_to_update: Cambio en pom.xml, package.json o acoplamientos entre módulos
source_paths:
  - backend/pom.xml
  - frontend/package.json
---

# DEPENDENCIES.md

## Dependencias externas — Backend (`pom.xml`)

| Dependencia | Uso |
|-------------|-----|
| spring-boot-starter-web | REST |
| spring-boot-starter-validation | Bean Validation |
| spring-boot-starter-data-jpa | Persistencia |
| spring-boot-starter-security | Authn/Authz |
| spring-boot-starter-mail | OTP / notificaciones |
| jjwt-* 0.12.5 | JWT HS256 |
| flyway-core / flyway-mysql | Migraciones |
| mysql-connector-j | Driver |
| pdfbox 3.0.3 | Tickets PDF |
| lombok | Boilerplate (optional) |
| spring-boot-starter-test / spring-security-test | Tests (sin clases) |

## Dependencias externas — Frontend (`package.json`)

| Dependencia | Uso |
|-------------|-----|
| react / react-dom | UI |
| react-router-dom | Rutas |
| zustand | Estado |
| axios | HTTP |
| notiflix | Toasts/confirm |
| tailwindcss (+ postcss/autoprefixer) | Estilos |
| vite + @vitejs/plugin-react | Build |
| typescript / eslint* | DX |

## Dependencias entre módulos de negocio

```
Auth ──► Usuario, Rol, CuentaAutenticacion
Usuario ──► Rol
Vehiculo ──► Usuario (conductor)
Operacion ──► Usuario, LineaNegocio, Vehiculo, Material, Proveedor
Ticket ──► Operacion, Usuario
Nomina / Costos* ──► Usuario, TipoCosto (+ Vehiculo en CostoVehiculo)
Siigo ──► (externo; sin FKs de dominio)
```

## Dependencias frontend → backend

Cada `features/*/api.ts` depende de endpoints `/api/**` listados en `06_API/`.

## Runtime externos

| Sistema | Protocolo | Config |
|---------|-----------|--------|
| MySQL | JDBC | `spring.datasource.*` |
| Siigo API | HTTPS RestClient | `app.siigo.*` |
| SMTP | JavaMail | `spring.mail.*` (perfil `local`) |
| Amplify / Vite origins | CORS | `app.cors.allowed-origins` |

## Deuda de acoplamiento

- `AuthService` acoplado a JPA concreto.
- Roles como strings en backend y frontend (duplicación).
- CORS configurado en `SecurityConfig` y también existe `CorsConfig` (posible solapamiento).
