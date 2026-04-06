import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import {
  AuthCardIcon,
  AuthDarkField,
  AuthMailIcon,
  AuthUserIcon,
} from '../components/AuthDarkField'
import { PasswordFieldWithStrength, passwordMeetsPolicy } from '../components/PasswordFieldWithStrength'
import { RegistrationStepper } from '../components/RegistrationStepper'
import { AuthFooterStatus, AuthLogoHero, AuthSplitLayout } from '../components/AuthSplitLayout'
import { authApi } from '../api'

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-emerald-400/90" fill="currentColor" aria-hidden>
      <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Z" />
    </svg>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [cedula, setCedula] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [aceptoTerminos, setAceptoTerminos] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    correo.trim().length > 0 &&
    cedula.trim().length > 0 &&
    nombre.trim().length > 0 &&
    apellido.trim().length > 0 &&
    passwordMeetsPolicy(password) &&
    aceptoTerminos

  const year = new Date().getFullYear()

  return (
    <AuthSplitLayout
      left={
        <>
          <div>
            <AuthLogoHero />
            <h1 className="mt-10 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Únete a nuestro{' '}
              <span className="text-brand-yellow">equipo operativo</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400">
              Regístrate para acceder a las herramientas de gestión de transporte y logística. El proceso incluye
              verificación por correo y revisión por un administrador.
            </p>
            <div className="mt-10 max-w-md">
              <RegistrationStepper activeStep={1} />
            </div>
          </div>
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
              <IconShield />
              Tus datos están protegidos con buenas prácticas de seguridad.
            </p>
            <AuthFooterStatus leftText={`© R&C ${year} · Todos los derechos reservados`} />
          </div>
        </>
      }
      right={
        <div>
          <div className="mb-6 inline-flex items-center rounded-full bg-brand-yellow/15 px-4 py-2 text-xs font-extrabold text-brand-yellow ring-1 ring-brand-yellow/35">
            Código OTP válido por 2 minutos tras el registro
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Crear cuenta</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Completa los datos. Luego verificarás el correo; tu cuenta quedará pendiente hasta la activación por un
            administrador.
          </p>

          <div className="mt-8 rounded-2xl border border-zinc-800/90 bg-zinc-900/35 p-5 shadow-inner ring-1 ring-white/[0.04] sm:p-6">
            <form
              className="space-y-5"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!passwordMeetsPolicy(password) || !aceptoTerminos) return
                setError(null)
                setLoading(true)
                try {
                  await authApi.registro({
                    correo: correo.trim(),
                    password,
                    cedula: cedula.trim(),
                    nombre: nombre.trim(),
                    apellido: apellido.trim(),
                  })
                  navigate(`/verificar-correo?email=${encodeURIComponent(correo.trim())}&sent=1`)
                } catch (err) {
                  setError(getApiErrorMessage(err))
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

              <PasswordFieldWithStrength
                label="Contraseña (mín. 8 caracteres)"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />

              <AuthDarkField
                label="Cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Número de documento"
                required
                leftIcon={<AuthCardIcon />}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AuthDarkField
                  label="Nombre"
                  autoComplete="given-name"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre"
                  required
                  leftIcon={<AuthUserIcon />}
                />
                <AuthDarkField
                  label="Apellido"
                  autoComplete="family-name"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Apellido"
                  required
                  leftIcon={<AuthUserIcon />}
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-zinc-400">
                <input
                  type="checkbox"
                  checked={aceptoTerminos}
                  onChange={(e) => setAceptoTerminos(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-600 bg-zinc-800 text-brand-yellow focus:ring-2 focus:ring-brand-yellow/40"
                />
                <span>
                  Acepto los{' '}
                  <span className="font-semibold text-brand-yellow">términos y condiciones</span> y la{' '}
                  <span className="font-semibold text-brand-yellow">política de privacidad</span>.
                </span>
              </label>

              {error ? (
                <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                loading={loading}
                disabled={!canSubmit}
                className="w-full justify-center rounded-xl py-3.5 text-base font-extrabold shadow-lg shadow-brand-yellow/15"
              >
                Registrarme <span aria-hidden>→</span>
              </Button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-bold text-brand-yellow hover:text-amber-300 underline-offset-2 hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      }
    />
  )
}
