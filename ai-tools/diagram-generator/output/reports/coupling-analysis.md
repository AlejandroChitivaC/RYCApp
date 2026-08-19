# Coupling Analysis — RYCApp

| Module | Ca | Ce | Instability |
|--------|----|----|-------------|
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

## Findings

- **[MEDIUM]** Alto acoplamiento eferente en 'operaciones': El módulo operaciones depende de 8 destinos (instability=0.89).
- **[LOW]** Shared kernel detectado: Usuario: AIKB declara Usuario/Rol como shared kernel entre contextos (Identity ──shared──► Operations, Costs, Tickets, Catalog).
