import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const reportsDir = join(root, 'security-reports')
const policyPath = join(root, '.github', 'security', 'politica.json')

function readText(path) {
  let raw = readFileSync(path, 'utf8')
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1)
  return raw
}

function readJson(path) {
  return JSON.parse(readText(path))
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path, acc)
    else acc.push(path)
  }
  return acc
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function mdCell(value) {
  return String(value ?? '').replaceAll('|', '/').replaceAll('\n', ' ').replaceAll('`', "'").trim()
}

function ann(value) {
  return String(value ?? '').replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A')
}

function asArray(value) {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

function upper(value) {
  return String(value ?? '').trim().toUpperCase()
}

function includesSeverity(list, value) {
  return (list ?? []).map(upper).includes(upper(value))
}

function finding(partial) {
  return {
    herramienta: partial.herramienta,
    regla: partial.regla || 'hallazgo',
    severidad: upper(partial.severidad || 'INFO'),
    bloquea: Boolean(partial.bloquea),
    titulo: String(partial.titulo || '').replaceAll('\n', ' ').trim(),
    detalle: String(partial.detalle || '').replaceAll('\n', ' ').trim(),
    archivo: String(partial.archivo || '').replaceAll('\\', '/'),
    linea: Number(partial.linea) > 0 ? Number(partial.linea) : 1,
  }
}

function toolFailure(herramienta, detalle) {
  return finding({
    herramienta,
    regla: 'informe-ausente',
    severidad: 'ERROR',
    bloquea: true,
    titulo: `${herramienta} no dejó un informe utilizable`,
    detalle,
    archivo: '.github/workflows/ci.yml',
  })
}

function parseTrivy(path, origen, policy) {
  const out = []
  let doc
  try {
    doc = readJson(path)
  } catch (error) {
    return [toolFailure(`Trivy ${origen}`, error.message)]
  }
  const vulnSev = policy.trivy.vulnerabilidades.severidades
  const soloFix = policy.trivy.vulnerabilidades.soloConCorreccion
  const misSev = policy.trivy.misconfiguracion.severidades
  for (const result of doc.Results ?? []) {
    const target = result.Target || origen
    for (const vuln of result.Vulnerabilities ?? []) {
      const sev = upper(vuln.Severity)
      if (!['CRITICAL', 'HIGH', 'MEDIUM'].includes(sev)) continue
      const fixed = String(vuln.FixedVersion || '').trim()
      const bloquea = includesSeverity(vulnSev, sev) && (!soloFix || fixed.length > 0)
      out.push(finding({
        herramienta: `Trivy ${origen}`,
        regla: vuln.VulnerabilityID || 'CVE',
        severidad: sev,
        bloquea,
        titulo: `${vuln.PkgName || 'dependencia'} ${vuln.InstalledVersion || ''}`.trim(),
        detalle: [
          vuln.Title || vuln.Description || '',
          fixed ? `corrección ${fixed}` : 'sin versión corregida publicada',
          vuln.PrimaryURL || '',
        ].filter(Boolean).join('. '),
        archivo: target,
      }))
    }
    for (const secret of result.Secrets ?? []) {
      const sev = upper(secret.Severity || 'HIGH')
      out.push(finding({
        herramienta: `Trivy ${origen}`,
        regla: secret.RuleID || 'secreto',
        severidad: sev,
        bloquea: policy.trivy.secretos.bloquear,
        titulo: secret.Title || 'Posible secreto',
        detalle: secret.Category || '',
        archivo: target,
        linea: secret.StartLine,
      }))
    }
    for (const mis of result.Misconfigurations ?? []) {
      const sev = upper(mis.Severity)
      if (!['CRITICAL', 'HIGH', 'MEDIUM'].includes(sev)) continue
      out.push(finding({
        herramienta: `Trivy ${origen}`,
        regla: mis.ID || mis.AVDID || 'misconfig',
        severidad: sev,
        bloquea: includesSeverity(misSev, sev),
        titulo: mis.Title || mis.Message || 'Mala configuración',
        detalle: mis.Resolution || mis.Message || '',
        archivo: target,
        linea: mis.CauseMetadata?.StartLine,
      }))
    }
    if (!policy.trivy.licencias.bloquear) {
      for (const license of result.Licenses ?? []) {
        const sev = upper(license.Severity)
        if (!['CRITICAL', 'HIGH'].includes(sev)) continue
        out.push(finding({
          herramienta: `Trivy ${origen}`,
          regla: license.Name || 'licencia',
          severidad: sev,
          bloquea: false,
          titulo: `${license.PkgName || 'paquete'} licencia ${license.Name || ''}`,
          detalle: 'La política informa licencias restrictivas y no bloquea el despliegue por ellas.',
          archivo: target,
        }))
      }
    }
  }
  return out
}

function parseNpm(path, origen, policy, soloInforme) {
  let doc
  try {
    doc = readJson(path)
  } catch (error) {
    return soloInforme ? [] : [toolFailure(`npm audit ${origen}`, error.message)]
  }
  if (doc.error) {
    return [toolFailure(`npm audit ${origen}`, doc.error.summary || doc.error.message || 'npm audit falló')]
  }
  const out = []
  const vulns = doc.vulnerabilities ?? {}
  for (const vuln of Object.values(vulns)) {
    const sev = upper(vuln.severity)
    if (!['CRITICAL', 'HIGH', 'MODERATE', 'MEDIUM'].includes(sev)) continue
    const fix = vuln.fixAvailable
    const tieneCorreccion = fix !== false && fix != null
    const via = asArray(vuln.via)
      .map((item) => (typeof item === 'string' ? item : item.title || item.name || ''))
      .filter(Boolean)
      .slice(0, 3)
      .join('; ')
    const normalized = sev === 'MODERATE' ? 'MEDIUM' : sev
    const ignorado = (policy.npmAudit.ignorar ?? []).find((item) => item.paquete === vuln.name)
    const bloquea = !soloInforme
      && !ignorado
      && includesSeverity(policy.npmAudit.severidades, vuln.severity)
      && (!policy.npmAudit.soloConCorreccion || tieneCorreccion)
    out.push(finding({
      herramienta: `npm audit ${origen}`,
      regla: vuln.name || 'npm',
      severidad: normalized,
      bloquea,
      titulo: `${vuln.name} ${vuln.range || ''}`.trim(),
      detalle: [
        via,
        tieneCorreccion ? 'hay corrección en el árbol de npm' : 'sin corrección publicada',
        ignorado?.motivo || '',
      ].filter(Boolean).join('. '),
      archivo: origen.startsWith('infra') ? 'infra/package-lock.json' : 'frontend/package-lock.json',
    }))
  }
  return out
}

function cvssScore(vuln) {
  const numeric = vuln?.cvssv4?.baseScore ?? vuln?.cvssv3?.baseScore ?? vuln?.cvssv2?.score
  if (typeof numeric === 'number') return numeric
  const sev = upper(vuln?.severity)
  if (sev === 'CRITICAL') return 9.5
  if (sev === 'HIGH') return 8
  if (sev === 'MEDIUM') return 5
  if (sev === 'LOW') return 2
  return 0
}

function parseDependencyCheck(path, policy) {
  let doc
  try {
    doc = readJson(path)
  } catch (error) {
    return [toolFailure('OWASP Dependency-Check', error.message)]
  }
  const out = []
  const minimo = Number(policy.dependencyCheck.cvssMinimo)
  for (const dep of doc.dependencies ?? []) {
    for (const vuln of dep.vulnerabilities ?? []) {
      if (vuln.suppressed) continue
      const score = cvssScore(vuln)
      const sev = upper(vuln.severity || (score >= 9 ? 'CRITICAL' : score >= 7 ? 'HIGH' : 'MEDIUM'))
      if (score < 4 && !['CRITICAL', 'HIGH', 'MEDIUM'].includes(sev)) continue
      out.push(finding({
        herramienta: 'OWASP Dependency-Check',
        regla: vuln.name || 'CVE',
        severidad: sev,
        bloquea: score >= minimo,
        titulo: dep.fileName || dep.packages?.[0]?.id || 'dependencia Java',
        detalle: `CVSS ${score}. ${(vuln.description || '').slice(0, 280)}`,
        archivo: 'backend/pom.xml',
      }))
    }
  }
  return out
}

function parseSemgrep(path, policy) {
  let doc
  try {
    doc = readJson(path)
  } catch (error) {
    return [toolFailure('Semgrep', error.message)]
  }
  if (doc.errors?.length) {
    return [toolFailure('Semgrep', doc.errors.map((item) => item.message || item.type).join('; '))]
  }
  const out = []
  for (const result of doc.results ?? []) {
    const sev = upper(result.extra?.severity || 'INFO')
    out.push(finding({
      herramienta: 'Semgrep',
      regla: result.check_id || 'semgrep',
      severidad: sev,
      bloquea: includesSeverity(policy.semgrep.severidades, sev),
      titulo: result.extra?.message || result.check_id || 'Hallazgo SAST',
      detalle: result.extra?.metadata?.cwe?.join?.(', ') || '',
      archivo: result.path,
      linea: result.start?.line,
    }))
  }
  return out
}

function parseGitleaks(path, policy) {
  let doc
  try {
    doc = readJson(path)
  } catch (error) {
    return [toolFailure('Gitleaks', error.message)]
  }
  const leaks = Array.isArray(doc) ? doc : doc.findings ?? []
  return leaks.map((leak) => finding({
    herramienta: 'Gitleaks',
    regla: leak.RuleID || leak.ruleID || 'secreto',
    severidad: 'HIGH',
    bloquea: policy.gitleaks.bloquear,
    titulo: leak.Description || leak.description || 'Posible secreto en el repositorio',
    detalle: 'El valor quedó redactado en el informe.',
    archivo: leak.File || leak.file,
    linea: leak.StartLine || leak.startLine,
  }))
}

function parseSpotbugs(path, policy) {
  let xml
  try {
    xml = readText(path)
  } catch (error) {
    return [toolFailure('SpotBugs', error.message)]
  }
  const out = []
  const re = /<BugInstance\b([^>]*)>([\s\S]*?)<\/BugInstance>/g
  let match
  while ((match = re.exec(xml))) {
    const attrs = match[1]
    const body = match[2]
    const type = /type="([^"]*)"/.exec(attrs)?.[1] || 'SpotBugs'
    const priority = Number(/priority="([^"]*)"/.exec(attrs)?.[1] || 3)
    const message = /<LongMessage>([\s\S]*?)<\/LongMessage>/.exec(body)?.[1]
      || /<ShortMessage>([\s\S]*?)<\/ShortMessage>/.exec(body)?.[1]
      || type
    const source = /sourcepath="([^"]*)"/.exec(body)?.[1] || ''
    const line = Number(/<SourceLine\b[^>]*\bstart="(\d+)"/.exec(body)?.[1] || 1)
    const sev = priority <= 1 ? 'HIGH' : priority === 2 ? 'MEDIUM' : 'LOW'
    out.push(finding({
      herramienta: 'SpotBugs',
      regla: type,
      severidad: sev,
      bloquea: priority <= policy.spotbugs.bloquearPrioridadHasta,
      titulo: message.replaceAll('\n', ' ').trim(),
      detalle: `prioridad SpotBugs ${priority} (1 es la más grave)`,
      archivo: source ? `backend/src/main/java/${source}` : 'backend/pom.xml',
      linea: line,
    }))
  }
  return out
}

