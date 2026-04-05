import { useMemo, useState } from 'react'
import { getFieldErrors } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Textarea } from '../../../shared/ui/Textarea'
import type { Proveedor } from '../types'

type Props = {
  initial?: Proveedor | null
  onCancel: () => void
  onSubmit: (payload: {
    nombre: string
    nit: string
    departamento?: string
    municipio?: string
    descripcion?: string
  }) => Promise<void>
}

export function ProveedorForm({ initial, onCancel, onSubmit }: Props) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [nit, setNit] = useState(initial?.nit ?? '')
  const [departamento, setDepartamento] = useState(initial?.departamento ?? '')
  const [municipio, setMunicipio] = useState(initial?.municipio ?? '')
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const title = useMemo(() => (initial ? 'Editar proveedor' : 'Nuevo proveedor'), [initial])

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        try {
          setIsSubmitting(true)
          setFieldErrors({})
          await onSubmit({
            nombre: nombre.trim(),
            nit: nit.trim(),
            departamento: departamento.trim() || undefined,
            municipio: municipio.trim() || undefined,
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
        <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} error={fieldErrors.nombre} />
        <Input label="NIT" value={nit} onChange={(e) => setNit(e.target.value)} error={fieldErrors.nit} />
        <Input
          label="Departamento"
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
          error={fieldErrors.departamento}
        />
        <Input
          label="Municipio"
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          error={fieldErrors.municipio}
        />
        <div className="sm:col-span-2">
          <Textarea
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            error={fieldErrors.descripcion}
          />
        </div>
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
