import { useMemo, useState } from 'react'
import { getFieldErrors } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { Textarea } from '../../../shared/ui/Textarea'
import { CATEGORIAS_COSTO, type TipoCosto, type TipoCostoCreate, type TipoCostoUpdate } from '../types'
import { useTiposCostoStore } from '../store'

type Props = {
  initial?: TipoCosto | null
  onCancel: () => void
  onSubmit: (payload: TipoCostoCreate | TipoCostoUpdate) => Promise<void>
}

export function TipoCostoForm({ initial, onCancel, onSubmit }: Props) {
  const existentes = useTiposCostoStore((s) => s.items)
  const [tipoCosto, setTipoCosto] = useState(initial?.tipoCosto ?? '')
  const [flujo, setFlujo] = useState(initial?.flujo ?? '')
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '')
  const [estado, setEstado] = useState(initial?.estado ?? 'ACTIVO')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const title = useMemo(() => (initial ? 'Editar tipo de costo' : 'Nuevo tipo de costo'), [initial])

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        try {
          setIsSubmitting(true)
          setFieldErrors({})
          const nombre = tipoCosto.trim()
          const errores: Record<string, string> = {}
          if (!nombre) errores.tipoCosto = 'El tipo de costo es obligatorio.'
          if (!flujo) errores.flujo = 'El flujo es obligatorio.'
          const duplicado = existentes.some(
            (x) =>
              x.tipoCosto.trim().toLowerCase() === nombre.toLowerCase() &&
              x.flujo === flujo &&
              x.id !== initial?.id,
          )
          if (duplicado) {
            errores.tipoCosto = 'Ya existe un tipo de costo con ese nombre en el mismo flujo.'
          }
          if (Object.keys(errores).length > 0) {
            setFieldErrors(errores)
            return
          }
          const payload: TipoCostoCreate = {
            tipoCosto: nombre,
            flujo,
            descripcion: descripcion.trim() || undefined,
          }
          await onSubmit(initial ? { ...payload, estado } : payload)
        } catch (err) {
          const fe = getFieldErrors(err)
          if (fe) setFieldErrors(fe)
        } finally {
          setIsSubmitting(false)
        }
      }}
    >
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <p className="mt-1 text-sm text-slate-600">
        El flujo indica a qué categoría de costo pertenece este tipo: nómina, administrativo, vehículo o
        financiero.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Tipo de costo"
          value={tipoCosto}
          onChange={(e) => setTipoCosto(e.target.value)}
          placeholder="Ej. Combustible"
          error={fieldErrors.tipoCosto}
        />
        <Select
          label="Flujo"
          value={flujo}
          onChange={(e) => setFlujo(e.target.value)}
          error={fieldErrors.flujo}
        >
          <option value="">Seleccione...</option>
          {CATEGORIAS_COSTO.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
        {initial ? (
          <Select
            label="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            error={fieldErrors.estado}
          >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </Select>
        ) : null}
        <div className="sm:col-span-2">
          <Textarea
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Opcional"
            rows={3}
            error={fieldErrors.descripcion}
          />
        </div>
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