function checkovDocuments(path) {
  if (!existsSync(path)) return []
  if (statSync(path).isDirectory()) {
    return walk(path).filter((file) => file.endsWith('.json'))
  }
  return [path]
}

function parseCheckov(path, policy) {
  const files = checkovDocuments(path)
  if (files.length === 0) return [toolFailure('Checkov', `${path} no existe`)]
  const out = []
  for (const file of files) {
    let doc
    try {
      doc = readJson(file)
    } catch (error) {
      return [toolFailure('Checkov', error.message)]
    }
    const docs = Array.isArray(doc) ? doc : [doc]
    for (const item of docs) {
      if (item?.results?.skipped === true && item.motivo) continue
      const failed = item?.results?.failed_checks ?? item?.failed_checks ?? []
      for (const check of failed) {
        const sev = upper(check.severity || '')
        const ids = policy.checkov.idsBloqueantes ?? []
        out.push(finding({
          herramienta: 'Checkov',
          regla: check.check_id || 'CKV',
          severidad: sev || 'MEDIUM',
          bloquea: ids.includes(check.check_id) || includesSeverity(policy.checkov.severidades, sev),
          titulo: check.check_name || check.check_id || 'Checkov',
          detalle: check.resource || '',
          archivo: String(check.file_path || 'infra/cdk.out/RycAppStack.template.json').replace(/^\//, ''),
          linea: check.file_line_range?.[0],
        }))
      }
    }
  }
  return out
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        field += char
      }
      continue
    }
    if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((item) => item.some((cell) => cell.trim()))
}

