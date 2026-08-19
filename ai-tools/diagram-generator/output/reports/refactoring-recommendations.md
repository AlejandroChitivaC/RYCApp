# Refactoring Recommendations — RYCApp

> Solo lectura: estas sugerencias **no modifican** código fuente.

Health score de referencia: **87/100**

## Recomendaciones

1. [MEDIUM] Alto acoplamiento eferente en 'operaciones': Extraer adaptadores / anti-corruption layers y reducir dependencias cruzadas entre contextos.
2. [LOW] Dominio anémico (reglas en application): Si la complejidad crece, mover invariantes críticas a domain services / aggregates ricos.
3. [LOW] Auth sin port-in (excepción documentada): Considerar introducir AuthUseCase para alinear Auth con el resto de módulos hexagonales.
4. [LOW] Shared kernel detectado: Usuario: Documentar el shared kernel formalmente y limitar expansión de campos transversales en Usuario.
5. [LOW] Módulo delgado / FE-only: 'dashboard': Confirmar si el módulo aporta capacidad real o debe consolidarse en otra feature.
6. [PATTERN] Considerar Anti-Corruption Layer hacia Siigo y facades por bounded context para reducir acoplamiento cruzado.

## Patrones sugeridos (cuando aplique)

- Extraer servicios / use cases cohesivos
- Separar responsabilidades por bounded context
- Aplicar ports & adapters / Anti-Corruption Layer
- Reducir acoplamiento entre contextos (shared kernel explícito)

