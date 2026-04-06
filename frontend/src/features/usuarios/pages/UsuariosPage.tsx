import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { Select } from '../../../shared/ui/Select'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { useAuthStore } from '../../auth/store'
import { UsuarioForm } from '../components/UsuarioForm'
import type { Usuario, UsuarioPendienteActivacion } from '../types'
import { useUsuariosStore } from '../store'

export function UsuariosPage() {
  const authUser = useAuthStore((s) => s.user)
  const {
    items,
    roles,
    estadosEdicion,
    rolesActivacionRegistro,
    pendientesActivacion,
    isLoading,
    error,
    fetchAll,
    fetchPendientesActivacion,
    fetchRolesActivacionRegistro,
    activarCuenta,
    create,
    update,
  } = useUsuariosStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [activarOpen, setActivarOpen] = useState(false)
  const [activarTarget, setActivarTarget] = useState<UsuarioPendienteActivacion | null>(null)
  const [activarRolId, setActivarRolId] = useState('')

  const esAdmin = authUser?.rol === 'Administrador'

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    if (esAdmin) fetchPendientesActivacion()
  }, [esAdmin, fetchPendientesActivacion])

  useEffect(() => {
    if (esAdmin && activarOpen && rolesActivacionRegistro.length === 0) {
      fetchRolesActivacionRegistro()
    }
  }, [esAdmin, activarOpen, rolesActivacionRegistro.length, fetchRolesActivacionRegistro])

  useEffect(() => {
    if (activarOpen && rolesActivacionRegistro.length > 0 && !activarRolId) {
      setActivarRolId(String(rolesActivacionRegistro[0].id))
    }
  }, [activarOpen, rolesActivacionRegistro, activarRolId])

  const sorted = useMemo(() => [...items].sort((a, b) => b.id - a.id), [items])

  const rolNombre = useMemo(() => {
    const m = new Map<number, string>()
    for (const r of roles) m.set(r.id, r.descripcion)
    return m
  }, [roles])

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-dark">Usuarios</div>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Nuevo usuario
        </Button>
      </div>

      {esAdmin ? (
        <div className="mt-6 rounded-2xl border border-brand-yellow/40 bg-brand-yellow/10 p-4">
          <div className="text-sm font-bold text-brand-dark">Cuentas pendientes de activación</div>
          <p className="mt-1 text-sm text-brand-muted">
            Usuarios con rol temporal «Usuario registrado» que ya verificaron el correo. Al activar, debes asignar el rol
            definitivo: Conductor o Contador (el rol temporal deja de aplicarse).
          </p>
          {pendientesActivacion.length === 0 ? (
            <div className="mt-3 text-sm text-slate-600">No hay solicitudes pendientes.</div>
          ) : (
            <div className="mt-3">
              <Table>
              <THead>
                <tr>
                  <TH>Correo</TH>
                  <TH>Nombre</TH>
                  <TH>Cédula</TH>
                  <TH>Acción</TH>
                </tr>
              </THead>
              <TBody>
                {pendientesActivacion.map((p) => (
                  <tr key={p.id}>
                    <TD>{p.correo}</TD>
                    <TD>
                      {p.nombre} {p.apellido}
                    </TD>
                    <TD>{p.cedula}</TD>
                    <TD>
                      <Button
                        size="sm"
                        onClick={() => {
                          setActivarTarget(p)
                          setActivarRolId(
                            rolesActivacionRegistro[0] ? String(rolesActivacionRegistro[0].id) : '',
                          )
                          setActivarOpen(true)
                        }}
                      >
                        Activar cuenta
                      </Button>
                    </TD>
                  </tr>
                ))}
              </TBody>
              </Table>
            </div>
          )}
        </div>
      ) : null}

      <Modal
        open={activarOpen}
        title="Activar cuenta y asignar rol"
        onClose={() => {
          setActivarOpen(false)
          setActivarTarget(null)
          setActivarRolId('')
        }}
      >
        {activarTarget ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                {activarTarget.nombre} {activarTarget.apellido}
              </span>{' '}
              · {activarTarget.correo}
            </p>
            <Select
              label="Rol definitivo"
              value={activarRolId}
              onChange={(e) => setActivarRolId(e.target.value)}
            >
              {rolesActivacionRegistro.length === 0 ? (
                <option value="">Cargando roles…</option>
              ) : (
                rolesActivacionRegistro.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.descripcion}
                  </option>
                ))
              )}
            </Select>
            <p className="text-xs text-slate-500">
              Solo se permiten los roles indicados por el servidor para cuentas provenientes del registro público.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setActivarOpen(false)
                  setActivarTarget(null)
                  setActivarRolId('')
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={!activarRolId || rolesActivacionRegistro.length === 0}
                onClick={async () => {
                  if (!activarTarget || !activarRolId) return
                  await activarCuenta(activarTarget.id, Number(activarRolId))
                  await fetchPendientesActivacion()
                  setActivarOpen(false)
                  setActivarTarget(null)
                  setActivarRolId('')
                }}
              >
                Confirmar activación
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <div className="mt-6">
        {isLoading ? (
          <div className="h-40 w-full animate-pulse rounded-2xl bg-zinc-200" />
        ) : error ? (
          <EmptyState title="No se pudo cargar" description={error} />
        ) : sorted.length === 0 ? (
          <EmptyState title="Sin usuarios" description="Crea un usuario." />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>ID</TH>
                <TH>Cédula</TH>
                <TH>Nombre</TH>
                <TH>Rol</TH>
                <TH>Estado</TH>
                <TH>Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {sorted.map((x) => (
                <tr key={x.id} className="hover:bg-brand-yellow/5">
                  <TD>{x.id}</TD>
                  <TD>{x.cedula}</TD>
                  <TD>
                    {x.nombre} {x.apellido}
                  </TD>
                  <TD>{rolNombre.get(x.rolId) ?? `#${x.rolId}`}</TD>
                  <TD>{x.estado}</TD>
                  <TD>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditing(x)
                        setOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      <Modal open={open} title={editing ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setOpen(false)}>
        <UsuarioForm
          initial={editing}
          roles={roles}
          estadosEdicion={estadosEdicion}
          onCancel={() => setOpen(false)}
          onSubmit={async (payload) => {
            if (editing) {
              await update(editing.id, {
                rolId: payload.rolId,
                cedula: payload.cedula,
                nombre: payload.nombre,
                apellido: payload.apellido,
                estado: payload.estado ?? editing.estado,
              })
            } else {
              await create({
                rolId: payload.rolId,
                cedula: payload.cedula,
                nombre: payload.nombre,
                apellido: payload.apellido,
              })
            }
            setOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
