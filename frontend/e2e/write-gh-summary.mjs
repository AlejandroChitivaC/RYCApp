import { appendFileSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const jsonPath = process.argv[2] || 'playwright-results.json'
const summary = process.env.GITHUB_STEP_SUMMARY
const reportDir = resolve('playwright-report')
const shotsDir = join(reportDir, 'pantallazos')

function walk(suite, prefix, items) {
  const title = [prefix, suite.title].filter(Boolean).join(' › ')
  for (const spec of suite.specs ?? []) {
    const name = `${title} › ${spec.title}`.replace(/^\s*›\s*/, '')
    const shots = []
    for (const test of spec.tests ?? []) {
      for (const result of test.results ?? []) {
        for (const attachment of result.attachments ?? []) {
          const type = String(attachment.contentType ?? '')
          if (!type.startsWith('image/') || !attachment.path) continue
          shots.push(attachment.path)
        }
      }
    }
    items.push({ name, ok: spec.ok !== false, shots })
  }
  for (const child of suite.suites ?? []) walk(child, title, items)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeCell(value) {
  return String(value).replaceAll('|', '/').replaceAll('\n', ' ')
}

let report
try {
  report = JSON.parse(readFileSync(jsonPath, 'utf8'))
} catch {
  if (summary) appendFileSync(summary, '## Playwright\n\nNo hay resultados de la corrida.\n')
  process.exit(0)
}

const items = []
for (const suite of report.suites ?? []) walk(suite, '', items)

mkdirSync(shotsDir, { recursive: true })
let copied = 0
for (const item of items) {
  item.files = []
  for (const source of item.shots) {
    const fileName = `${String(copied + 1).padStart(2, '0')}.png`
    try {
      copyFileSync(source, join(shotsDir, fileName))
      item.files.push(fileName)
      copied += 1
    } catch {
      item.files.push(null)
    }
  }
}

const cards = items
  .map((item) => {
    const estado = item.ok ? 'OK' : 'FALLÓ'
    const images = item.files.filter(Boolean)
    const body = images.length
      ? images.map((file) => `<img src="pantallazos/${file}" alt="${escapeHtml(item.name)}">`).join('\n')
      : '<p class="vacio">Sin pantallazo.</p>'
    return `<article class="card">
      <header><span class="${item.ok ? 'ok' : 'fail'}">${estado}</span><h2>${escapeHtml(item.name)}</h2></header>
      ${body}
    </article>`
  })
  .join('\n')

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pantallazos Playwright</title>
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; padding: 32px 20px 64px; font-family: "Segoe UI", sans-serif; background: #0e141b; color: #e8eef5; }
    main { max-width: 1100px; margin: 0 auto; }
    h1 { font-size: 1.5rem; margin: 0 0 8px; }
    .lead { color: #9aafc3; margin: 0 0 24px; }
    .card { background: #17212c; border: 1px solid #2a3b4d; border-radius: 14px; padding: 16px; margin: 0 0 18px; }
    header { display: flex; gap: 12px; align-items: baseline; margin-bottom: 12px; }
    h2 { font-size: 1rem; font-weight: 600; margin: 0; }
    .ok { color: #3dd68c; font-weight: 700; }
    .fail { color: #ff7b7b; font-weight: 700; }
    img { width: 100%; border-radius: 10px; border: 1px solid #314557; background: #fff; }
    .vacio { color: #9aafc3; }
  </style>
</head>
<body>
  <main>
    <h1>Pantallazos</h1>
    <p class="lead">${items.length} test(s) · ${copied} imagen(es).</p>
    ${cards || '<p>No hubo tests.</p>'}
  </main>
</body>
</html>
`
writeFileSync(join(reportDir, 'pantallazos.html'), html)

if (summary) {
  const rows = items.map((item) => {
    const estado = item.ok ? 'OK' : 'FALLÓ'
    const imagenes = item.files.filter(Boolean).length
    return `| ${estado} | ${escapeCell(item.name)} | ${imagenes} |`
  })
  appendFileSync(
    summary,
    [
      '## Playwright',
      '',
      `Pasaron: **${report.stats?.expected ?? 0}** · Fallaron: **${report.stats?.unexpected ?? 0}** · Flaky: **${report.stats?.flaky ?? 0}** · Pantallazos: **${copied}**`,
      '',
      'Las imágenes están en el artefacto `playwright-report`, archivo `pantallazos.html`.',
      '',
      '| Estado | Test | Pantallazos |',
      '|---|---|---|',
      ...rows,
      '',
    ].join('\n'),
  )
}

if (copied === 0 && items.length > 0) {
  console.error('Los tests corrieron, pero no quedó ningún pantallazo.')
  process.exit(1)
}
