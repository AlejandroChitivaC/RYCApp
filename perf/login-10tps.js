import http from 'k6/http'
import { check } from 'k6'

const baseUrl = (__ENV.BASE_URL || 'https://dne4r7yuqm0az.cloudfront.net').replace(/\/$/, '')
const correo = __ENV.LOADTEST_CORREO || 'admin@rycapp.local'
const password = __ENV.LOADTEST_PASSWORD || 'Admin1234!'

export const options = {
  scenarios: {
    diez_tps: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 15,
      maxVUs: 40,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],
    dropped_iterations: ['rate<1'],
    checks: ['rate>0.95'],
  },
}

export default function () {
  const res = http.post(
    `${baseUrl}/api/auth/login`,
    JSON.stringify({ correo, password }),
    { headers: { 'Content-Type': 'application/json' } },
  )
  check(res, {
    'login 200': (r) => r.status === 200,
    'devuelve token': (r) => {
      try {
        return Boolean(r.json('accessToken') || r.json('token'))
      } catch {
        return false
      }
    },
  })
}

function metric(data, name, key, fallback = 0) {
  return data.metrics[name]?.values?.[key] ?? fallback
}

export function handleSummary(data) {
  const tps = metric(data, 'http_reqs', 'rate')
  const p95 = metric(data, 'http_req_duration', 'p(95)')
  const errPct = metric(data, 'http_req_failed', 'rate') * 100
  const checkPct = metric(data, 'checks', 'rate') * 100
  const dropped = metric(data, 'dropped_iterations', 'count')
  const cumple = tps >= 10 && errPct < 5 && p95 < 5000 && checkPct > 95

  const md = [
    '## Carga 10 TPS — login',
    '',
    '| Métrica | Resultado | Criterio |',
    '|---|---|---|',
    `| Throughput | **${tps.toFixed(2)} req/s** | ≥ 10 TPS |`,
    `| Latencia p95 | ${p95.toFixed(0)} ms | < 5000 ms |`,
    `| Errores HTTP | ${errPct.toFixed(2)}% | < 5% |`,
    `| Checks OK | ${checkPct.toFixed(1)}% | > 95% |`,
    `| Iteraciones no servidas | ${dropped} | ~0 |`,
    '',
    cumple ? '**Cumple 10 TPS.**' : '**No cumple el umbral de 10 TPS.**',
    '',
  ].join('\n')

  return { 'k6-summary.md': md }
}
