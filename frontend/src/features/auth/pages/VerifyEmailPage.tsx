import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../app/http/apiError'
import { notify } from '../../../shared/notify/notiflix'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { authApi } from '../api'
import { OTP_COUNTDOWN_SECONDS } from '../constants'
import logoUrl from '../../../assets/logo.png'

function deadlineStorageKey(email: string) {
  return `rycapp_otp_deadline_${email.toLowerCase()}`
}

function formatMmSs(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const LOGIN_REDIRECT_MS = 1800

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

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border-2 border-zinc-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col items-center gap-2">
          <img src={logoUrl} alt="R&C" className="h-14 w-auto object-contain" />
          <h1 className="text-xl font-extrabold text-brand-dark">Verificar correo</h1>
          <p className="text-center text-sm text-brand-muted">
            Ingresa el código de 6 dígitos que enviamos a tu correo. El código es válido por{' '}
            <strong className="text-brand-dark">2 minutos</strong>.
          </p>
        </div>

        {remainingSec !== null ? (
          <div
            className={[
              'mt-6 rounded-2xl border-2 px-4 py-3 text-center text-sm font-bold',
              remainingSec > 0
                ? 'border-brand-yellow/60 bg-brand-yellow/10 text-brand-dark'
                : 'border-red-200 bg-red-50 text-red-800',
            ].join(' ')}
          >
            {remainingSec > 0 ? (
              <>
                Tiempo restante para usar este código:{' '}
                <span className="tabular-nums">{formatMmSs(remainingSec)}</span>
              </>
            ) : (
              <>El tiempo del código enviado ha finalizado. Solicita un código nuevo.</>
            )}
          </div>
        ) : null}

        <form
          className="mt-8 space-y-4"
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
              notify.success('Correo verificado correctamente. Te redirigimos al inicio de sesión.')
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
          <Input label="Correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          <Input
            label="Código OTP"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ej. 042891"
            required
          />
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {message}
            </div>
          ) : null}
          <Button type="submit" className="w-full" loading={loading}>
            Verificar
          </Button>
        </form>

        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
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

        <div className="mt-6 text-center text-sm text-brand-muted">
          <Link to="/login" className="font-bold text-brand-dark underline">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
