import { useMemo, useState } from 'react'
import { getFieldErrors } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Textarea } from '../../../shared/ui/Textarea'
import type { LineaNegocio } from '../types'

type Props = {
  initial?: LineaNegocio | null
  onCancel: () => void
  onSubmit: (payload: { lineaNegocio: string; descripcion?: string }) => Promise<void>
}

export function LineaNegocioForm({ initial, onCancel, onSubmit }: Props) {
  const [lineaNegocio, setLineaNegocio] = useState(initial?.lineaNegocio ?? '')
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const title = useMemo(
    () => (initial ? 'Editar línea de negocio' : 'Nueva línea de negocio'),
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
            lineaNegocio: lineaNegocio.trim(),
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
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Línea de negocio"
          value={lineaNegocio}
          onChange={(e) => setLineaNegocio(e.target.value)}
          placeholder="Ej. Transporte de carga"
          error={fieldErrors.lineaNegocio}
        />
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