function parseNagReports(policy) {
  const out = []
  const files = [
    ...walk(reportsDir),
    ...walk(join(root, 'infra', 'cdk.out')),
  ].filter((file) => file.includes('NagReport'))
  const jsonFiles = files.filter((file) => file.endsWith('.json'))
  const csvFiles = files.filter((file) => file.endsWith('.csv'))
  const seen = new Set()
  const pushRow = (row) => {
    const key = `${row.ruleId}|${row.resourceId}|${row.compliance}`
    if (seen.has(key)) return
    seen.add(key)
    if (row.compliance === 'Suppressed' || row.compliance === 'Compliant' || row.compliance === 'N/A') return
    const level = row.ruleLevel === 'Warning' ? 'MEDIUM' : 'HIGH'
    out.push(finding({
      herramienta: 'cdk-nag',
      regla: row.ruleId,
      severidad: level,
      bloquea: row.compliance === 'Non-Compliant' && (policy.cdkNag.niveles ?? []).includes(row.ruleLevel),
      titulo: row.ruleInfo || row.ruleId,
      detalle: row.resourceId,
      archivo: 'infra/bin/rycapp.ts',
    }))
  }
  if (jsonFiles.length > 0) {
    for (const file of jsonFiles) {
      try {
        const doc = readJson(file)
        for (const line of doc.lines ?? []) pushRow(line)
      } catch (error) {
        out.push(toolFailure('cdk-nag', error.message))
      }
    }
    return out
  }
  for (const file of csvFiles) {
    const rows = parseCsv(readText(file))
    const header = rows.shift() ?? []
    const index = Object.fromEntries(header.map((name, i) => [name.trim(), i]))
    for (const row of rows) {
      pushRow({
        ruleId: row[index['Rule ID']],
        resourceId: row[index['Resource ID']],
        compliance: row[index.Compliance],
        ruleLevel: row[index['Rule Level']],
        ruleInfo: row[index['Rule Info']],
      })
    }
  }
  return out
}

