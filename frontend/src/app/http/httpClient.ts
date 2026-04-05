import axios from 'axios'
import { API_BASE_URL } from '../config'

const TOKEN_KEY = 'rycapp_token'
const USER_KEY = 'rycapp_user'

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

