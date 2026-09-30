import { appendFileSync, readFileSync } from 'node:fs'

const jsonPath = process.argv[2] || 'trivy-report.json'
const summaryPath = process.env.GITHUB_STEP_SUMMARY

function escapeCell(value) {
  return String(value ?? '').replaceAll('|', '/').replaceAll('\n', ' ').trim()
}

function escapeAnnotation(value) {
  return String(value ?? '')
    .replaceAll('%', '%25')
    .replaceAll('\r', '%0D')
    .replaceAll('\n', '%0A')
}

function fixedVersion(raw) {
  const versions = String(raw ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return versions.length > 0 ? versions.join(' o ') : 'sin versión publicada'
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
    hallazgos.push({
      archivo: result.Target || 'dependencias',
      paquete: vuln.PkgName || 'dependencia',
      cve: vuln.VulnerabilityID || 'CVE',
      instalada: vuln.InstalledVersion || 'desconocida',
      corregida: fixedVersion(vuln.FixedVersion),
      titulo: vuln.Title || vuln.Description || '',
      url: vuln.PrimaryURL || '',
    })
  }
}

if (hallazgos.length === 0) {
  const ok = 'Sin CVEs CRITICAL que tengan corrección publicada.'
  console.log(ok)
  if (summaryPath) appendFileSync(summaryPath, `## CVEs CRITICAL\n\n${ok}\n`)
  process.exit(0)
}

const porPaquete = new Map()
for (const item of hallazgos) {
  const key = `${item.archivo}\0${item.paquete}`
  if (!porPaquete.has(key)) porPaquete.set(key, [])
  porPaquete.get(key).push(item)
}

const lineas = [
  `CVEs CRITICAL con corrección disponible: ${hallazgos.length} en ${porPaquete.size} dependencia(s).`,
  'Hay que subir cada dependencia a una versión corregida y volver a ejecutar el pipeline.',
  'El job Despliegue AWS espera a que este informe quede en verde.',
  'Si la librería no está declarada en el pom, entra por Spring Boot: sube el parent o fíjala en dependencyManagement.',
  '',
]

const filas = [
  '| Archivo | Dependencia | Instalada | Subir a | CVEs |',
  '|---|---|---|---|---|',
]
const anotaciones = []

for (const grupo of porPaquete.values()) {
  const primero = grupo[0]
  const cves = grupo.map((item) => item.cve).join(', ')
  lineas.push(`${primero.archivo}`)
  lineas.push(`  ${primero.paquete}  ${primero.instalada}  →  ${primero.corregida}`)
  for (const item of grupo) {
    const detalle = [item.cve, item.titulo].filter(Boolean).join(' — ')
    lineas.push(`    ${detalle}`)
    if (item.url) lineas.push(`    ${item.url}`)
    const annotation = [
      `${item.paquete} ${item.instalada} → ${item.corregida}`,
      item.titulo,
      item.url,
    ]
      .filter(Boolean)
      .join('. ')
    anotaciones.push(
      `::error file=${escapeAnnotation(item.archivo)},title=${escapeAnnotation(item.cve)}::${escapeAnnotation(annotation)}`,
    )
  }
  lineas.push('')
  filas.push(
    `| ${escapeCell(primero.archivo)} | ${escapeCell(primero.paquete)} | ${escapeCell(primero.instalada)} | ${escapeCell(primero.corregida)} | ${escapeCell(cves)} |`,
  )
}

console.log(lineas.join('\n'))
for (const anotacion of anotaciones) console.log(anotacion)

if (summaryPath) {
  appendFileSync(
    summaryPath,
    [
      '## CVEs CRITICAL',
      '',
      `**${hallazgos.length}** vulnerabilidad(es) CRITICAL con corrección, en **${porPaquete.size}** dependencia(s).`,
      'Hay que subir cada dependencia y volver a ejecutar el pipeline. El job Despliegue AWS espera a que este informe quede en verde.',
      'Si la librería no está declarada en el pom, entra por Spring Boot: sube el parent o fíjala en `dependencyManagement`.',
      '',
      ...filas,
      '',
    ].join('\n'),
  )
}

process.exit(1)
