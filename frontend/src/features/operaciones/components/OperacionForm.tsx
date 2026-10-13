import { useMemo, useState } from 'react'
import { getFieldErrors } from '../../../app/http/apiError'
import { isoStartOfDay } from '../../../shared/utils/format'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { Textarea } from '../../../shared/ui/Textarea'
import type { LineaNegocio } from '../../lineasNegocio/types'
import type { Material } from '../../materiales/types'
import type { Proveedor } from '../../proveedores/types'
import type { Vehiculo } from '../../vehiculos/types'

type Props = {
  catalogos: {
    lineas: LineaNegocio[]
    vehiculos: Vehiculo[]
    materiales: Material[]
    proveedores: Proveedor[]
  }
  usuarioRegistroLabel: string
  onCancel: () => void
  onSubmit: (payload: {
    lineaNegocioId: string
    vehiculoId: string
    materialId: string
    proveedorId: string
    fechaInicio: string
    fechaFin: string
    medioPago: string
    valor: number
    descripcion?: string
  }) => Promise<void>
}

export function OperacionForm({ catalogos, usuarioRegistroLabel, onCancel, onSubmit }: Props) {
  const [lineaNegocioId, setLineaNegocioId] = useState('')
  const [vehiculoId, setVehiculoId] = useState('')
  const [materialId, setMaterialId] = useState('')
  const [proveedorId, setProveedorId] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [medioPago, setMedioPago] = useState('')
  const [valor, setValor] = useState<number>(0)
  const [descripcion, setDescripcion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const hasCatalogos = useMemo(() => {
    return (
      catalogos.lineas.length > 0 &&
      catalogos.vehiculos.length > 0 &&
      catalogos.materiales.length > 0 &&
      catalogos.proveedores.length > 0
    )
  }, [catalogos])

  const vehiculoSeleccionado = useMemo(
    () => catalogos.vehiculos.find((v) => String(v.id) === vehiculoId) ?? null,
    [catalogos.vehiculos, vehiculoId],
  )

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        try {
          setIsSubmitting(true)
          setFieldErrors({})
          const errores: Record<string, string> = {}
          if (!fechaInicio) {
            errores.fechaInicio = 'La fecha de inicio es obligatoria.'
          }
          if (!fechaFin) {
            errores.fechaFin = 'La fecha fin es obligatoria.'
          }
          if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
            errores.fechaFin = 'La fecha fin debe ser posterior o igual a la fecha de inicio.'
          }
          if (Object.keys(errores).length > 0) {
            setFieldErrors(errores)
            return
          }
          await onSubmit({
            lineaNegocioId,
            vehiculoId,
            materialId,
            proveedorId,
            fechaInicio: isoStartOfDay(fechaInicio),
            fechaFin: isoStartOfDay(fechaFin),
            medioPago: medioPago.trim(),
            valor,
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
      <div className="text-sm font-semibold text-slate-900">
        Registrar venta
      </div>
      <div className="mt-1 text-sm text-slate-600">
        El usuario de registro se toma automáticamente de tu sesión. Línea, vehículo, material, cliente y las
        fechas de inicio y fin son obligatorios. La fecha fin no puede ser anterior a la de inicio.
      </div>

      {!hasCatalogos ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Completa catálogos activos: al menos una línea de negocio, un vehículo con conductor, un material y
          un cliente. Los registros desactivados no aparecen aquí.
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Usuario registro</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{usuarioRegistroLabel}</div>
        </div>

        <Select
          label="Línea de negocio"
          value={lineaNegocioId}
          onChange={(e) => setLineaNegocioId(e.target.value)}
          error={fieldErrors.lineaNegocioId}
        >
          <option value="">Seleccione...</option>
          {catalogos.lineas.map((x) => (
            <option key={x.id} value={x.id}>
              {x.lineaNegocio}
            </option>
          ))}
        </Select>

        <Select
          label="Vehículo"
          value={vehiculoId}
          onChange={(e) => setVehiculoId(e.target.value)}
          error={fieldErrors.vehiculoId}
        >
          <option value="">Seleccione...</option>
          {catalogos.vehiculos.map((x) => (
            <option key={x.id} value={x.id}>
              {x.placa} · {x.marca} {x.modelo}
            </option>
          ))}
        </Select>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Conductor del vehículo
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {vehiculoSeleccionado?.conductorNombre ??
              (vehiculoId ? 'Sin conductor asignado' : 'Seleccione un vehículo')}
          </div>
        </div>

        <Select
          label="Material (catálogo)"
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
          error={fieldErrors.materialId}
        >
          <option value="">Seleccione...</option>
          {catalogos.materiales.map((x) => (
            <option key={x.id} value={x.id}>
              {x.material}
            </option>
          ))}
        </Select>

        <Select
          label="Cliente"
          value={proveedorId}
          onChange={(e) => setProveedorId(e.target.value)}
          error={fieldErrors.proveedorId}
        >
          <option value="">Seleccione...</option>
          {catalogos.proveedores.map((x) => (
            <option key={x.id} value={x.id}>
              {x.nombre} · {x.nit}
            </option>
          ))}
        </Select>

        <Input
          label="Medio de pago"
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
          placeholder="Ej. Transferencia"
          error={fieldErrors.medioPago}
        />

        <Input
          label="Valor"
          type="number"
          value={Number.isFinite(valor) ? valor : 0}
          onChange={(e) => setValor(Number(e.target.value))}
          error={fieldErrors.valor}
        />

        <Input
          label="Fecha inicio"
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          error={fieldErrors.fechaInicio}
        />

        <Input
          label="Fecha fin"
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          error={fieldErrors.fechaFin}
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

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={!hasCatalogos}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
