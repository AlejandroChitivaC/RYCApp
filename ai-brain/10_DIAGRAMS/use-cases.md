---
id: diagram-use-cases
title: Casos de uso UML
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: domain
generated: 2026-07-13
version: "1.0.0"
depends_on: [domain-use-cases]
related_modules: []
tags: [use-cases, plantuml]
---

# Casos de uso (PlantUML)

```plantuml
@startuml
left to right direction
actor Admin
actor Contador
actor Conductor
actor Registrado
rectangle RYCApp {
  Registrado --> (Registrarse)
  Registrado --> (Verificar correo)
  Admin --> (Activar usuario)
  Admin --> (Gestionar catalogos)
  Admin --> (Consultar Siigo)
  Admin --> (Auditar tickets)
  Conductor --> (Cargar ticket)
  Contador --> (Consultar historial)
  Contador --> (Consultar tickets)
  Admin --> (Registrar operacion)
  Conductor --> (Registrar operacion)
}
@enduml
```
