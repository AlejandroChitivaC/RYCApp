"""Professional Draw.io / diagrams.net generator via VisualizationEngine."""

from __future__ import annotations

import html
from xml.etree.ElementTree import Element, SubElement, tostring

from architecture_engine.models import ArchitectureModel, ElementKind
from services.layout_service import Position
from visualization_engine.engine import VisualizationEngine
from visualization_engine.models import VisualDocument


class DrawioGenerator:
    """Generate editable, layered diagrams.net XML from VisualDocument."""

    def __init__(
        self,
        model: ArchitectureModel,
        styles: dict | None = None,
        *,
        version: str | None = None,
    ) -> None:
        self.model = model
        self.styles = styles or {}
        self.viz = VisualizationEngine(version=version)
        self._cell_id = 2

    def _next_id(self) -> str:
        current = self._cell_id
        self._cell_id += 1
        return str(current)

    def _esc(self, value: str) -> str:
        return html.escape(value, quote=True)

    def _style_for(self, kind: ElementKind | str) -> str:
        font = self.styles.get("font_family", "Helvetica")
        presets = {
            ElementKind.ACTOR: (
                self.styles.get("module_fill", "#d5e8d4"),
                self.styles.get("module_stroke", "#82b366"),
                "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;",
            ),
            ElementKind.SYSTEM: ("#fff2cc", "#d6b656", "rounded=1;"),
            ElementKind.CONTAINER: (
                self.styles.get("container_fill", "#f5f5f5"),
                self.styles.get("container_stroke", "#666666"),
                "rounded=1;",
            ),
            ElementKind.EXTERNAL_SYSTEM: (
                self.styles.get("integration_fill", "#ffe6cc"),
                self.styles.get("integration_stroke", "#d79b00"),
                "rounded=1;shape=hexagon;perimeter=hexagonPerimeter2;",
            ),
            ElementKind.MODULE: (
                self.styles.get("module_fill", "#d5e8d4"),
                self.styles.get("module_stroke", "#82b366"),
                "rounded=1;",
            ),
            ElementKind.DOMAIN_ENTITY: (
                self.styles.get("entity_fill", "#dae8fc"),
                self.styles.get("entity_stroke", "#6c8ebf"),
                "rounded=0;",
            ),
            ElementKind.DATABASE_ENTITY: (
                "#e1d5e7",
                "#9673a6",
                "shape=partialRectangle;",
            ),
            ElementKind.SERVICE: ("#f8cecc", "#b85450", "rounded=1;"),
            ElementKind.COMPONENT: ("#dae8fc", "#6c8ebf", "rounded=1;"),
        }
        key = kind if isinstance(kind, ElementKind) else ElementKind.COMPONENT
        fill, stroke, extra = presets.get(key, ("#dae8fc", "#6c8ebf", "rounded=1;"))
        return (
            f"{extra}whiteSpace=wrap;html=1;fillColor={fill};"
            f"strokeColor={stroke};fontFamily={font};align=center;verticalAlign=middle;"
        )

    def _edge_style(self) -> str:
        color = self.styles.get("edge_color", "#6c8ebf")
        return (
            "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;"
            f"jettySize=auto;html=1;strokeColor={color};endArrow=block;endFill=1;"
        )

    def _build_mxfile(
        self,
        diagram_name: str,
        root_cells: Element,
        *,
        page_width: float = 1600,
        page_height: float = 1200,
    ) -> str:
        mxfile = Element(
            "mxfile",
            {
                "host": "app.diagrams.net",
                "modified": "2026-07-13T00:00:00.000Z",
                "agent": "AIKB-Visualization-Intelligence-Engine",
                "version": "22.1.0",
                "type": "device",
            },
        )
        diagram = SubElement(
            mxfile,
            "diagram",
            {"id": f"aikb-{diagram_name}", "name": diagram_name},
        )
        model = SubElement(
            diagram,
            "mxGraphModel",
            {
                "dx": "1400",
                "dy": "900",
                "grid": "1",
                "gridSize": "10",
                "guides": "1",
                "tooltips": "1",
                "connect": "1",
                "arrows": "1",
                "fold": "1",
                "page": "1",
                "pageScale": "1",
                "pageWidth": str(int(page_width)),
                "pageHeight": str(int(page_height)),
                "math": "0",
                "shadow": "0",
            },
        )
        root = SubElement(model, "root")
        SubElement(root, "mxCell", {"id": "0"})
        SubElement(root, "mxCell", {"id": "1", "parent": "0"})
        for child in list(root_cells):
            root.append(child)
        return (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            + tostring(mxfile, encoding="unicode")
            + "\n"
        )

    def _label(self, name: str, technology: str | None, responsibility: str | None) -> str:
        parts = [f"<b>{self._esc(name)}</b>"]
        if technology:
            parts.append(f"<i>{self._esc(technology)}</i>")
        if responsibility:
            short = (
                responsibility if len(responsibility) <= 90 else responsibility[:87] + "..."
            )
            parts.append(self._esc(short))
        return "<br/>".join(parts)

    def _add_vertex(
        self,
        parent: Element,
        value: str,
        position: Position,
        kind: ElementKind,
        parent_id: str = "1",
    ) -> str:
        cell_id = self._next_id()
        cell = SubElement(
            parent,
            "mxCell",
            {
                "id": cell_id,
                "value": value,
                "style": self._style_for(kind),
                "vertex": "1",
                "parent": parent_id,
            },
        )
        SubElement(
            cell,
            "mxGeometry",
            {
                "x": f"{position.x:.1f}",
                "y": f"{position.y:.1f}",
                "width": f"{position.width:.1f}",
                "height": f"{position.height:.1f}",
                "as": "geometry",
            },
        )
        return cell_id

    def _add_swimlane(self, parent: Element, title: str, box: Position) -> str:
        cell_id = self._next_id()
        style = (
            "swimlane;fontStyle=1;align=center;startSize=30;horizontal=1;"
            f"fillColor={self.styles.get('container_fill', '#f5f5f5')};"
            f"strokeColor={self.styles.get('container_stroke', '#666666')};"
            "rounded=1;shadow=0;"
        )
        cell = SubElement(
            parent,
            "mxCell",
            {
                "id": cell_id,
                "value": self._esc(title),
                "style": style,
                "vertex": "1",
                "parent": "1",
            },
        )
        SubElement(
            cell,
            "mxGeometry",
            {
                "x": f"{box.x:.1f}",
                "y": f"{box.y:.1f}",
                "width": f"{box.width:.1f}",
                "height": f"{box.height:.1f}",
                "as": "geometry",
            },
        )
        return cell_id

    def _add_edge(
        self,
        parent: Element,
        source_id: str,
        target_id: str,
        label: str = "",
    ) -> str:
        cell_id = self._next_id()
        attrs = {
            "id": cell_id,
            "style": self._edge_style(),
            "edge": "1",
            "parent": "1",
            "source": source_id,
            "target": target_id,
        }
        if label:
            attrs["value"] = self._esc(label)
        cell = SubElement(parent, "mxCell", attrs)
        SubElement(cell, "mxGeometry", {"relative": "1", "as": "geometry"})
        return cell_id

    def _add_note(
        self,
        parent: Element,
        text: str,
        x: float,
        y: float,
        w: float = 320,
    ) -> None:
        note_id = self._next_id()
        style = (
            "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;"
            "darkOpacity=0.05;fillColor=#fff2cc;strokeColor=#d6b656;size=14;"
        )
        cell = SubElement(
            parent,
            "mxCell",
            {
                "id": note_id,
                "value": self._esc(text),
                "style": style,
                "vertex": "1",
                "parent": "1",
            },
        )
        SubElement(
            cell,
            "mxGeometry",
            {
                "x": f"{x:.1f}",
                "y": f"{y:.1f}",
                "width": str(w),
                "height": "80",
                "as": "geometry",
            },
        )

    def _add_title_block(self, parent: Element, document: VisualDocument) -> None:
        ann = document.annotation
        title_html = f"<b>{self._esc(ann.title)}</b>"
        if ann.system_name:
            title_html += f"<br/>{self._esc(ann.system_name)}"
        meta = []
        if ann.version:
            meta.append(f"v{ann.version}")
        meta.append(ann.generated_on)
        if ann.c4_level:
            meta.append(f"C4:{ann.c4_level}")
        title_html += (
            f"<br/><font style='font-size:10px'>{self._esc(' · '.join(meta))}</font>"
        )
        cell_id = self._next_id()
        cell = SubElement(
            parent,
            "mxCell",
            {
                "id": cell_id,
                "value": title_html,
                "style": (
                    "text;html=1;strokeColor=none;fillColor=none;"
                    "align=left;verticalAlign=middle;fontStyle=0;fontSize=16;"
                ),
                "vertex": "1",
                "parent": "1",
            },
        )
        SubElement(
            cell,
            "mxGeometry",
            {"x": "40", "y": "10", "width": "700", "height": "70", "as": "geometry"},
        )

    def _render_visual(self, view: str, diagram_name: str | None = None) -> str:
        self._cell_id = 2
        document = self.viz.compose(self.model, view)
        cells = Element("cells")
        self._add_title_block(cells, document)

        lane_ids: dict[str, str] = {}
        element_group: dict[str, str] = {}
        for group in document.groups:
            for eid in group.element_ids:
                element_group[eid] = group.title
            box = document.group_boxes.get(group.title)
            if box:
                lane_ids[group.title] = self._add_swimlane(cells, group.title, box)

        id_map: dict[str, str] = {}
        for element in document.elements:
            pos = document.positions.get(element.id)
            if pos is None:
                continue
            group_name = element_group.get(element.id)
            parent_id = "1"
            abs_pos = pos
            if (
                group_name
                and group_name in lane_ids
                and group_name in document.group_boxes
            ):
                parent_id = lane_ids[group_name]
                box = document.group_boxes[group_name]
                abs_pos = Position(
                    x=pos.x - box.x,
                    y=pos.y - box.y,
                    width=pos.width,
                    height=pos.height,
                )
            value = self._label(
                element.name,
                element.technology,
                element.responsibility,
            )
            id_map[element.id] = self._add_vertex(
                cells, value, abs_pos, element.kind, parent_id=parent_id
            )

        for rel in document.relationships:
            if rel.source_id in id_map and rel.target_id in id_map:
                self._add_edge(
                    cells,
                    id_map[rel.source_id],
                    id_map[rel.target_id],
                    rel.label or rel.rel_type,
                )

        legend_text = "Leyenda:\n" + "\n".join(
            f"• {item}" for item in document.annotation.legend[:5]
        )
        self._add_note(cells, legend_text, 40, document.canvas_height - 160, w=360)
        if document.annotation.technologies:
            tech_text = "Tecnologías:\n" + "\n".join(
                f"• {t}" for t in document.annotation.technologies[:4]
            )
            self._add_note(cells, tech_text, 420, document.canvas_height - 160, w=360)

        return self._build_mxfile(
            diagram_name or view,
            cells,
            page_width=document.canvas_width,
            page_height=document.canvas_height,
        )

    def architecture(self) -> str:
        return self._render_visual("architecture")

    def c4_context(self) -> str:
        return self._render_visual("c4-context")

    def c4_container(self) -> str:
        return self._render_visual("c4-container")

    def components(self) -> str:
        return self._render_visual("components")

    def domain(self) -> str:
        return self._render_visual("domain")

    def database(self) -> str:
        return self._render_visual("database")

    def generate(self, diagram_type: str) -> str:
        mapping = {
            "architecture": self.architecture,
            "domain": self.domain,
            "database": self.database,
            "components": self.components,
            "c4-context": self.c4_context,
            "c4-container": self.c4_container,
            "dependencies": self.architecture,
            "sequence": self.architecture,
            "full-architecture": self.architecture,
        }
        generator = mapping.get(diagram_type)
        if generator is None:
            raise ValueError(f"Unsupported Draw.io diagram type: {diagram_type}")
        return generator()
