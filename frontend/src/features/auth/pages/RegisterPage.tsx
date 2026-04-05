import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { authApi } from '../api'
import logoUrl from '../../../assets/logo.png'

export function RegisterPage() {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [cedula, setCedula] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border-2 border-zinc-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col items-center gap-2">
          <img src={logoUrl} alt="R&C" className="h-14 w-auto object-contain" />
          <h1 className="text-xl font-extrabold text-brand-dark">Crear cuenta</h1>
          <p className="text-center text-sm text-brand-muted">
            Recibirás un código OTP por correo (válido <strong className="text-brand-dark">2 minutos</strong>) para
            verificar tu cuenta.
          </p>
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
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
              navigate(
                `/verificar-correo?email=${encodeURIComponent(correo.trim())}&sent=1`,
              )
            } catch (err) {
              setError(getApiErrorMessage(err))
            } finally {
              setLoading(false)
            }
          }}
        >
          <Input label="Correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          <Input
            label="Contraseña (mín. 8 caracteres)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <Input label="Cédula" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
          <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <Input label="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}
          <Button type="submit" className="w-full" loading={loading}>
            Registrarme
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-brand-muted">
          <Link to="/login" className="font-bold text-brand-dark underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
