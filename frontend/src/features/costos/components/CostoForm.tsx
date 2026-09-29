import { useMemo, useState } from 'react'
import { getFieldErrors } from '../../../app/http/apiError'
import { esActivo } from '../../auth/roles'
import { isoStartOfDay } from '../../../shared/utils/format'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { Textarea } from '../../../shared/ui/Textarea'
import type { Usuario } from '../../usuarios/types'
import type { Vehiculo } from '../../vehiculos/types'
import {
  CATEGORIAS_COSTO,
  labelCategoria,
  type CategoriaCosto,
  type CostoCreate,
  type TipoCosto,
} from '../types'

type Props = {
  categoriaInicial: CategoriaCosto | null
  tipos: TipoCosto[]
  usuarios: Usuario[]
  vehiculos: Vehiculo[]
  usuarioRegistroId: string
  usuarioRegistroLabel: string
  onCancel: () => void
  onSubmit: (payload: CostoCreate) => Promise<void>
}

export function CostoForm({
  categoriaInicial,
  tipos,
  usuarios,
  vehiculos,
  usuarioRegistroId,
  usuarioRegistroLabel,
  onCancel,
  onSubmit,
}: Props) {
  const [categoria, setCategoria] = useState<CategoriaCosto | ''>(categoriaInicial ?? '')
  const [tipoCostoId, setTipoCostoId] = useState('')
  const [usuarioDebitadoId, setUsuarioDebitadoId] = useState('')
  const [vehiculoId, setVehiculoId] = useState('')
  const [medioPago, setMedioPago] = useState('')
  const [valor, setValor] = useState('')
  const [motivo, setMotivo] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const tiposDelFlujo = useMemo(
    () => tipos.filter((t) => esActivo(t.estado) && t.flujo === categoria),
    [tipos, categoria],
  )
  const tipoSeleccionado = useMemo(
    () => tipos.find((t) => t.id === tipoCostoId) ?? null,
    [tipos, tipoCostoId],
  )
  const flujo = (tipoSeleccionado?.flujo || categoria).toUpperCase()
  const exigeUsuario = flujo === 'NOMINA'
  const exigeVehiculo = flujo === 'VEHICULO'
  const usuariosActivos = useMemo(() => usuarios.filter((u) => esActivo(u.estado)), [usuarios])
  const vehiculosActivos = useMemo(() => vehiculos.filter((v) => esActivo(v.estado)), [vehiculos])
  const pideFechas = flujo !== '' && flujo !== 'FINANCIERO'

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        try {
          setIsSubmitting(true)
          setFieldErrors({})
          const errores: Record<string, string> = {}
          if (!usuarioRegistroId) errores.usuarioRegistroId = 'No hay un usuario de sesión.'
          if (!categoria) errores.categoria = 'La categoría es obligatoria.'
          if (!tipoCostoId) errores.tipoCostoId = 'El tipo de costo es obligatorio.'
          if (!medioPago.trim()) errores.medioPago = 'El medio de pago es obligatorio.'
          const monto = Number(valor)
          if (!valor.trim() || !Number.isFinite(monto) || monto <= 0) {
            errores.valor = 'El valor debe ser mayor a 0.'
          }
          if (exigeUsuario && !usuarioDebitadoId) {
            errores.usuarioDebitadoId = 'Debe asignar el usuario al que se le debita.'
          }
          if (exigeVehiculo && !vehiculoId) {
            errores.vehiculoId = 'Debe asignar el vehículo.'
          }
          if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
            errores.fechaFin = 'La fecha fin debe ser posterior o igual a la fecha de inicio.'
          }
          if (Object.keys(errores).length > 0) {
            setFieldErrors(errores)
            return
          }
          await onSubmit({
            categoria: categoria as CategoriaCosto,
            usuarioRegistroId,
            tipoCostoId,
            usuarioDebitadoId: exigeUsuario ? usuarioDebitadoId : undefined,
            vehiculoId: exigeVehiculo ? vehiculoId : undefined,
            fechaInicio: pideFechas && fechaInicio ? isoStartOfDay(fechaInicio) : undefined,
            fechaFin: pideFechas && fechaFin ? isoStartOfDay(fechaFin) : undefined,
            medioPago: medioPago.trim(),
            valor: monto,
            motivo: exigeVehiculo ? motivo.trim() || undefined : undefined,
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
      <div className="text-sm font-semibold text-slate-900">Registrar costo</div>
      <p className="mt-1 text-sm text-slate-600">
        El usuario que registra el movimiento se toma de tu sesión. El tipo de costo debe estar activo y
        corresponder al flujo de la categoría.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Usuario registro</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{usuarioRegistroLabel}</div>
          {fieldErrors.usuarioRegistroId ? (
            <div className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.usuarioRegistroId}</div>
          ) : null}
        </div>

        <Select
          label="Categoría"
          value={categoria}
          disabled={categoriaInicial != null}
          onChange={(e) => {
            setCategoria(e.target.value as CategoriaCosto | '')
            setTipoCostoId('')
          }}
          error={fieldErrors.categoria}
        >
          <option value="">Seleccione...</option>
          {CATEGORIAS_COSTO.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>

        <Select
          label="Tipo de costo"
          value={tipoCostoId}
          onChange={(e) => setTipoCostoId(e.target.value)}
          error={fieldErrors.tipoCostoId}
          hint={
            categoria
              ? `Solo tipos activos del flujo ${labelCategoria(categoria)}.`
              : 'Selecciona el flujo del movimiento antes de elegir el tipo.'
          }
        >
          <option value="">Seleccione...</option>
          {tiposDelFlujo.map((t) => (
            <option key={t.id} value={t.id}>
              {t.tipoCosto}
            </option>
          ))}
        </Select>

        {exigeUsuario ? (
          <Select
            label="Usuario debitado"
            value={usuarioDebitadoId}
            onChange={(e) => setUsuarioDebitadoId(e.target.value)}
            error={fieldErrors.usuarioDebitadoId}
            hint="Obligatorio para nómina."
          >
            <option value="">Seleccione...</option>
            {usuariosActivos.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} {u.apellido} · {u.cedula}
              </option>
            ))}
          </Select>
        ) : null}

        {exigeVehiculo ? (
          <>
            <Select
              label="Vehículo"
              value={vehiculoId}
              onChange={(e) => setVehiculoId(e.target.value)}
              error={fieldErrors.vehiculoId}
              hint="Obligatorio: asigna la placa."
            >
              <option value="">Seleccione...</option>
              {vehiculosActivos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} · {v.marca} {v.modelo}
                </option>
              ))}
            </Select>
            <Input
              label="Motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Opcional"
              error={fieldErrors.motivo}
            />
          </>
        ) : null}

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
          min="0"
          step="1"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          error={fieldErrors.valor}
        />

        {pideFechas ? (
          <>
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
          </>
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

      {categoria && tiposDelFlujo.length === 0 ? (
        <p className="mt-3 text-sm text-amber-800">
          No hay tipos de costo activos para {labelCategoria(categoria)}. Créalos en Tipos de costo.
        </p>
      ) : null}

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
