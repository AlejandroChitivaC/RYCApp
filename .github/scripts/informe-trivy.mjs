import { appendFileSync, readFileSync } from 'node:fs'

const jsonPath = process.argv[2] || 'trivy-report.json'
const summaryPath = process.env.GITHUB_STEP_SUMMARY

function escapeCell(value) {
  return String(value ?? '').replaceAll('|', '/').replaceAll('\n', ' ').replaceAll('`', "'").trim()
}

function escapeAnnotation(value) {
  return String(value ?? '')
    .replaceAll('%', '%25')
    .replaceAll('\r', '%0D')
    .replaceAll('\n', '%0A')
}

function versionParts(value) {
  return String(value ?? '')
    .replace(/^[^\d]*/, '')
    .split(/[.\-+]/)
    .filter(Boolean)
}

function versionCorregida(instalada, raw) {
  const versiones = String(raw ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (versiones.length === 0) return 'sin versión publicada'

  const base = versionParts(instalada)
  let elegida = versiones[0]
  let mejor = -1
  for (const version of versiones) {
    const partes = versionParts(version)
    let puntaje = 0
    for (let i = 0; i < Math.min(base.length, partes.length); i++) {
      if (base[i] !== partes[i]) break
      puntaje++
    }
    if (puntaje > mejor) {
      mejor = puntaje
      elegida = version
    }
  }
  return elegida
}

let report
try {
  let raw = readFileSync(jsonPath, 'utf8')
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1)
  report = JSON.parse(raw)
} catch {
  const message = `Trivy no dejó un informe legible en ${jsonPath}.`
  console.error(message)
  if (summaryPath) appendFileSync(summaryPath, `## CVEs CRITICAL\n\n${message}\n`)
  process.exit(1)
}

const hallazgos = []
for (const result of report.Results ?? []) {
  for (const vuln of result.Vulnerabilities ?? []) {
    if (vuln.Severity && vuln.Severity !== 'CRITICAL') continue
    const instalada = vuln.InstalledVersion || 'desconocida'
    hallazgos.push({
      archivo: result.Target || 'dependencias',
      paquete: vuln.PkgName || 'dependencia',
      cve: vuln.VulnerabilityID || 'CVE',
      instalada,
      corregida: versionCorregida(instalada, vuln.FixedVersion),
      titulo: vuln.Title || vuln.Description || '',
      url: vuln.PrimaryURL || '',
    })
  }
}

hallazgos.sort((a, b) =>
  a.archivo.localeCompare(b.archivo) || a.paquete.localeCompare(b.paquete) || a.cve.localeCompare(b.cve),
)

if (hallazgos.length === 0) {
  const ok = 'Sin CVEs CRITICAL que tengan corrección publicada.'
  console.log(ok)
  if (summaryPath) appendFileSync(summaryPath, `## CVEs CRITICAL\n\n${ok}\n`)
  process.exit(0)
}

const paquetes = new Set(hallazgos.map((item) => `${item.archivo}\0${item.paquete}`))
const intro = [
  `**${hallazgos.length}** CVE CRITICAL en **${paquetes.size}** dependencia(s).`,
  'Sube cada fila a la versión corregida y vuelve a ejecutar el pipeline. Despliegue AWS espera a que esta tabla quede en verde.',
  'Si la librería no está en el pom, entra por Spring Boot: sube el parent o fíjala en `dependencyManagement`.',
].join(' ')

const tabla = [
  '| CVE | Dependencia | Versión actual | Versión corregida | Archivo |',
  '|---|---|---|---|---|',
  ...hallazgos.map((item) => {
    const cve = item.url ? `[${escapeCell(item.cve)}](${item.url})` : escapeCell(item.cve)
    return `| ${cve} | \`${escapeCell(item.paquete)}\` | \`${escapeCell(item.instalada)}\` | \`${escapeCell(item.corregida)}\` | \`${escapeCell(item.archivo)}\` |`
  }),
]

const informe = ['## CVEs CRITICAL', '', intro, '', ...tabla, ''].join('\n')
console.log(informe)

for (const item of hallazgos) {
  const annotation = [
    `${item.paquete} ${item.instalada} → ${item.corregida}`,
    item.archivo,
    item.titulo,
  ]
    .filter(Boolean)
    .join('. ')
  console.log(
    `::error file=${escapeAnnotation(item.archivo)},title=${escapeAnnotation(item.cve)}::${escapeAnnotation(annotation)}`,
  )
}

if (summaryPath) appendFileSync(summaryPath, informe)
process.exit(1)
