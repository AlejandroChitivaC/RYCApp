$root = Join-Path $PSScriptRoot "..\frontend\src"
$files = Get-ChildItem -Path $root -Recurse -Include *.ts,*.tsx

$changed = 0
foreach ($file in $files) {
    $text = [System.IO.File]::ReadAllText($file.FullName)
    $orig = $text
    $rel = $file.FullName.Substring($root.Length)

    # Siigo document/user ids stay numeric (external API)
    $protectSiigo = $rel -match "siigo\\types.ts"

    if (-not $protectSiigo) {
        $text = $text.Replace("id: number", "id: string")
    } else {
        $text = $text.Replace("export type SiigoFactura = {`r`n  id: number", "export type SiigoFactura = {`r`n  id: string")
        $text = $text.Replace("  operacionId: number | null", "  operacionId: string | null")
    }

    $idFields = @(
        "usuarioRegistroId", "usuarioDebitadoId", "usuarioCargaId", "usuarioId",
        "rolId", "lineaNegocioId", "vehiculoId", "materialId", "proveedorId",
        "tipoCostoId", "conductorId", "operacionId", "ticketId"
    )
    foreach ($name in $idFields) {
        $text = $text.Replace("${name}: number | null", "${name}: string | null")
        $text = $text.Replace("${name}: number", "${name}: string")
        $text = $text.Replace("${name}?: number", "${name}?: string")
    }

    $text = $text.Replace("Map<number, string>", "Map<string, string>")
    $text = $text.Replace("(id: number)", "(id: string)")
    $text = $text.Replace("(id: number,", "(id: string,")
    $text = $text.Replace("ticketId: number | null", "ticketId: string | null")
    $text = $text.Replace("ticketId: number", "ticketId: string")

    if ($text -ne $orig) {
        [System.IO.File]::WriteAllText($file.FullName, $text)
        $changed++
        Write-Host "updated $rel"
    }
}
Write-Host "done, $changed files"
