import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getApiErrorCode, getApiErrorMessage } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import {
  AuthDarkField,
  AuthLockIcon,
  AuthMailIcon,
  AuthPasswordToggle,
} from '../components/AuthDarkField'
import {
  AuthFeatureCard,
  AuthFooterStatus,
  AuthLogoHero,
  AuthSplitLayout,
} from '../components/AuthSplitLayout'
import { authApi } from '../api'
import { homePathForRole, puedeAccederRuta } from '../roles'
import { useAuthStore } from '../store'

const REMEMBER_EMAIL_KEY = 'ryc_auth_remember_email'

function IconPackage() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"
        strokeLinejoin="round"
      />
      <path d="m4 7 8 4 8-4M12 11v10" strokeLinecap="round" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}
export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((s) => s.setSession)
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_EMAIL_KEY)
      if (saved) {
        setCorreo(saved)
        setRemember(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const year = new Date().getFullYear()

  return (
    <AuthSplitLayout
      left={
        <>
          <div>
            <AuthLogoHero />
            <h1 className="mt-10 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Gestión operativa{' '}
              <span className="text-brand-yellow">inteligente</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400">
              Controla catálogos, operaciones y costos de tu flota desde una sola plataforma.
            </p>
            <div className="mt-10 grid gap-4 sm:max-w-lg">
              <AuthFeatureCard
                icon={<IconPackage />}
                title="Catálogo de materiales"
                description="Gestiona inventarios y referencias en tiempo real."
              />
              <AuthFeatureCard
                icon={<IconPin />}
                title="Seguimiento de operaciones"
                description="Registra y consulta movimientos alineados a tu línea de negocio."
              />
            </div>
          </div>
          <AuthFooterStatus leftText={`Todos los derechos reservados R&C ${year}`} />
        </>
      }
      right={
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Iniciar sesión</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Ingresa con correo y contraseña.{' '}
            <span className="font-semibold text-amber-400/95">
              El correo debe estar verificado y la cuenta activada por un administrador.
            </span>
          </p>

          <form
            className="mt-8 space-y-5"
            onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              setErrorCode(null)
              setLoading(true)
              try {
                const res = await authApi.login(correo.trim(), password)
                setSession(res.accessToken, res.usuario)
                try {
                  if (remember) localStorage.setItem(REMEMBER_EMAIL_KEY, correo.trim())
                  else localStorage.removeItem(REMEMBER_EMAIL_KEY)
                } catch {
                  /* ignore */
                }
                const destino = puedeAccederRuta(res.usuario.rol, from)
                  ? from
                  : homePathForRole(res.usuario.rol)
                navigate(destino, { replace: true })
              } catch (err) {
                setError(getApiErrorMessage(err))
                setErrorCode(getApiErrorCode(err) ?? null)
              } finally {
                setLoading(false)
              }
            }}
          >
            <AuthDarkField
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="nombre@empresa.com"
              required
              leftIcon={<AuthMailIcon />}
            />
            <AuthDarkField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
              leftIcon={<AuthLockIcon />}
              rightSlot={
                <AuthPasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
              }
            />

            {error ? (
              <div className="space-y-3 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
                <p>{error}</p>
                {errorCode === 'EMAIL_NOT_VERIFIED' ? (
                  <div>
                    <Link
                      to={`/verificar-correo?email=${encodeURIComponent(correo.trim())}`}
                      className="font-bold text-brand-yellow underline underline-offset-2 hover:text-brand-yellow/90"
                    >
                      Ir a verificar correo (OTP)
                    </Link>
                  </div>
                ) : null}
                {errorCode === 'ACCOUNT_PENDING_APPROVAL' ? (
                  <p className="text-red-100/90">
                    Cuando un administrador active tu cuenta recibirás un correo de confirmación.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label className="flex cursor-pointer select-none items-center gap-2.5 text-zinc-400">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-brand-yellow focus:ring-2 focus:ring-brand-yellow/40"
                />
                Recordarme
              </label>
              <Link
                to="/recuperar-contrasena"
                className="font-bold text-brand-yellow hover:text-amber-300 underline-offset-2 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full justify-center rounded-xl py-3.5 text-base font-extrabold shadow-lg shadow-brand-yellow/15"
            >
              Entrar <span aria-hidden>→</span>
            </Button>
          </form>
          <p className="mt-10 text-center text-sm text-zinc-500">
            ¿No tienes cuenta?{' '}
            <Link
              to="/registro"
              className="font-bold text-brand-yellow hover:text-amber-300 underline-offset-2 hover:underline"
            >
              Registrarse
            </Link>
          </p>
        </div>
      }
    />
  )
}
