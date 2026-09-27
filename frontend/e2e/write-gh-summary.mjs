import { appendFileSync, readFileSync } from 'node:fs'

const jsonPath = process.argv[2] || 'playwright-results.json'
const summary = process.env.GITHUB_STEP_SUMMARY
if (!summary) process.exit(0)

function walk(suite, prefix, rows) {
  const title = [prefix, suite.title].filter(Boolean).join(' › ')
  for (const spec of suite.specs ?? []) {
    const name = `${title} › ${spec.title}`.replaceAll('|', '/')
    rows.push(`| ${spec.ok ? 'OK' : 'FALLÓ'} | ${name} |`)
  }
  for (const child of suite.suites ?? []) walk(child, title, rows)
}

let report
try {
  report = JSON.parse(readFileSync(jsonPath, 'utf8'))
} catch {
  appendFileSync(summary, '## Playwright\n\nNo hay resultados de la corrida.\n')
  process.exit(0)
}

const rows = []
for (const suite of report.suites ?? []) walk(suite, '', rows)
const stats = report.stats ?? {}

appendFileSync(
  summary,
  [
    '## Playwright',
    '',
    `Pasaron: **${stats.expected ?? 0}** · Fallaron: **${stats.unexpected ?? 0}** · Flaky: **${stats.flaky ?? 0}**`,
    '',
    '| Estado | Test |',
    '|---|---|',
    ...rows,
    '',
  ].join('\n') + '\n',
)
