# Architecture Health — RYCApp

**Score:** 87/100

Generated: 2026-07-13
Version: 1.0.0

## Summary metrics

- `modules`: 16
- `services`: 15
- `domain_entities`: 15
- `bounded_contexts`: 6
- `relationships`: 80
- `findings_high`: 0
- `findings_medium`: 1
- `findings_low`: 4

## Findings

### MEDIUM

- **Alto acoplamiento eferente en 'operaciones'**
  - El módulo operaciones depende de 8 destinos (instability=0.89).
  - Rec: Extraer adaptadores / anti-corruption layers y reducir dependencias cruzadas entre contextos.
  - Evidence: ArchitectureModel relationships, bounded contexts

### LOW

- **Dominio anémico (reglas en application)**
  - AIKB documenta dominio anémico sin aggregates ricos ni domain events; la cohesión de negocio vive en Services.
  - Rec: Si la complejidad crece, mover invariantes críticas a domain services / aggregates ricos.
  - Evidence: 01_ARCHITECTURE/ARCHITECTURE.md, 02_DOMAIN/DOMAIN_MODEL.md
- **Auth sin port-in (excepción documentada)**
  - AIKB: AuthController → AuthService → JPA repos (sin UseCase port-in).
  - Rec: Considerar introducir AuthUseCase para alinear Auth con el resto de módulos hexagonales.
  - Evidence: 01_ARCHITECTURE/ARCHITECTURE.md, MODULES.md
- **Shared kernel detectado: Usuario**
  - AIKB declara Usuario/Rol como shared kernel entre contextos (Identity ──shared──► Operations, Costs, Tickets, Catalog).
  - Rec: Documentar el shared kernel formalmente y limitar expansión de campos transversales en Usuario.
  - Evidence: 02_DOMAIN/BOUNDED_CONTEXTS.md
- **Módulo delgado / FE-only: 'dashboard'**
  - Sin controller/service backend en AIKB (posible dashboard o scaffold).
  - Rec: Confirmar si el módulo aporta capacidad real o debe consolidarse en otra feature.
  - Evidence: 11_METADATA/modules.json

## Coupling metrics

| Module | Ca (in) | Ce (out) | Instability |
|--------|---------|----------|-------------|
| operaciones | 1 | 8 | 0.889 |
| lineas-negocio | 5 | 3 | 0.375 |
| materiales | 5 | 3 | 0.375 |
| proveedores | 5 | 3 | 0.375 |
| tipos-costo | 5 | 3 | 0.375 |
| vehiculos | 5 | 3 | 0.375 |
| auth | 6 | 0 | 0.000 |
| usuarios | 6 | 0 | 0.000 |
| roles | 6 | 0 | 0.000 |
| nomina | 0 | 5 | 1.000 |
| costos-administrativos | 0 | 5 | 1.000 |
| costos-vehiculo | 0 | 5 | 1.000 |
| costos-financieros | 0 | 5 | 1.000 |
| tickets | 0 | 1 | 1.000 |
| siigo | 0 | 1 | 1.000 |

