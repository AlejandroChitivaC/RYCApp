import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { notify } from '../../../shared/notify/notiflix'
import { PasswordFieldWithStrength, passwordMeetsPolicy } from '../components/PasswordFieldWithStrength'
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

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-brand-page px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/90 bg-white p-8 shadow-soft">
        <div className="flex flex-col items-center gap-2">
          <img src={logoUrl} alt="R&C" className="h-14 w-auto object-contain" />
          <h1 className="text-xl font-extrabold text-brand-dark">
            {step === 'email' ? 'Recuperar contraseña' : 'Nueva contraseña'}
          </h1>
          <p className="text-center text-sm text-brand-muted">
            {step === 'email'
              ? 'Te enviaremos un código OTP al correo (debe estar verificado en el sistema).'
              : 'Introduce el código recibido y una contraseña nueva que cumpla los requisitos.'}
          </p>
        </div>

        {step === 'email' ? (
          <form
            className="mt-8 space-y-4"
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
            <Input
              label="Correo"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            ) : null}
            <Button type="submit" className="w-full" loading={loading}>
              Enviar código OTP
            </Button>
          </form>
        ) : (
          <div className="mt-8 space-y-4">
            {remainingSec !== null ? (
              <div
                className={[
                  'rounded-2xl border-2 px-4 py-3 text-center text-sm font-bold',
                  remainingSec > 0
                    ? 'border-brand-yellow/60 bg-brand-yellow/10 text-brand-dark'
                    : 'border-red-200 bg-red-50 text-red-800',
                ].join(' ')}
              >
                {remainingSec > 0 ? (
                  <>
                    Tiempo restante para este código:{' '}
                    <span className="tabular-nums">{formatMmSs(remainingSec)}</span>
                  </>
                ) : (
                  <>El tiempo del código enviado ha finalizado. Solicita uno nuevo.</>
                )}
              </div>
            ) : null}

            <Input
              label="Correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            <Input
              label="Código OTP"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej. 042891"
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
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <Button
              type="button"
              className="w-full"
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

            <Button
              type="button"
              variant="secondary"
              className="w-full"
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
              className="w-full"
              onClick={() => {
                setStep('email')
                setCodigo('')
                setPassword('')
                setPassword2('')
                setDeadlineMs(null)
                setSearchParams({}, { replace: true })
              }}
            >
              Volver al paso anterior
            </Button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-brand-muted">
          <Link to="/login" className="font-bold text-brand-dark underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
