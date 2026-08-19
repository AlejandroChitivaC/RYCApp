# Spaghetti / Structural Risk Analysis — RYCApp

Combina ciclos, acoplamiento alto, baja cohesión y complejidad.

Health score de referencia: **87/100**

## Riesgos

### [MEDIUM] Alto acoplamiento eferente en 'operaciones'

El módulo operaciones depende de 8 destinos (instability=0.89).

**Acción sugerida:** Extraer adaptadores / anti-corruption layers y reducir dependencias cruzadas entre contextos.

