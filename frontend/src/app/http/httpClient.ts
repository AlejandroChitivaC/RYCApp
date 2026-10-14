import axios from 'axios'
import { API_BASE_URL } from '../config'
import { TOKEN_KEY, USER_KEY } from '../../shared/auth/storageKeys'

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ngrok (plan gratuito): evita respuesta HTML de intersticial en peticiones XHR/fetch
if (API_BASE_URL.includes('ngrok')) {
  http.defaults.headers.common['ngrok-skip-browser-warning'] = 'true'
}

// CloudFront firma el POST hacia la Function URL, pero Lambda rechaza el cuerpo
// si el cliente no manda x-amz-content-sha256 con el SHA-256 exacto de esos bytes.
async function sha256Hex(data: BufferSource): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function encodeFormData(form: FormData): Promise<{ body: ArrayBuffer; contentType: string }> {
  const boundary = `----RycForm${crypto.randomUUID().replace(/-/g, '')}`
  const chunks: Uint8Array[] = []
  const encoder = new TextEncoder()
  const push = (text: string) => chunks.push(encoder.encode(text))

  for (const [name, value] of form.entries()) {
    push(`--${boundary}\r\n`)
    if (typeof value === 'string') {
      push(`Content-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`)
      continue
    }
    const filename = (value instanceof File ? value.name : 'archivo').replace(/"/g, '')
    const type = value.type || 'application/octet-stream'
    push(`Content-Disposition: form-data; name="${name}"; filename="${filename}"\r\n`)
    push(`Content-Type: ${type}\r\n\r\n`)
    chunks.push(new Uint8Array(await value.arrayBuffer()))
    push('\r\n')
  }
  push(`--${boundary}--\r\n`)

  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const body = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.length
  }
  return { body: body.buffer, contentType: `multipart/form-data; boundary=${boundary}` }
}

http.interceptors.request.use(async (config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    // OAC sustituye Authorization por la firma de AWS. Este header sí llega a la Lambda.
    config.headers.set('X-User-Token', token)
  }

  if (config.data instanceof FormData) {
    const encoded = await encodeFormData(config.data)
    config.data = encoded.body
    config.transformRequest = [(data) => data]
    config.headers.set('Content-Type', encoded.contentType)
    config.headers.set('x-amz-content-sha256', await sha256Hex(encoded.body))
    return config
  }

  if (config.data != null && config.data !== '') {
    const raw = typeof config.data === 'string' ? config.data : JSON.stringify(config.data)
    const bytes = new TextEncoder().encode(raw)
    config.data = raw
    config.transformRequest = [(data) => data]
    config.headers.set('Content-Type', 'application/json')
    config.headers.set('x-amz-content-sha256', await sha256Hex(bytes))
  }

  return config
})

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const path = window.location.pathname
    if (status === 401 && !path.startsWith('/login') && !path.startsWith('/registro') && !path.startsWith('/verificar-correo')) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.location.assign('/login')
    }
    return Promise.reject(err)
  },
)