function parseSynth(nagFindings) {
  const exitPath = join(reportsDir, 'cdk-synth.exit')
  const logPath = join(reportsDir, 'cdk-synth.log')
  if (!existsSync(exitPath) || !existsSync(logPath)) return []
  const code = Number(readText(exitPath).trim())
  if (!Number.isFinite(code)) return [toolFailure('cdk synth', 'El código de salida no es numérico.')]
  const nagReport = [...walk(reportsDir), ...walk(join(root, 'infra', 'cdk.out'))]
    .some((file) => file.includes('NagReport'))
  if (code === 0 && !nagReport) {
    return [finding({
      herramienta: 'cdk-nag',
      regla: 'informe-ausente',
      severidad: 'ERROR',
      bloquea: true,
      titulo: 'cdk synth terminó sin el informe de cdk-nag',
      detalle: 'AwsSolutionsChecks no escribió AwsSolutions-RycAppStack-NagReport.',
      archivo: 'infra/bin/rycapp.ts',
    })]
  }
  const nagErrors = nagFindings.filter((item) => item.bloquea).length
  if (code !== 0 && nagErrors === 0) {
    const tail = readText(logPath).split('\n').slice(-25).join(' ').slice(0, 500)
    return [finding({
      herramienta: 'cdk synth',
      regla: 'synth-fallido',
      severidad: 'ERROR',
      bloquea: true,
      titulo: `cdk synth terminó con código ${code}`,
      detalle: tail,
      archivo: 'infra/bin/rycapp.ts',
    })]
  }
  return []
}

