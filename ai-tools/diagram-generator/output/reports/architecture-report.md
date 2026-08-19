# Architecture Intelligence Report — RYCApp

**Health Score:** 87/100

Generated: 2026-07-13

## Executive summary

- Módulos: 16
- Bounded contexts: 6
- Findings HIGH/MEDIUM/LOW: 0/1/4

## Artifacts

- `architecture-health.json`
- `architecture-health.md`
- `refactoring-recommendations.md`
- `coupling-analysis.md`
- `spaghetti-analysis.md`

## Top recommendations

- [MEDIUM] Alto acoplamiento eferente en 'operaciones': Extraer adaptadores / anti-corruption layers y reducir dependencias cruzadas entre contextos.
- [LOW] Dominio anémico (reglas en application): Si la complejidad crece, mover invariantes críticas a domain services / aggregates ricos.
- [LOW] Auth sin port-in (excepción documentada): Considerar introducir AuthUseCase para alinear Auth con el resto de módulos hexagonales.
- [LOW] Shared kernel detectado: Usuario: Documentar el shared kernel formalmente y limitar expansión de campos transversales en Usuario.
- [LOW] Módulo delgado / FE-only: 'dashboard': Confirmar si el módulo aporta capacidad real o debe consolidarse en otra feature.
- [PATTERN] Considerar Anti-Corruption Layer hacia Siigo y facades por bounded context para reducir acoplamiento cruzado.
