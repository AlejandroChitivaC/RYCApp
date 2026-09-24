$root = Join-Path $PSScriptRoot "..\backend\src\main\java"
$idNames = @(
    "usuarioId", "usuarioRegistroId", "usuarioDebitadoId", "usuarioCargaId",
    "rolId", "rolAsignarId", "lineaNegocioId", "vehiculoId", "materialId",
    "proveedorId", "tipoCostoId", "conductorId", "operacionId", "ticketId",
    "excluirVehiculoId"
)

$files = Get-ChildItem -Path $root -Recurse -Filter *.java |
    Where-Object {
        $_.FullName -notmatch "persistence\\jpa" -and
        $_.FullName -notmatch "infrastructure\\siigo"
    }

$changed = 0
foreach ($file in $files) {
    $text = [System.IO.File]::ReadAllText($file.FullName)
    $orig = $text

    $text = $text.Replace("Collection<Long> operacionIds", "Collection<String> operacionIds")
    $text = $text.Replace("Map<Long,", "Map<String,")
    $text = $text.Replace("@PathVariable Long id", "@PathVariable String id")
    $text = $text.Replace("findById(Long id)", "findById(String id)")
    $text = $text.Replace("findById(Long ", "findById(String ")
    $text = $text.Replace("editar(Long id", "editar(String id")
    $text = $text.Replace("obtener(Long id", "obtener(String id")
    $text = $text.Replace("cambiarEstado(Long ", "cambiarEstado(String ")
    $text = $text.Replace("confirmar(Long ", "confirmar(String ")
    $text = $text.Replace(
        "activarCuentaRegistrada(Long usuarioId, Long rolAsignarId)",
        "activarCuentaRegistrada(String usuarioId, String rolAsignarId)"
    )
    $text = $text.Replace("listar(Long operacionId)", "listar(String operacionId)")
    $text = $text.Replace("listarAuditoria(Long ticketId)", "listarAuditoria(String ticketId)")
    $text = $text.Replace("obtenerContenidoPdf(Long id, Long usuarioId", "obtenerContenidoPdf(String id, String usuarioId")
    $text = $text.Replace("obtenerPdf(Long id, Long usuarioId", "obtenerPdf(String id, String usuarioId")
    $text = $text.Replace("findByOperacionId(Long operacionId)", "findByOperacionId(String operacionId)")
    $text = $text.Replace("findContenidoPdfById(Long id)", "findContenidoPdfById(String id)")
    $text = $text.Replace("findAuditoriaByTicketId(Long ticketId)", "findAuditoriaByTicketId(String ticketId)")
    $text = $text.Replace("findCorreoCuentaByUsuarioId(Long usuarioId)", "findCorreoCuentaByUsuarioId(String usuarioId)")
    $text = $text.Replace("tieneRolDescripcion(Long usuarioId", "tieneRolDescripcion(String usuarioId")
    $text = $text.Replace("crear(Long rolId", "crear(String rolId")
    $text = $text.Replace("crear(Long usuarioRegistroId", "crear(String usuarioRegistroId")
    $text = $text.Replace("long usuarioId = Long.parseLong(claims.getSubject());", "String usuarioId = claims.getSubject();")
    $text = $text.Replace("public record JwtPrincipal(long usuarioId", "public record JwtPrincipal(String usuarioId")
    $text = $text.Replace("createAccessToken(`r`n            long usuarioId,", "createAccessToken(`r`n            String usuarioId,")
    $text = $text.Replace("        long usuarioId,", "        String usuarioId,")
    $text = $text.Replace("        long id,", "        String id,")

    foreach ($name in $idNames) {
        $text = $text.Replace("Long $name", "String $name")
    }

    $text = [regex]::Replace($text, '(?<![A-Za-z])Long id(?![A-Za-z])', 'String id')
    $text = $text.Replace("String tamanoBytesOriginal", "Long tamanoBytesOriginal")
    $text = [regex]::Replace($text, '@RequestParam\(([^)]*)\) Long (\w+Id)', '@RequestParam($1) String $2')
    $text = $text.Replace("long usuarioId,", "String usuarioId,")
    $text = $text.Replace("long usuarioId)", "String usuarioId)")

    if ($text -ne $orig) {
        [System.IO.File]::WriteAllText($file.FullName, $text)
        $changed++
        Write-Host ("updated " + $file.FullName.Substring($root.Length))
    }
}

Write-Host "done, $changed files"