function stringLeaves(value, acc = []) {
  if (typeof value === 'string') acc.push(value)
  else if (Array.isArray(value)) value.forEach((item) => stringLeaves(item, acc))
  return acc
}

function collectStatements(node, acc) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    node.forEach((item) => collectStatements(item, acc))
    return
  }
  if (node.Effect || node.Action || node.NotAction) {
    acc.push(node)
    return
  }
  Object.values(node).forEach((value) => collectStatements(value, acc))
}

function parseIamTemplates(policy) {
  const out = []
  const templates = walk(join(root, 'infra', 'cdk.out')).filter((file) => file.endsWith('.template.json'))
  if (templates.length === 0) return out
  for (const file of templates) {
    let doc
    try {
      doc = readJson(file)
    } catch {
      continue
    }
    const statements = []
    for (const resource of Object.values(doc.Resources ?? {})) {
      const props = resource?.Properties ?? {}
      collectStatements(props.PolicyDocument, statements)
      for (const policyDoc of asArray(props.Policies)) collectStatements(policyDoc?.PolicyDocument, statements)
    }
    for (const statement of statements) {
      if (statement.Effect && statement.Effect !== 'Allow') continue
      const actions = stringLeaves(statement.Action)
      const resources = stringLeaves(statement.Resource)
      const resourceStar = resources.includes('*')
      const actionStar = actions.includes('*')
      const iamPeligroso = actions.some((action) =>
        action === 'iam:*'
        || action.startsWith('iam:Pass')
        || action.startsWith('iam:Create')
        || action.startsWith('iam:Attach')
        || action.startsWith('iam:Put')
        || action.startsWith('iam:Update')
        || action.startsWith('iam:Delete'))
      const datosPeligrosos = actions.some((action) => ['s3:*', 'dynamodb:*', 'kms:*'].includes(action))
      let bloquea = false
      let regla = ''
      if (policy.iamPlantilla.bloquearAccionYRecursoAsterisco && actionStar && resourceStar) {
        bloquea = true
        regla = 'iam-action-resource-star'
      } else if (policy.iamPlantilla.bloquearIamSobreRecursoAsterisco && iamPeligroso && resourceStar) {
        bloquea = true
        regla = 'iam-admin-resource-star'
      } else if (resourceStar && datosPeligrosos) {
        bloquea = true
        regla = 'datos-resource-star'
      }
      if (!resourceStar) continue
      out.push(finding({
        herramienta: 'Plantilla IAM',
        regla: bloquea ? regla : 'recurso-asterisco',
        severidad: bloquea ? 'CRITICAL' : 'MEDIUM',
        bloquea,
        titulo: `${actions.slice(0, 4).join(', ')} sobre ${resources.slice(0, 3).join(', ')}`,
        detalle: bloquea
          ? 'La compuerta rechaza Action * o permisos IAM/datos sobre Resource *.'
          : 'Resource * sin una acción de administración. CloudFront CreateInvalidation no admite un ARN más estrecho.',
        archivo: relative(root, file).replaceAll('\\', '/'),
      }))
    }
  }
  return out
}

function missingReports(policy) {
  const missing = []
  for (const name of policy.informesObligatorios ?? []) {
    if (!existsSync(join(reportsDir, name))) missing.push(name)
  }
  const synthOk = existsSync(join(reportsDir, 'cdk-synth.exit'))
    && readText(join(reportsDir, 'cdk-synth.exit')).trim() === '0'
  if (synthOk) {
    for (const name of policy.informesObligatoriosSiSynthOk ?? []) {
      if (!existsSync(join(reportsDir, name))) missing.push(name)
    }
  }
  return missing.map((name) => toolFailure(name, `No está ${name}. Sin ese informe el despliegue queda cerrado.`))
}

function sarifLevel(item) {
  if (item.bloquea || ['CRITICAL', 'HIGH', 'ERROR'].includes(item.severidad)) return 'error'
  if (['MEDIUM', 'WARNING'].includes(item.severidad)) return 'warning'
  return 'note'
}

function ruleKey(item) {
  return `${item.herramienta} ${item.regla}`.replace(/[^A-Za-z0-9.+_-]+/g, '-')
}

