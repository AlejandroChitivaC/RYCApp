import { useState } from 'react'
import { getApiErrorMessage } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { loading, notify } from '../../../shared/notify/notiflix'
import { siigoApi } from '../api'
import { SiigoActivityLog } from '../components/SiigoActivityLog'
import {
  clearSiigoLogs,
  createSiigoLogEntry,
  loadSiigoLogs,
  saveSiigoLogs,
} from '../logStorage'
import type { SiigoConsulta, SiigoHealth, SiigoLogEntry } from '../types'

function healthDetail(result: SiigoHealth) {
  return [
    `configured=${result.configured}`,
    `tokenType=${result.tokenType ?? '—'}`,
    `expiresInSeconds=${result.expiresInSeconds ?? '—'}`,
  ].join('\n')
}

function consultaDetail(result: SiigoConsulta) {
  const docs = result.documentTypes
    .slice(0, 5)
    .map((d) => `  - #${d.id} ${d.name ?? '—'} ${d.prefix ? `(${d.prefix})` : ''}`)
    .join('\n')
  const users = result.usersSample
    .slice(0, 5)
    .map((u) => `  - #${u.id} ${u.username ?? '—'} ${u.email ? `<${u.email}>` : ''}`)
    .join('\n')
  return [
    `baseUrl=${result.baseUrl ?? '—'}`,
    `partnerId=${result.partnerId ?? '—'}`,
    `username=${result.username ?? '—'}`,
    `tiposFV=${result.documentTypesCount}`,
    `usuarios=${result.usersTotal}`,
    docs ? `tipos:\n${docs}` : null,
    users ? `usuarios muestra:\n${users}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export function SiigoConnectionPage() {
  const [health, setHealth] = useState<SiigoHealth | null>(null)
  const [consulta, setConsulta] = useState<SiigoConsulta | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isConsulting, setIsConsulting] = useState(false)
  const [logs, setLogs] = useState<SiigoLogEntry[]>(() => loadSiigoLogs())

  function pushLog(entry: SiigoLogEntry) {
    setLogs((prev) => {
      const next = [entry, ...prev].slice(0, 40)
      saveSiigoLogs(next)
      return next
    })
  }

  async function handleHealthCheck() {
    setIsChecking(true)
    loading.show('Probando autenticación con Siigo...')
    try {
      const result = await siigoApi.health()
      setHealth(result)
      if (result.connected) {
        notify.success(result.message)
        pushLog(
          createSiigoLogEntry({
            action: 'HEALTH',
            level: 'success',
            title: 'Autenticación exitosa',
            message: result.message,
            detail: healthDetail(result),
          }),
        )
      } else if (!result.configured) {
        notify.warning(result.message)
        pushLog(
          createSiigoLogEntry({
            action: 'HEALTH',
            level: 'warning',
            title: 'Credenciales no configuradas',
            message: result.message,
            detail: healthDetail(result),
          }),
        )
      } else {
        notify.failure(result.message)
        pushLog(
          createSiigoLogEntry({
            action: 'HEALTH',
            level: 'error',
            title: 'Autenticación fallida',
            message: result.message,
            detail: healthDetail(result),
          }),
        )
      }
    } catch (e) {
      setHealth(null)
      const msg = getApiErrorMessage(e)
      notify.failure(msg)
      pushLog(
        createSiigoLogEntry({
          action: 'HEALTH',
          level: 'error',
          title: 'Error al llamar /api/siigo/health',
          message: msg,
        }),
      )
    } finally {
      loading.remove()
      setIsChecking(false)
    }
  }

  async function handleConsulta() {
    setIsConsulting(true)
    loading.show('Consultando catálogos en Siigo...')
    try {
      const result = await siigoApi.consulta()
      setConsulta(result)
      if (result.ok) {
        notify.success(result.message)
        pushLog(
          createSiigoLogEntry({
            action: 'CONSULTA',
            level: 'success',
            title: `Cuenta OK · ${result.documentTypesCount} tipos FV · ${result.usersTotal} usuarios`,
            message: result.message,
            detail: consultaDetail(result),
          }),
        )
      } else if (!result.configured) {
        notify.warning(result.message)
        pushLog(
          createSiigoLogEntry({
            action: 'CONSULTA',
            level: 'warning',
            title: 'Credenciales no configuradas',
            message: result.message,
            detail: consultaDetail(result),
          }),
        )
      } else {
        notify.failure(result.message)
        pushLog(
          createSiigoLogEntry({
            action: 'CONSULTA',
            level: 'error',
            title: 'Consulta fallida',
            message: result.message,
            detail: consultaDetail(result),
          }),
        )
      }
    } catch (e) {
      setConsulta(null)
      const msg = getApiErrorMessage(e)
      notify.failure(msg)
      pushLog(
        createSiigoLogEntry({
          action: 'CONSULTA',
          level: 'error',
          title: 'Error al llamar /api/siigo/consulta',
          message: msg,
        }),
      )
    } finally {
      loading.remove()
      setIsConsulting(false)
    }
  }

  return (
    <div>
      <PageListToolbar
        title="Integración Siigo"
        description="Autenticación y consulta de solo lectura para verificar que RYCApp habla con la cuenta correcta de Siigo Nube."
      />

      <div className="mt-6 grid max-w-4xl gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-zinc-900">1. Autenticación</div>
          <p className="mt-1 text-sm text-zinc-600">
            Obtiene un token JWT de Siigo (<code className="text-xs">GET /api/siigo/health</code>).
          </p>
          <div className="mt-4">
            <Button
              className="rounded-xl px-5"
              loading={isChecking}
              onClick={() => void handleHealthCheck()}
            >
              Probar conexión
            </Button>
          </div>

          {health ? (
            <div
              className={[
                'mt-5 rounded-xl border px-4 py-3 text-sm',
                health.connected
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-amber-200 bg-amber-50 text-amber-950',
              ].join(' ')}
            >
              <div className="font-bold">{health.connected ? 'Conectado' : 'Sin conexión'}</div>
              <div className="mt-1">{health.message}</div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="font-semibold uppercase tracking-wide opacity-70">Configurado</dt>
                  <dd className="font-semibold">{health.configured ? 'Sí' : 'No'}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide opacity-70">Tipo token</dt>
                  <dd className="font-semibold">{health.tokenType ?? '—'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="font-semibold uppercase tracking-wide opacity-70">Expira en</dt>
                  <dd className="font-semibold">
                    {health.expiresInSeconds != null
                      ? `${health.expiresInSeconds} s (~${Math.round(health.expiresInSeconds / 3600)} h)`
                      : '—'}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-zinc-900">2. Consulta de cuenta</div>
          <p className="mt-1 text-sm text-zinc-600">
            Llama a catálogos reales de Siigo (<code className="text-xs">GET /api/siigo/consulta</code>):
            tipos de factura FV y usuarios. Compara con lo que ves en Siigo Nube.
          </p>
          <div className="mt-4">
            <Button
              className="rounded-xl px-5"
              loading={isConsulting}
              onClick={() => void handleConsulta()}
            >
              Consultar cuenta
            </Button>
          </div>

          {consulta ? (
            <div
              className={[
                'mt-5 rounded-xl border px-4 py-3 text-sm',
                consulta.ok
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-amber-200 bg-amber-50 text-amber-950',
              ].join(' ')}
            >
              <div className="font-bold">{consulta.ok ? 'Consulta OK' : 'Consulta fallida'}</div>
              <div className="mt-1">{consulta.message}</div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="font-semibold uppercase tracking-wide opacity-70">Base URL</dt>
                  <dd className="break-all font-semibold">{consulta.baseUrl ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide opacity-70">Partner-Id</dt>
                  <dd className="font-semibold">{consulta.partnerId ?? '—'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="font-semibold uppercase tracking-wide opacity-70">Usuario API</dt>
                  <dd className="break-all font-semibold">{consulta.username ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide opacity-70">Tipos FV</dt>
                  <dd className="font-semibold">{consulta.documentTypesCount}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide opacity-70">Usuarios</dt>
                  <dd className="font-semibold">{consulta.usersTotal}</dd>
                </div>
              </dl>

              {consulta.documentTypes.length > 0 ? (
                <div className="mt-3">
                  <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
                    Tipos de factura (FV)
                  </div>
                  <ul className="mt-1 space-y-1 text-xs">
                    {consulta.documentTypes.map((d) => (
                      <li key={d.id}>
                        <span className="font-semibold">#{d.id}</span> {d.name ?? '—'}
                        {d.prefix ? ` · ${d.prefix}` : ''}
                        {!d.active ? ' (inactivo)' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {consulta.usersSample.length > 0 ? (
                <div className="mt-3">
                  <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
                    Usuarios (muestra)
                  </div>
                  <ul className="mt-1 space-y-1 text-xs">
                    {consulta.usersSample.map((u) => (
                      <li key={u.id}>
                        <span className="font-semibold">#{u.id}</span> {u.username ?? '—'}
                        {u.email ? ` · ${u.email}` : ''}
                        {!u.active ? ' (inactivo)' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <SiigoActivityLog
        entries={logs}
        onClear={() => {
          clearSiigoLogs()
          setLogs([])
        }}
      />
    </div>
  )
}
