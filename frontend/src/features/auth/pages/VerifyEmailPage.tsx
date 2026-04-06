import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../app/http/apiError'
import { notify } from '../../../shared/notify/notiflix'
import { Button } from '../../../shared/ui/Button'
import { AuthDarkField, AuthMailIcon } from '../components/AuthDarkField'
import { RegistrationStepper } from '../components/RegistrationStepper'
import { AuthFooterStatus, AuthLogoHero, AuthSplitLayout } from '../components/AuthSplitLayout'
import { authApi } from '../api'
import { OTP_COUNTDOWN_SECONDS } from '../constants'

function deadlineStorageKey(email: string) {
  return `rycapp_otp_deadline_${email.toLowerCase()}`
}

function formatMmSs(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const LOGIN_REDIRECT_MS = 1800

function IconKey() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 2l-9 9" strokeLinecap="round" />
      <path d="M15.5 7.5 22 14" strokeLinecap="round" />
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M10 18v3M8 21h4" strokeLinecap="round" />
    </svg>
  )
}

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [params, setSearchParams] = useSearchParams()
  const emailInitial = useMemo(() => params.get('email') ?? '', [params])
  const [correo, setCorreo] = useState(emailInitial)
  const [codigo, setCodigo] = useState('')
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null)
  const [, setTick] = useState(0)
  const searchString = params.toString()

  useEffect(() => {
    if (emailInitial) setCorreo(emailInitial)
  }, [emailInitial])

  useEffect(() => {
    const em = emailInitial.trim()
    if (!em) return

    const p = new URLSearchParams(searchString)
    const k = deadlineStorageKey(em)
    const raw = sessionStorage.getItem(k)
    const stored = raw ? parseInt(raw, 10) : 0

    if (p.get('sent') === '1') {
      if (stored > Date.now()) {
        setDeadlineMs(stored)
      } else {
        const nd = Date.now() + OTP_COUNTDOWN_SECONDS * 1000
        sessionStorage.setItem(k, String(nd))
        setDeadlineMs(nd)
      }
      p.delete('sent')
      setSearchParams(p, { replace: true })
      return
    }

    if (stored > Date.now()) {
      setDeadlineMs(stored)
    }
  }, [emailInitial, searchString, setSearchParams])

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  const remainingSec =
    deadlineMs == null ? null : Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000))

  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const armNewDeadline = (email: string) => {
    const k = deadlineStorageKey(email.trim())
    const nd = Date.now() + OTP_COUNTDOWN_SECONDS * 1000
    sessionStorage.setItem(k, String(nd))
    setDeadlineMs(nd)
  }

  const year = new Date().getFullYear()

  return (
    <AuthSplitLayout
      left={
        <>
          <div>
            <AuthLogoHero />
            <h1 className="mt-10 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Verifica tu <span className="text-brand-yellow">correo</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400">
              Introduce el código de 6 dígitos que enviamos a tu bandeja. Después, tu solicitud pasará a revisión
              administrativa.
            </p>
            <div className="mt-10 max-w-md">
              <RegistrationStepper activeStep={2} />
            </div>
          </div>
          <AuthFooterStatus leftText={`© R&C ${year} · Todos los derechos reservados`} />
        </>
      }
      right={
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Código OTP</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            El código es válido por{' '}
            <span className="font-semibold text-amber-400/95">2 minutos</span>. Si expira, puedes solicitar uno nuevo.
          </p>

          {remainingSec !== null ? (
            <div
              className={[
                'mt-6 rounded-xl border px-4 py-3 text-center text-sm font-bold',
                remainingSec > 0
                  ? 'border-brand-yellow/45 bg-brand-yellow/10 text-brand-yellow'
                  : 'border-red-500/40 bg-red-950/40 text-red-100',
              ].join(' ')}
            >
              {remainingSec > 0 ? (
                <>
                  Tiempo restante: <span className="tabular-nums">{formatMmSs(remainingSec)}</span>
                </>
              ) : (
                <>El código anterior expiró. Usa «Reenviar código».</>
              )}
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl border border-zinc-800/90 bg-zinc-900/35 p-5 ring-1 ring-white/[0.04] sm:p-6">
            <form
              className="space-y-5"
              onSubmit={async (e) => {
                e.preventDefault()
                setError(null)
                setMessage(null)
                setLoading(true)
                let ok = false
                try {
                  await authApi.verificarCorreo(correo.trim(), codigo.trim())
                  ok = true
                  sessionStorage.removeItem(deadlineStorageKey(correo.trim()))
                  setDeadlineMs(null)
                  notify.success(
                    'Correo verificado. Un administrador activará tu cuenta; luego podrás iniciar sesión.',
                  )
                  window.setTimeout(() => {
                    navigate('/login', { replace: true })
                  }, LOGIN_REDIRECT_MS)
                } catch (err) {
                  setError(getApiErrorMessage(err))
                } finally {
                  if (!ok) setLoading(false)
                }
              }}
            >
              <AuthDarkField
                label="Correo electrónico"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                leftIcon={<AuthMailIcon />}
              />
              <AuthDarkField
                label="Código OTP (6 dígitos)"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej. 042891"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                leftIcon={
                  <span className="text-zinc-500 [&_svg]:h-[1.15rem] [&_svg]:w-[1.15rem]">
                    <IconKey />
                  </span>
                }
              />
              {error ? (
                <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}
              {message ? (
                <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100">
                  {message}
                </div>
              ) : null}
              <Button
                type="submit"
                loading={loading}
                className="w-full justify-center rounded-xl py-3.5 text-base font-extrabold shadow-lg shadow-brand-yellow/15"
              >
                Verificar correo
              </Button>
            </form>

            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                className="w-full justify-center rounded-xl border-zinc-600 bg-zinc-800/80 py-3 text-zinc-200 hover:bg-zinc-800"
                loading={resendLoading}
                onClick={async () => {
                  setError(null)
                  setMessage(null)
                  setResendLoading(true)
                  try {
                    const res = await authApi.reenviarOtp(correo.trim())
                    setMessage(res.message)
                    armNewDeadline(correo.trim())
                  } catch (err) {
                    setError(getApiErrorMessage(err))
                  } finally {
                    setResendLoading(false)
                  }
                }}
              >
                Reenviar código
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-zinc-500">
            <Link
              to="/login"
              className="font-bold text-brand-yellow hover:text-amber-300 underline-offset-2 hover:underline"
            >
              Ir a iniciar sesión
            </Link>
          </p>
        </div>
      }
    />
  )
}
