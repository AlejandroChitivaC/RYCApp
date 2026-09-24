import { useEffect, useMemo, useState } from 'react'
import { getFieldErrors } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import type { Rol, Usuario } from '../types'

type Props = {
  initial?: Usuario | null
  roles: Rol[]
  estadosEdicion: string[]
  onCancel: () => void
  onSubmit: (payload: {
    rolId: string
    cedula: string
    nombre: string
    apellido: string
    estado?: string
  }) => Promise<void>
}

export function UsuarioForm({ initial, roles, estadosEdicion, onCancel, onSubmit }: Props) {
  const [rolId, setRolId] = useState(initial ? String(initial.rolId) : '')
  const [cedula, setCedula] = useState(initial?.cedula ?? '')
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [apellido, setApellido] = useState(initial?.apellido ?? '')
  const [estado, setEstado] = useState(initial?.estado ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setRolId(initial ? String(initial.rolId) : '')
    setCedula(initial?.cedula ?? '')
    setNombre(initial?.nombre ?? '')
    setApellido(initial?.apellido ?? '')
    setEstado(initial?.estado ?? '')
  }, [initial])

  const opcionesEstado = useMemo(() => {
    const set = new Set(estadosEdicion)
    const list = [...estadosEdicion]
    if (initial?.estado && !set.has(initial.estado)) {
      list.unshift(initial.estado)
    }
    return list
  }, [estadosEdicion, initial?.estado])

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
            rolId: rolId,
            cedula: cedula.trim(),
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            ...(initial ? { estado } : {}),
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
          <div className="sm:col-span-2">
            <Select
              label="Estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              error={fieldErrors.estado}
            >
              {opcionesEstado.length === 0 ? (
                <option value="">Cargando catálogo...</option>
              ) : (
                opcionesEstado.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))
              )}
            </Select>
            <p className="mt-1 text-xs text-slate-500">
              Solo puedes elegir valores definidos por el sistema (catálogo del servidor).
            </p>
          </div>
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
