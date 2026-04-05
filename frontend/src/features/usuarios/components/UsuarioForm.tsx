import { useMemo, useState } from 'react'
import { getFieldErrors } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import type { Rol, Usuario } from '../types'

type Props = {
  initial?: Usuario | null
  roles: Rol[]
  onCancel: () => void
  onSubmit: (payload: {
    rolId: number
    cedula: string
    nombre: string
    apellido: string
    estado?: string
  }) => Promise<void>
}

export function UsuarioForm({ initial, roles, onCancel, onSubmit }: Props) {
  const [rolId, setRolId] = useState(initial ? String(initial.rolId) : '')
  const [cedula, setCedula] = useState(initial?.cedula ?? '')
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [apellido, setApellido] = useState(initial?.apellido ?? '')
  const [estado, setEstado] = useState(initial?.estado ?? 'ACTIVO')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const title = useMemo(
    () => (initial ? 'Editar usuario' : 'Nuevo usuario'),
    [initial],
  )

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        try {
          setIsSubmitting(true)
          setFieldErrors({})
          await onSubmit({
            rolId: Number(rolId),
            cedula: cedula.trim(),
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            ...(initial ? { estado: estado.trim() } : {}),
          })
        } catch (err) {
          const fe = getFieldErrors(err)
          if (fe) setFieldErrors(fe)
        } finally {
          setIsSubmitting(false)
        }
      }}
    >
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Rol"
          value={rolId}
          onChange={(e) => setRolId(e.target.value)}
          error={fieldErrors.rolId}
        >
          <option value="">Seleccione...</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.descripcion}
            </option>
          ))}
        </Select>
        <Input
          label="Cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          error={fieldErrors.cedula}
        />
        <Input
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          error={fieldErrors.nombre}
        />
        <Input
          label="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          error={fieldErrors.apellido}
        />
        {initial ? (
          <Input
            label="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            error={fieldErrors.estado}
          />
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
