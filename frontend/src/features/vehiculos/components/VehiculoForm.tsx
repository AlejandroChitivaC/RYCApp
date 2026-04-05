import { useMemo, useState } from 'react'
import { getFieldErrors } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import type { Vehiculo } from '../types'

type Props = {
  initial?: Vehiculo | null
  onCancel: () => void
  onSubmit: (payload: {
    placa: string
    clase: string
    marca: string
    modelo: string
  }) => Promise<void>
}

export function VehiculoForm({ initial, onCancel, onSubmit }: Props) {
  const [placa, setPlaca] = useState(initial?.placa ?? '')
  const [clase, setClase] = useState(initial?.clase ?? '')
  const [marca, setMarca] = useState(initial?.marca ?? '')
  const [modelo, setModelo] = useState(initial?.modelo ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const title = useMemo(
    () => (initial ? 'Editar vehículo' : 'Nuevo vehículo'),
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
            placa: placa.trim(),
            clase: clase.trim(),
            marca: marca.trim(),
            modelo: modelo.trim(),
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
          label="Placa"
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
          error={fieldErrors.placa}
        />
        <Input
          label="Clase"
          value={clase}
          onChange={(e) => setClase(e.target.value)}
          error={fieldErrors.clase}
        />
        <Input
          label="Marca"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          error={fieldErrors.marca}
        />
        <Input
          label="Modelo"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          error={fieldErrors.modelo}
        />
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
