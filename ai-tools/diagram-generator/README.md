# AIKB Architecture Intelligence Engine

Motor de interpretación, visualización y análisis de calidad sobre una AI Engineering Knowledge Base (`ai-brain/`), en **solo lectura**.

## Capacidades

1. **Architecture Engine** — Knowledge Graph → `ArchitectureModel`
2. **Visualization Intelligence Engine** — diagramas C4 empresariales
3. **Architecture Quality Analyzer** — health score + findings + refactoring advice

## Visualization Intelligence (`visualization_engine/`)

- Agrupación por bounded context / capas
- Filtrado de relaciones irrelevantes
- Layout jerárquico con reducción de cruces (barycenter)
- Anotaciones: título, leyenda, versión, fecha, tecnologías, responsabilidades
- Reglas C4: no mezclar niveles (Context / Container / Component / Code)

## Architecture Quality (`architecture_engine/analyzers/`)

| Analyzer | Qué mide |
|----------|----------|
| Coupling | Ca / Ce / inestabilidad entre módulos |
| Cohesion | responsabilidades reales (no el slice hexagonal) |
| Circular | ciclos de dependencia |
| Complexity | entidades/módulos/contextos sobredimensionados |
| Health Score | puntuación 0–100 + findings |

Salidas en `output/reports/`:

- `architecture-health.json`
- `architecture-health.md`
- `refactoring-recommendations.md`
- `coupling-analysis.md`
- `spaghetti-analysis.md`
- `architecture-report.md`

## Instalación

```powershell
cd ai-tools/diagram-generator
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## CLI

```powershell
# Diagramas
python src/main.py --full-architecture
python src/main.py --c4-context
python src/main.py --c4-container
python src/main.py --components
python src/main.py --domain
python src/main.py --database

# Calidad / análisis (solo lectura)
python src/main.py --architecture-health
python src/main.py --analyze-coupling
python src/main.py --analyze-spaghetti
python src/main.py --generate-report
```

`--generate-report` = pack de diagramas + health + coupling + spaghetti + executive summary.

## Restricciones

- No modifica `/ai-brain`
- No modifica código fuente del producto
- No inventa arquitectura: warnings `Información no disponible en AIKB`
- Recomendaciones de refactoring son asesoría documental, no cambios automáticos

## Tests

```powershell
pytest -q
```
