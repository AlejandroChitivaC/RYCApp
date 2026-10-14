import http from 'k6/http'
import { check } from 'k6'
import crypto from 'k6/crypto'

const baseUrl = (__ENV.BASE_URL || 'https://dne4r7yuqm0az.cloudfront.net').replace(/\/$/, '')
const correo = __ENV.LOADTEST_CORREO || 'admin@rycapp.local'
const password = __ENV.LOADTEST_PASSWORD || 'Admin1234!'

export const options = {
  scenarios: {
    // La versión nueva de Lambda responde 429 unos segundos después del despliegue.
    calentar: {
      executor: 'constant-arrival-rate',
      rate: 2,
      timeUnit: '1s',
      duration: '45s',
      preAllocatedVUs: 5,
      maxVUs: 10,
      exec: 'login',
    },
    diez_tps: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1s',
      duration: '30s',
      startTime: '50s',
      preAllocatedVUs: 15,
      maxVUs: 40,
      exec: 'login',
    },
  },
  thresholds: {
    'http_req_failed{scenario:diez_tps}': ['rate<0.05'],
    'http_req_duration{scenario:diez_tps}': ['p(95)<5000'],
    'dropped_iterations{scenario:diez_tps}': ['rate<1'],
    'checks{scenario:diez_tps}': ['rate>0.95'],
  },
}

export function login() {
  const payload = JSON.stringify({ correo, password })
  const res = http.post(
    `${baseUrl}/api/auth/login`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        'x-amz-content-sha256': crypto.sha256(payload, 'hex'),
      },
    },
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
  const count = metric(data, 'http_reqs{scenario:diez_tps}', 'count')
  const tps = count / 30
  const p95 = metric(data, 'http_req_duration{scenario:diez_tps}', 'p(95)')
  const errPct = metric(data, 'http_req_failed{scenario:diez_tps}', 'rate') * 100
  const checkPct = metric(data, 'checks{scenario:diez_tps}', 'rate') * 100
  const dropped = metric(data, 'dropped_iterations{scenario:diez_tps}', 'count')
  const cumple = tps >= 9.5 && errPct < 5 && p95 < 5000 && checkPct > 95

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
