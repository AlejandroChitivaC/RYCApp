"""Convierte IDs Long -> String en el backend, sin tocar tamaños ni métricas."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1] / "backend" / "src" / "main" / "java"

ID_NAMES = [
    "usuarioId",
    "usuarioRegistroId",
    "usuarioDebitadoId",
    "usuarioCargaId",
    "rolId",
    "rolAsignarId",
    "lineaNegocioId",
    "vehiculoId",
    "materialId",
    "proveedorId",
    "tipoCostoId",
    "conductorId",
    "operacionId",
    "ticketId",
    "excluirVehiculoId",
]

SKIP_DIRS = {"infrastructure/siigo", "infrastructure/pdf", "infrastructure/mail"}


def should_skip(path: Path) -> bool:
    rel = path.relative_to(ROOT).as_posix()
    if "infrastructure/siigo" in rel:
        return True
    if rel.endswith("PdfConversionPort.java"):
        return True
    return False


def convert(text: str) -> str:
    text = text.replace("Collection<Long> operacionIds", "Collection<String> operacionIds")
    text = text.replace("Map<Long,", "Map<String,")
    text = text.replace("@PathVariable Long id", "@PathVariable String id")
    text = text.replace("findById(Long id)", "findById(String id)")
    text = text.replace("findById(Long ", "findById(String ")
    text = text.replace("editar(Long id", "editar(String id")
    text = text.replace("obtener(Long id", "obtener(String id")
    text = text.replace("cambiarEstado(Long ", "cambiarEstado(String ")
    text = text.replace("confirmar(Long ", "confirmar(String ")
    text = text.replace("activarCuentaRegistrada(Long usuarioId, Long rolAsignarId)",
                        "activarCuentaRegistrada(String usuarioId, String rolAsignarId)")
    text = text.replace("listar(Long operacionId)", "listar(String operacionId)")
    text = text.replace("listarAuditoria(Long ticketId)", "listarAuditoria(String ticketId)")
    text = text.replace("obtenerContenidoPdf(Long id, Long usuarioId", "obtenerContenidoPdf(String id, String usuarioId")
    text = text.replace("obtenerPdf(Long id, Long usuarioId", "obtenerPdf(String id, String usuarioId")
    text = text.replace("findByOperacionId(Long operacionId)", "findByOperacionId(String operacionId)")
    text = text.replace("existsByHashSha256", "existsByHashSha256")
    text = text.replace("findContenidoPdfById(Long id)", "findContenidoPdfById(String id)")
    text = text.replace("findAuditoriaByTicketId(Long ticketId)", "findAuditoriaByTicketId(String ticketId)")
    text = text.replace("findCorreoCuentaByUsuarioId(Long usuarioId)", "findCorreoCuentaByUsuarioId(String usuarioId)")
    text = text.replace("tieneRolDescripcion(Long usuarioId", "tieneRolDescripcion(String usuarioId")
    text = text.replace("crear(Long rolId", "crear(String rolId")
    text = text.replace("public Usuario crear(Long rolId", "public Usuario crear(String rolId")
    text = text.replace("crear(Long usuarioRegistroId", "crear(String usuarioRegistroId")
    text = text.replace("cargar(\n            Long usuarioCargaId,\n            Long operacionId,",
                        "cargar(\n            String usuarioCargaId,\n            String operacionId,")

    # record / field declarations: Long id (not tamano)
    text = re.sub(r"(?<!tamanoBytesOriginal,\n        )Long id,", "String id,")
    text = re.sub(r"\bLong id\b(?![\w])", "String id", text)

    # undo tamanoBytes if accidentally changed — it is Long tamanoBytesOriginal
    text = text.replace("String tamanoBytesOriginal", "Long tamanoBytesOriginal")

    for name in ID_NAMES:
        text = re.sub(rf"\bLong {name}\b", f"String {name}", text)

    # JWT / login
    text = text.replace("long usuarioId", "String usuarioId")
    text = text.replace("public record JwtPrincipal(long usuarioId", "public record JwtPrincipal(String usuarioId")
    text = text.replace("public record AuthUserSummary(\n        long id,", "public record AuthUserSummary(\n        String id,")
    text = text.replace("        long usuarioId,", "        String usuarioId,")
    text = text.replace("createAccessToken(\n            long usuarioId,", "createAccessToken(\n            String usuarioId,")
    text = text.replace("long usuarioId = Long.parseLong(claims.getSubject());",
                        "String usuarioId = claims.getSubject();")

    # Request params
    text = re.sub(r'@RequestParam\(([^)]*)\) Long (\w+Id)', r'@RequestParam(\1) String \2', text)

    # Use case crear signatures that start with Long
    text = text.replace("crear(..., Long conductorId)", "crear(..., String conductorId)")

    return text


def main():
    changed = 0
    for path in ROOT.rglob("*.java"):
        if should_skip(path):
            continue
        # skip persistence jpa — will be deleted
        if "persistence/jpa" in path.as_posix():
            continue
        original = path.read_text(encoding="utf-8")
        updated = convert(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed += 1
            print(f"updated {path.relative_to(ROOT)}")
    print(f"done, {changed} files")


if __name__ == "__main__":
    main()
