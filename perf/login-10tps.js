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
