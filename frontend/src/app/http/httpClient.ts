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

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type')
    } else {
      delete config.headers['Content-Type']
    }
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

