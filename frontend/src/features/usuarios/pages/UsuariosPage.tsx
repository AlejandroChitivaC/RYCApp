import { useEffect, useMemo, useState } from 'react'
import { useLayoutSearch } from '../../../app/shell/LayoutSearchContext'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { Select } from '../../../shared/ui/Select'
import { StatusBadge } from '../../../shared/ui/StatusBadge'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { useAuthStore } from '../../auth/store'
import { UsuarioForm } from '../components/UsuarioForm'
import type { Usuario, UsuarioPendienteActivacion } from '../types'
import { useUsuariosStore } from '../store'

function matchesUsuario(
  x: Usuario,
  q: string,
  rolNombre: Map<string, string>,
) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  const rol = (rolNombre.get(x.rolId) ?? '').toLowerCase()
  return (
    String(x.id).includes(s) ||
    x.cedula.toLowerCase().includes(s) ||
    x.nombre.toLowerCase().includes(s) ||
    x.apellido.toLowerCase().includes(s) ||
    String(x.estado).toLowerCase().includes(s) ||
    rol.includes(s)
  )
}

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
  const { query: layoutQuery } = useLayoutSearch()
  const [tableQuery, setTableQuery] = useState('')

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

  const sorted = useMemo(() => [...items].sort((a, b) => b.id.localeCompare(a.id)), [items])

  const rolNombre = useMemo(() => {
    const m = new Map<string, string>()
    for (const r of roles) m.set(r.id, r.descripcion)
    return m
  }, [roles])

  const filteredUsuarios = useMemo(
    () =>
      sorted.filter(
        (x) => matchesUsuario(x, layoutQuery, rolNombre) && matchesUsuario(x, tableQuery, rolNombre),
      ),
    [sorted, layoutQuery, tableQuery, rolNombre],
  )

  return (
    <div>
      {esAdmin ? (
        <div className="mb-8 rounded-2xl border border-zinc-200/90 bg-brand-yellow-soft/50 p-4 shadow-sm ring-1 ring-amber-200/40">
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
                  await activarCuenta(activarTarget.id, activarRolId)
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

      <PageListToolbar
        title="Usuarios del sistema"
        description="Alta, edición y gestión de roles y estados."
        tableSearch={{ value: tableQuery, onChange: setTableQuery }}
        action={
          <Button
            className="rounded-xl px-5"
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            + Nuevo usuario
          </Button>
        }
      />

      <div className="mt-2">
        {isLoading ? (
          <div className="h-40 w-full animate-pulse rounded-2xl bg-zinc-100" />
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
                <TH className="text-right">Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {filteredUsuarios.map((x) => (
                <tr key={x.id} className="hover:bg-brand-yellow/[0.06]">
                  <TD className="tabular-nums text-zinc-600">{x.id}</TD>
                  <TD>{x.cedula}</TD>
                  <TD>
                    <span className="font-medium">
                      {x.nombre} {x.apellido}
                    </span>
                  </TD>
                  <TD>{rolNombre.get(x.rolId) ?? `#${x.rolId}`}</TD>
                  <TD>
                    <StatusBadge>{String(x.estado).replace(/_/g, ' ')}</StatusBadge>
                  </TD>
                  <TD className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-xl border-zinc-200"
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
