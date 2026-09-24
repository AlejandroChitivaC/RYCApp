import { useMemo, useState } from 'react'
import { getFieldErrors } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Textarea } from '../../../shared/ui/Textarea'
import type { Material } from '../types'
import { useMaterialesStore } from '../store'

type Props = {
  initial?: Material | null
  onCancel: () => void
  onSubmit: (payload: { material: string; descripcion?: string }) => Promise<void>
}

export function MaterialForm({ initial, onCancel, onSubmit }: Props) {
  const [material, setMaterial] = useState(initial?.material ?? '')
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const existentes = useMaterialesStore((s) => s.items)

  const title = useMemo(() => (initial ? 'Editar material' : 'Nuevo material'), [initial])

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        try {
          setIsSubmitting(true)
          setFieldErrors({})
          const nombre = material.trim()
          const duplicado = existentes.some(
            (x) =>
              x.material.trim().toLowerCase() === nombre.toLowerCase() &&
              x.id !== initial?.id,
          )
          if (duplicado) {
            setFieldErrors({ material: 'Ya existe un material con ese nombre.' })
            return
          }
          await onSubmit({
            material: nombre,
            descripcion: descripcion.trim() || undefined,
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
      <div className="mt-4 grid grid-cols-1 gap-4">
        <Input
          label="Material"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          error={fieldErrors.material}
        />
        <Textarea
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          error={fieldErrors.descripcion}
        />
      </div>
      <div className="mt-6 flex justify-end gap-2">
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
