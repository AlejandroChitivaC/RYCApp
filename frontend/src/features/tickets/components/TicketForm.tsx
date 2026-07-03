import { useRef, useState } from 'react'
import { getApiErrorMessage } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import type { Operacion } from '../../operaciones/types'

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp']
const MAX_BYTES = 10 * 1024 * 1024

type Props = {
  operaciones: Operacion[]
  onCancel: () => void
  onSubmit: (formData: FormData) => Promise<void>
}

export function TicketForm({ operaciones, onCancel, onSubmit }: Props) {
  const [operacionId, setOperacionId] = useState('')
  const [numeroTicket, setNumeroTicket] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [archivoError, setArchivoError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function validarArchivo(file: File): string {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return `Solo se permiten imágenes (JPEG, PNG, GIF, BMP). Tipo seleccionado: ${file.type || 'desconocido'}.`
    }
    if (file.size > MAX_BYTES) {
      return 'El archivo supera el tamaño máximo permitido de 10 MB.'
    }
    if (file.size === 0) {
      return 'El archivo no puede estar vacío.'
    }
    return ''
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setArchivo(file)
    setArchivoError(file ? validarArchivo(file) : '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorGeneral('')

    if (!archivo) {
      setArchivoError('Selecciona una imagen.')
      return
    }
    const err = validarArchivo(archivo)
    if (err) {
      setArchivoError(err)
      return
    }
    if (!operacionId) {
      setErrorGeneral('Selecciona una operación.')
      return
    }

    const formData = new FormData()
    formData.append('operacionId', operacionId)
    if (numeroTicket.trim()) formData.append('numeroTicket', numeroTicket.trim())
    formData.append('archivo', archivo)

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
    } catch (e) {
      setErrorGeneral(getApiErrorMessage(e))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-sm font-semibold text-slate-900">Cargar ticket digital</div>
      <div className="mt-1 text-sm text-slate-600">
        Solo se permiten imágenes (JPEG, PNG, GIF, BMP) de hasta 10 MB. La imagen se convierte automáticamente a PDF.
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Select
            label="Operación asociada"
            value={operacionId}
            onChange={(e) => setOperacionId(e.target.value)}
          >
            <option value="">Seleccione una operación...</option>
            {operaciones.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.id} — {new Date(o.fechaInsercion).toLocaleDateString()} · ${o.valor}
              </option>
            ))}
          </Select>
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Número de ticket (opcional)"
            value={numeroTicket}
            onChange={(e) => setNumeroTicket(e.target.value)}
            placeholder="Ej. TK-2024-001"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Imagen del ticket
          </label>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/bmp"
            className="hidden"
            onChange={handleFileChange}
          />
          <div
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-brand-yellow hover:bg-brand-yellow/5"
            onClick={() => inputRef.current?.click()}
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-yellow/20">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-dark" fill="none">
                <path
                  d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M12 4v12M8 8l4-4 4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              {archivo ? (
                <div>
                  <div className="truncate text-sm font-semibold text-slate-900">{archivo.name}</div>
                  <div className="text-xs text-slate-500">
                    {(archivo.size / 1024).toFixed(1)} KB · {archivo.type}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-semibold text-slate-700">Seleccionar imagen</div>
                  <div className="text-xs text-slate-500">JPEG, PNG, GIF, BMP — máx. 10 MB</div>
                </div>
              )}
            </div>
          </div>
          {archivoError ? (
            <p className="mt-1 text-xs text-red-600">{archivoError}</p>
          ) : null}
        </div>
      </div>

      {errorGeneral ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorGeneral}
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={!archivo || !!archivoError}>
          Cargar ticket
        </Button>
      </div>
    </form>
  )
}
