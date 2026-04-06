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

function IconGoogle() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M12 10.2v3.9h5.5c-.25 1.6-1.9 4.7-5.5 4.7-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.8 3.9 14.6 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  )
}

function IconGithub() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
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
                navigate(from, { replace: true })
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

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#121212] px-4 font-medium text-zinc-500">o continúa con</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled
              title="Inicio de sesión social no disponible en esta versión"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 py-3 text-sm font-bold text-zinc-300 opacity-60"
            >
              <IconGoogle />
              Google
            </button>
            <button
              type="button"
              disabled
              title="Inicio de sesión social no disponible en esta versión"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 py-3 text-sm font-bold text-zinc-300 opacity-60"
            >
              <IconGithub />
              GitHub
            </button>
          </div>

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
