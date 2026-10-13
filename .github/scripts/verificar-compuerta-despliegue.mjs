import { readFileSync } from 'node:fs'

const file = process.argv[2] || 'security-reports/compuerta.json'

let gate
try {
  let raw = readFileSync(file, 'utf8')
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1)
  gate = JSON.parse(raw)
} catch (error) {
  console.error(`No se pudo leer la compuerta de seguridad en ${file}. El despliegue queda bloqueado.`)
  console.error(error.message)
  process.exit(1)
}

if (gate.permitirDespliegue !== true) {
  console.error(gate.motivo || 'La compuerta de seguridad no autoriza el despliegue.')
  console.error(`Bloqueos registrados: ${gate.bloqueos ?? 'desconocido'}.`)
  process.exit(1)
}

console.log('Compuerta de seguridad abierta. El despliegue puede continuar.')
console.log(gate.motivo || '')
