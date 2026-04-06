import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { notify } from '../../../shared/notify/notiflix'
import { AuthSplitLayout } from '../components/AuthSplitLayout'
import { AuthMailIcon } from '../components/AuthDarkField'
import { PasswordFieldWithStrength, passwordMeetsPolicy } from '../components/PasswordFieldWithStrength'
import { PasswordRecoveryStepper } from '../components/PasswordRecoveryStepper'
import { authApi } from '../api'
import { OTP_COUNTDOWN_SECONDS } from '../constants'
import logoUrl from '../../../assets/logo.png'

function deadlineStorageKey(email: string) {
  return `rycapp_reset_otp_deadline_${email.toLowerCase()}`
}

function formatMmSs(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-zinc-500" fill="currentColor" aria-hidden>
      <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Z" />
    </svg>
  )
}

function IconKeyHero() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M21 2l-4.35 4.35M12 12l-1 1 2 2 1-1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m10 14 8.5-8.5a2.12 2.12 0 0 1 3 3L14 17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSendBtn() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2 11 13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" strokeLinejoin="round" />
    </svg>
  )
}

function LightEmailField({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-zinc-700">Correo electrónico</span>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
          <span className="[&_svg]:block [&_svg]:h-[1.15rem] [&_svg]:w-[1.15rem]">
            <AuthMailIcon />
          </span>
        </span>
        <input
          type="email"
          autoComplete="email"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="correo@empresa.com"
          required
          className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-3 text-sm text-brand-dark shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 disabled:bg-zinc-50"
        />
      </div>
    </label>
  )
}

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [params, setSearchParams] = useSearchParams()
  const emailFromQuery = useMemo(() => params.get('email') ?? '', [params])

  const [step, setStep] = useState<'email' | 'code'>('email')
  const [correo, setCorreo] = useState(emailFromQuery)
  const [codigo, setCodigo] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null)
  const [, setTick] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const year = new Date().getFullYear()

  useEffect(() => {
    if (emailFromQuery) setCorreo(emailFromQuery)
  }, [emailFromQuery])

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  const remainingSec =
    deadlineMs == null ? null : Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000))

  const armDeadline = (email: string) => {
    const nd = Date.now() + OTP_COUNTDOWN_SECONDS * 1000
    sessionStorage.setItem(deadlineStorageKey(email.trim()), String(nd))
    setDeadlineMs(nd)
  }

  const goToCodeStep = (email: string, withSentFlag: boolean) => {
    setStep('code')
    setCorreo(email.trim())
    if (withSentFlag) {
      const p = new URLSearchParams()
      p.set('email', email.trim())
      p.set('sent', '1')
      setSearchParams(p, { replace: true })
    }
  }

  useEffect(() => {
    const em = correo.trim()
    if (step !== 'code' || !em) return
    const sent = params.get('sent') === '1'
    const k = deadlineStorageKey(em)
    const raw = sessionStorage.getItem(k)
    const stored = raw ? parseInt(raw, 10) : 0
    if (sent) {
      if (stored > Date.now()) {
        setDeadlineMs(stored)
      } else {
        armDeadline(em)
      }
      const p = new URLSearchParams(params)
      p.delete('sent')
      setSearchParams(p, { replace: true })
    } else if (stored > Date.now()) {
      setDeadlineMs(stored)
    }
  }, [step, correo, params, setSearchParams])

  const passwordsMatch = password === password2 && password.length > 0
  const canSubmitCode =
    passwordMeetsPolicy(password) && passwordsMatch && codigo.trim().length >= 4 && correo.trim().length > 0

  const phase = step === 'email' ? 'request' : 'reset'

  const leftPanel = (
    <>
      <div>
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="grid h-[4.25rem] w-[4.25rem] shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-brand-yellow p-2 shadow-lg shadow-amber-500/25 ring-2 ring-amber-300/50 sm:h-[4.75rem] sm:w-[4.75rem]">
            <img src={logoUrl} alt="R&C Transportes" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">R&amp;C</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400 sm:text-[11px]">
              Transportes
            </p>
          </div>
        </div>

        <h1 className="mt-10 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
          Recupera el acceso
          <br />
          <span className="text-amber-400">a tu cuenta</span>
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
          Te ayudaremos a restablecer tu contraseña de forma segura en solo unos pasos.
        </p>

        <div className="mt-10 max-w-md">
          <PasswordRecoveryStepper phase={phase} />
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-zinc-500">
        <IconShield />
        Proceso seguro y cifrado de extremo a extremo
      </p>
    </>
  )

  const rightEmail = (
    <div className="text-brand-dark">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-amber-600 shadow-inner ring-4 ring-amber-50">
        <IconKeyHero />
      </div>
      <h2 className="mt-6 text-center text-2xl font-extrabold tracking-tight">Recuperar contraseña</h2>
      <p className="mt-2 text-center text-sm text-zinc-600">
        Te enviaremos un código OTP al correo{' '}
        <span className="font-semibold text-amber-600">(debe estar verificado en el sistema)</span>
      </p>

      <div className="mt-6 flex gap-3 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 shadow-sm">
        <IconClock />
        <div>
          <p className="text-sm font-bold text-amber-800">Código válido por 2 minutos</p>
          <p className="mt-1 text-xs leading-snug text-amber-900/75">
            Asegúrate de tener acceso a tu correo antes de solicitar el código.
          </p>
        </div>
      </div>

      <form
        className="mt-8 space-y-6"
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          setLoading(true)
          try {
            const res = await authApi.solicitarRecuperacion(correo.trim())
            notify.success(res.message)
            goToCodeStep(correo, true)
          } catch (err) {
            setError(getApiErrorMessage(err))
          } finally {
            setLoading(false)
          }
        }}
      >
        <LightEmailField value={correo} onChange={setCorreo} />
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}
        <Button
          type="submit"
          loading={loading}
          className="w-full justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-brand-yellow to-amber-500 py-3.5 text-base font-extrabold text-brand-dark shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:via-brand-yellow hover:to-amber-400"
        >
          <IconSendBtn />
          Enviar código OTP
        </Button>
      </form>

      <p className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-brand-dark"
        >
          <span aria-hidden>←</span> Volver al inicio de sesión
        </Link>
      </p>
      <p className="mt-10 text-center text-xs text-zinc-400">Todos los derechos reservados | R&amp;C {year}</p>
    </div>
  )

  const rightCode = (
    <div className="text-brand-dark">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-amber-600 shadow-inner ring-4 ring-amber-50">
        <IconKeyHero />
      </div>
      <h2 className="mt-6 text-center text-2xl font-extrabold tracking-tight">Nueva contraseña</h2>
      <p className="mt-2 text-center text-sm text-zinc-600">
        Introduce el código OTP y define una contraseña nueva que cumpla la política de seguridad.
      </p>

      {remainingSec !== null ? (
        <div
          className={[
            'mt-6 flex gap-3 rounded-xl border px-4 py-3',
            remainingSec > 0
              ? 'border-amber-200/90 bg-amber-50/90 text-amber-900'
              : 'border-red-200 bg-red-50 text-red-800',
          ].join(' ')}
        >
          <IconClock />
          <div className="text-sm font-semibold">
            {remainingSec > 0 ? (
              <>
                Tiempo restante: <span className="tabular-nums">{formatMmSs(remainingSec)}</span>
              </>
            ) : (
              <>El código expiró. Usa «Reenviar código OTP».</>
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-8 space-y-5">
        <LightEmailField value={correo} onChange={setCorreo} />
        <Input
          label="Código OTP"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Ej. 042891"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
        />
        <PasswordFieldWithStrength label="Nueva contraseña" value={password} onChange={setPassword} />
        <Input
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
        {password2.length > 0 && !passwordsMatch ? (
          <p className="text-xs font-medium text-red-600">Las contraseñas no coinciden.</p>
        ) : null}
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}

        <Button
          type="button"
          className="w-full justify-center rounded-xl py-3.5 text-base font-extrabold shadow-lg shadow-amber-500/20"
          loading={loading}
          disabled={!canSubmitCode}
          onClick={async () => {
            setError(null)
            setLoading(true)
            try {
              const res = await authApi.confirmarRecuperacion({
                correo: correo.trim(),
                codigo: codigo.trim(),
                password,
              })
              sessionStorage.removeItem(deadlineStorageKey(correo.trim()))
              notify.success(res.message)
              window.setTimeout(() => {
                navigate('/login', { replace: true })
              }, 1200)
            } catch (err) {
              setError(getApiErrorMessage(err))
            } finally {
              setLoading(false)
            }
          }}
        >
          Guardar nueva contraseña
        </Button>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center rounded-xl border-zinc-200 bg-white py-3"
            onClick={async () => {
              setError(null)
              setLoading(true)
              try {
                const res = await authApi.solicitarRecuperacion(correo.trim())
                notify.success(res.message)
                armDeadline(correo.trim())
              } catch (err) {
                setError(getApiErrorMessage(err))
              } finally {
                setLoading(false)
              }
            }}
          >
            Reenviar código OTP
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center rounded-xl border-zinc-200 bg-white py-3"
            onClick={() => {
              setStep('email')
              setCodigo('')
              setPassword('')
              setPassword2('')
              setDeadlineMs(null)
              setSearchParams({}, { replace: true })
            }}
          >
            Volver al paso 1
          </Button>
        </div>
      </div>

      <p className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-brand-dark"
        >
          <span aria-hidden>←</span> Volver al inicio de sesión
        </Link>
      </p>
      <p className="mt-10 text-center text-xs text-zinc-400">Todos los derechos reservados | R&amp;C {year}</p>
    </div>
  )

  return (
    <AuthSplitLayout
      leftPlusPattern
      rightVariant="light"
      left={leftPanel}
      right={step === 'email' ? rightEmail : rightCode}
    />
  )
}
