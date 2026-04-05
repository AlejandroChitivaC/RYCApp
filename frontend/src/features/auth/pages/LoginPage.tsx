import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getApiErrorMessage } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { authApi } from '../api'
import { useAuthStore } from '../store'
import logoUrl from '../../../assets/logo.png'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((s) => s.setSession)
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border-2 border-zinc-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col items-center gap-2">
          <img src={logoUrl} alt="R&C" className="h-14 w-auto object-contain" />
          <h1 className="text-xl font-extrabold text-brand-dark">Iniciar sesión</h1>
          <p className="text-center text-sm text-brand-muted">
            Usa el correo y contraseña registrados (correo verificado con OTP).
          </p>
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setLoading(true)
            try {
              const res = await authApi.login(correo.trim(), password)
              setSession(res.accessToken, res.usuario)
              navigate(from, { replace: true })
            } catch (err) {
              setError(getApiErrorMessage(err))
            } finally {
              setLoading(false)
            }
          }}
        >
          <Input
            label="Correo"
            type="email"
            autoComplete="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}
          <Button type="submit" className="w-full" loading={loading}>
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-brand-muted">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-bold text-brand-dark underline">
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  )
}