function buildSarif(items) {
  const rules = new Map()
  for (const item of items) {
    const id = ruleKey(item)
    if (!rules.has(id)) {
      rules.set(id, {
        id,
        shortDescription: { text: item.regla.slice(0, 120) },
        fullDescription: { text: item.titulo.slice(0, 400) || item.regla },
        defaultConfiguration: { level: sarifLevel(item) },
        properties: { tags: [item.herramienta], 'security-severity': item.bloquea ? '8.0' : '3.0' },
      })
    }
  }
  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'RYCApp Seguridad',
            version: '1.0.0',
            informationUri: 'https://github.com/aquasecurity/trivy',
            rules: [...rules.values()],
          },
        },
        automationDetails: { id: 'rycapp-seguridad/' },
        results: items.slice(0, 2000).map((item) => ({
          ruleId: ruleKey(item),
          level: sarifLevel(item),
          message: { text: `${item.herramienta}: ${item.titulo} ${item.detalle}`.trim().slice(0, 800) },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: item.archivo || '.github/security/politica.json' },
                region: { startLine: item.linea || 1 },
              },
            },
          ],
        })),
      },
    ],
  }
}

function buildHtml(policy, items, gate) {
  const bloqueos = items.filter((item) => item.bloquea)
  const avisos = items.filter((item) => !item.bloquea)
  const tools = [...new Set(items.map((item) => item.herramienta))]
  const rows = (list) => list.slice(0, 300).map((item) => `<tr>
    <td>${esc(item.herramienta)}</td>
    <td><span class="sev ${esc(item.severidad)}">${esc(item.severidad)}</span></td>
    <td><code>${esc(item.regla)}</code></td>
    <td>${esc(item.titulo)}</td>
    <td><code>${esc(item.archivo)}:${item.linea}</code></td>
  </tr>`).join('')
  const extra = (list) => list.length > 300 ? `<p>Hay ${list.length - 300} filas más en resumen.json.</p>` : ''
  const riesgos = (policy.riesgosAceptados ?? []).map((item) => `<li><strong>${esc(item.id)}.</strong> ${esc(item.motivo)}</li>`).join('')
  const archivos = walk(reportsDir)
    .map((file) => relative(reportsDir, file).replaceAll('\\', '/'))
    .filter((name) => name !== 'index.html')
    .sort()
    .map((name) => `<li><a href="${esc(name)}">${esc(name)}</a></li>`)
    .join('')
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Informe de seguridad RYCApp</title>
  <style>
    body { margin: 0; font-family: Segoe UI, sans-serif; background: #f4f6f8; color: #1c2430; }
    header { background: #102033; color: #fff; padding: 28px 32px; }
    header p { margin: 8px 0 0; color: #c5d0dc; }
    main { padding: 24px 32px 48px; max-width: 1200px; }
    .banner { padding: 16px 18px; border-radius: 10px; font-weight: 700; margin-bottom: 18px; }
    .ok { background: #e5f6ec; color: #0d6b3c; }
    .bad { background: #fde8e8; color: #9d1c1c; }
    .cards { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }
    .card { background: #fff; border-radius: 10px; padding: 14px 16px; min-width: 140px; box-shadow: 0 1px 2px rgba(0,0,0,.06); }
    .card b { display: block; font-size: 28px; }
    section { background: #fff; border-radius: 10px; padding: 16px 18px; margin: 14px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e6ebf0; vertical-align: top; }
    th { font-size: 12px; letter-spacing: .04em; text-transform: uppercase; color: #5c6b7a; }
    code { font-size: 12px; }
    .sev { border-radius: 999px; padding: 2px 8px; font-size: 12px; font-weight: 700; }
    .CRITICAL, .HIGH, .ERROR { background: #fde8e8; color: #9d1c1c; }
    .MEDIUM, .WARNING { background: #fff4d6; color: #8a5a00; }
    .LOW, .INFO, .NOTE { background: #e7eef8; color: #1d4e89; }
    a { color: #0b57d0; }
  </style>
</head>
<body>
  <header>
    <h1>Análisis de seguridad RYCApp</h1>
    <p>${esc(gate.generadoEn)} · ${esc(gate.commit || 'sin commit')} · ${esc(gate.ref || '')}</p>
  </header>
  <main>
    <div class="banner ${gate.permitirDespliegue ? 'ok' : 'bad'}">
      ${gate.permitirDespliegue ? 'Compuerta abierta. El despliegue a AWS puede continuar.' : 'Compuerta cerrada. El despliegue a AWS no se ejecuta.'}
    </div>
    <div class="cards">
      <div class="card"><b>${bloqueos.length}</b>bloqueos</div>
      <div class="card"><b>${avisos.length}</b>avisos</div>
      <div class="card"><b>${tools.length}</b>herramientas con hallazgos</div>
    </div>
    <section>
      <h2>Qué bloquea el despliegue</h2>
      <p>${esc(policy.descripcion)}</p>
      <ul>
        <li>Trivy: vulnerabilidades ${esc((policy.trivy.vulnerabilidades.severidades || []).join(', '))} con corrección publicada, secretos, y mala configuración ${esc((policy.trivy.misconfiguracion.severidades || []).join(', '))}.</li>
        <li>npm audit de dependencias de producción: ${esc((policy.npmAudit.severidades || []).join(', '))} si existe corrección.</li>
        <li>OWASP Dependency-Check: CVSS igual o mayor que ${esc(policy.dependencyCheck.cvssMinimo)}.</li>
        <li>Semgrep: severidad ${esc((policy.semgrep.severidades || []).join(', '))}.</li>
        <li>Gitleaks: cualquier secreto fuera del allowlist.</li>
        <li>SpotBugs + Find Security Bugs: prioridad 1 a ${esc(policy.spotbugs.bloquearPrioridadHasta)}.</li>
        <li>cdk-nag AwsSolutions: nivel ${esc((policy.cdkNag.niveles || []).join(', '))} no suprimido. Un error también hace fallar <code>cdk synth</code>.</li>
        <li>Checkov: severidad ${esc((policy.checkov.severidades || []).join(', '))} y los checks ${esc((policy.checkov.idsBloqueantes || []).join(', '))} aunque vengan sin severidad.</li>
        <li>Plantilla IAM: Action * con Resource *, o permisos IAM y de datos sobre Resource *.</li>
        <li>Informe obligatorio ausente o herramienta caída: el despliegue queda cerrado.</li>
      </ul>
    </section>
    <section>
      <h2>Hallazgos que cierran la compuerta</h2>
      ${bloqueos.length === 0 ? '<p>Ninguno.</p>' : `<table><thead><tr><th>Herramienta</th><th>Severidad</th><th>Regla</th><th>Detalle</th><th>Ubicación</th></tr></thead><tbody>${rows(bloqueos)}</tbody></table>${extra(bloqueos)}`}
    </section>
    <section>
      <h2>Avisos que no cierran la compuerta</h2>
      ${avisos.length === 0 ? '<p>Ninguno.</p>' : `<table><thead><tr><th>Herramienta</th><th>Severidad</th><th>Regla</th><th>Detalle</th><th>Ubicación</th></tr></thead><tbody>${rows(avisos)}</tbody></table>${extra(avisos)}`}
    </section>
    <section>
      <h2>Riesgos aceptados</h2>
      <ul>${riesgos}</ul>
    </section>
    <section>
      <h2>Archivos de este informe</h2>
      <ul>${archivos}</ul>
    </section>
  </main>
</body>
</html>
`
}

function buildSummary(gate, items) {
  const bloqueos = items.filter((item) => item.bloquea)
  const lines = [
    `## Análisis de seguridad`,
    '',
    gate.permitirDespliegue
      ? 'Compuerta **abierta**. El workflow de CD puede continuar.'
      : `Compuerta **cerrada**. ${bloqueos.length} hallazgo(s) bloqueante(s). El despliegue a AWS no se ejecuta.`,
    '',
    'El informe HTML, JSON y SARIF está en el artefacto `informes-seguridad`.',
    '',
  ]
  if (bloqueos.length > 0) {
    lines.push('| Herramienta | Regla | Detalle | Ubicación |', '|---|---|---|---|')
    for (const item of bloqueos.slice(0, 30)) {
      lines.push(`| ${mdCell(item.herramienta)} | \`${mdCell(item.regla)}\` | ${mdCell(item.titulo)} | \`${mdCell(item.archivo)}:${item.linea}\` |`)
    }
    if (bloqueos.length > 30) lines.push('', `Hay ${bloqueos.length - 30} bloqueos más en el HTML.`)
    lines.push('')
  }
  return lines.join('\n')
}

function main() {
  mkdirSync(reportsDir, { recursive: true })
  const policy = readJson(policyPath)
  const items = [
    ...missingReports(policy),
  ]
  const trivyFiles = [
    ['trivy-fs.json', 'filesystem'],
    ['trivy-jar.json', 'jar'],
    ['trivy-iac.json', 'iac'],
  ]
  for (const [name, origen] of trivyFiles) {
    const path = join(reportsDir, name)
    if (existsSync(path)) items.push(...parseTrivy(path, origen, policy))
  }
  const npmFiles = [
    ['npm-audit-frontend.json', 'frontend', false],
    ['npm-audit-infra.json', 'infra', false],
    ['npm-audit-frontend-completo.json', 'frontend completo', true],
    ['npm-audit-infra-completo.json', 'infra completo', true],
  ]
  for (const [name, origen, info] of npmFiles) {
    const path = join(reportsDir, name)
    if (existsSync(path)) items.push(...parseNpm(path, origen, policy, info))
  }
  if (existsSync(join(reportsDir, 'dependency-check.json'))) {
    items.push(...parseDependencyCheck(join(reportsDir, 'dependency-check.json'), policy))
  }
  if (existsSync(join(reportsDir, 'semgrep.json'))) {
    items.push(...parseSemgrep(join(reportsDir, 'semgrep.json'), policy))
  }
  if (existsSync(join(reportsDir, 'gitleaks.json'))) {
    items.push(...parseGitleaks(join(reportsDir, 'gitleaks.json'), policy))
  }
  if (existsSync(join(reportsDir, 'spotbugs.xml'))) {
    items.push(...parseSpotbugs(join(reportsDir, 'spotbugs.xml'), policy))
  }
  const nag = parseNagReports(policy)
  items.push(...nag)
  items.push(...parseSynth(nag))
  if (existsSync(join(reportsDir, 'checkov.json'))) {
    items.push(...parseCheckov(join(reportsDir, 'checkov.json'), policy))
  }
  items.push(...parseIamTemplates(policy))

  const bloqueos = items.filter((item) => item.bloquea)
  const gate = {
    permitirDespliegue: bloqueos.length === 0,
    motivo: bloqueos.length === 0
      ? 'Ningún hallazgo bloqueante.'
      : bloqueos.slice(0, 8).map((item) => `${item.herramienta}: ${item.regla}`).join('; '),
    bloqueos: bloqueos.length,
    avisos: items.length - bloqueos.length,
    generadoEn: new Date().toISOString(),
    commit: process.env.GITHUB_SHA || '',
    ref: process.env.GITHUB_REF || '',
    politica: '.github/security/politica.json',
  }
  const resumen = {
    ...gate,
    totales: { bloqueos: bloqueos.length, avisos: gate.avisos, hallazgos: items.length },
    riesgosAceptados: policy.riesgosAceptados ?? [],
    hallazgos: items,
  }
  writeFileSync(join(reportsDir, 'resumen.json'), JSON.stringify(resumen, null, 2))
  writeFileSync(join(reportsDir, 'resumen.sarif'), JSON.stringify(buildSarif(items), null, 2))
  writeFileSync(join(reportsDir, 'compuerta.json'), JSON.stringify(gate, null, 2))
  writeFileSync(join(reportsDir, 'index.html'), buildHtml(policy, items, gate))

  const summary = buildSummary(gate, items)
  console.log(summary)
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`)
  for (const item of bloqueos.slice(0, 30)) {
    console.log(`::error file=${ann(item.archivo)},line=${item.linea},title=${ann(item.regla)}::${ann(`${item.herramienta}: ${item.titulo}`)}`)
  }
  process.exit(gate.permitirDespliegue ? 0 : 1)
}

main()
