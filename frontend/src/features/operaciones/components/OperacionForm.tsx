import { useEffect, useMemo, useState } from 'react'
import { getFieldErrors } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { Textarea } from '../../../shared/ui/Textarea'
import type { LineaNegocio } from '../../lineasNegocio/types'
import type { Material } from '../../materiales/types'
import type { Proveedor } from '../../proveedores/types'
import type { Usuario } from '../../usuarios/types'
import type { Vehiculo } from '../../vehiculos/types'

type Props = {
  catalogos: {
    lineas: LineaNegocio[]
    usuarios: Usuario[]
    vehiculos: Vehiculo[]
    materiales: Material[]
    proveedores: Proveedor[]
  }
  onCancel: () => void
  onSubmit: (payload: {
    usuarioRegistroId: number
    lineaNegocioId: number
    vehiculoId: number
    materialId: number
    proveedorId: number
    fechaInicio?: string
    fechaFin?: string
    medioPago: string
    valor: number
    descripcion?: string
  }) => Promise<void>
}

export function OperacionForm({ catalogos, onCancel, onSubmit }: Props) {
  const defaultUsuarioId = useMemo(() => {
    const u = catalogos.usuarios[0]
    return u ? String(u.id) : ''
  }, [catalogos.usuarios])

  const [usuarioRegistroId, setUsuarioRegistroId] = useState(defaultUsuarioId)
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

  useEffect(() => {
    if (!usuarioRegistroId && defaultUsuarioId) {
      setUsuarioRegistroId(defaultUsuarioId)
    }
  }, [defaultUsuarioId, usuarioRegistroId])

  const hasCatalogos = useMemo(() => {
    return (
      catalogos.lineas.length > 0 &&
      catalogos.usuarios.length > 0 &&
      catalogos.vehiculos.length > 0 &&
      catalogos.materiales.length > 0 &&
      catalogos.proveedores.length > 0
    )
  }, [catalogos])

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        try {
          setIsSubmitting(true)
          setFieldErrors({})
          await onSubmit({
            usuarioRegistroId: Number(usuarioRegistroId),
            lineaNegocioId: Number(lineaNegocioId),
            vehiculoId: Number(vehiculoId),
            materialId: Number(materialId),
            proveedorId: Number(proveedorId),
            fechaInicio: fechaInicio
              ? new Date(fechaInicio).toISOString()
              : undefined,
            fechaFin: fechaFin ? new Date(fechaFin).toISOString() : undefined,
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
        Registrar operación (Operaciones_Lineas_Negocio)
      </div>
      <div className="mt-1 text-sm text-slate-600">
        Usuario de registro, línea, vehículo, material y proveedor son obligatorios en el modelo ER.
      </div>

      {!hasCatalogos ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Completa catálogos: al menos una línea de negocio, usuario, vehículo, material y proveedor.
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Usuario registro"
          value={usuarioRegistroId}
          onChange={(e) => setUsuarioRegistroId(e.target.value)}
          error={fieldErrors.usuarioRegistroId}
        >
          <option value="">Seleccione...</option>
          {catalogos.usuarios.map((x) => (
            <option key={x.id} value={x.id}>
              {x.nombre} {x.apellido} · {x.cedula}
            </option>
          ))}
        </Select>

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
          label="Proveedor"
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
          label="Fecha inicio (opcional)"
          type="datetime-local"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          error={fieldErrors.fechaInicio}
        />

        <Input
          label="Fecha fin (opcional)"
          type="datetime-local"
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
