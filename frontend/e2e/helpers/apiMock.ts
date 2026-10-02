import type { Page, Request, Route } from '@playwright/test'

export const ADMIN = {
  correo: 'admin@rycapp.local',
  password: 'Admin1234!',
}

export const CONDUCTOR = {
  correo: 'conductor@rycapp.local',
  password: 'Conductor1234!',
}

const adminUser = {
  id: '020bce2a-5c0f-4121-9b4b-69d09e644cc3',
  correo: ADMIN.correo,
  nombre: 'Sistema',
  apellido: 'Inicial',
  rol: 'Administrador',
}

const conductorAuth = {
  id: 'conductor-1',
  correo: CONDUCTOR.correo,
  nombre: 'Juan',
  apellido: 'Ruta',
  rol: 'Conductor',
}

const emptyDashboard = {
  operaciones: 0,
  ingresos: '0',
  costos: '0',
  utilidad: '0',
  serieMensual: [],
  porLinea: [],
}

type JsonRecord = Record<string, unknown>

const roles = [
  { id: 'rol-admin', descripcion: 'Administrador' },
  { id: 'rol-conductor', descripcion: 'Conductor' },
]

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

async function pushCosto(route: Route, req: Request, bucket: JsonRecord[], extra: string[]) {
  const body = req.postDataJSON() as JsonRecord
  const created: JsonRecord = {
    id: `costo-${bucket.length + 1}`,
    usuarioRegistroId: body.usuarioRegistroId,
    tipoCostoId: body.tipoCostoId,
    fechaInsercion: new Date().toISOString(),
    medioPago: body.medioPago,
    valor: body.valor,
    descripcion: body.descripcion ?? null,
  }
  for (const key of extra) created[key] = body[key] ?? null
  bucket.push(created)
  await json(route, created, 201)
}

function createdTipo(body: JsonRecord, id: string) {
  return {
    id,
    tipoCosto: body.tipoCosto,
    flujo: body.flujo,
    descripcion: body.descripcion ?? null,
    estado: 'ACTIVO',
  }
}

export async function mockApi(page: Page): Promise<void> {
  const tipos: JsonRecord[] = []
  const nominas: JsonRecord[] = []
  const administrativos: JsonRecord[] = []
  const costosVehiculo: JsonRecord[] = []
  const financieros: JsonRecord[] = []

  const lineas: JsonRecord[] = [
    {
      id: 'linea-1',
      lineaNegocio: 'Transporte de agregados',
      descripcion: 'Línea de prueba',
      estado: 'ACTIVO',
    },
  ]
  const materiales: JsonRecord[] = []
  const proveedores: JsonRecord[] = []
  const usuarios: JsonRecord[] = [
    {
      id: adminUser.id,
      rolId: 'rol-admin',
      cedula: '10000000',
      nombre: 'Sistema',
      apellido: 'Inicial',
      estado: 'ACTIVO',
    },
    {
      id: conductorAuth.id,
      rolId: 'rol-conductor',
      cedula: '20000000',
      nombre: 'Juan',
      apellido: 'Ruta',
      estado: 'ACTIVO',
    },
  ]
  const vehiculos: JsonRecord[] = [
    {
      id: 'veh-1',
      placa: 'ABC123',
      clase: 'Camión',
      marca: 'Chevrolet',
      modelo: '2020',
      estado: 'ACTIVO',
      conductorId: adminUser.id,
      conductorNombre: 'Sistema Inicial',
    },
  ]
  const operaciones: JsonRecord[] = [
    {
      id: 'op-1',
      usuarioRegistroId: adminUser.id,
      lineaNegocioId: 'linea-1',
      vehiculoId: 'veh-1',
      materialId: 'mat-1',
      proveedorId: 'prov-1',
      fechaInsercion: '2026-09-28T12:00:00.000Z',
      fechaInicio: '2026-09-28T00:00:00.000Z',
      fechaFin: '2026-09-28T00:00:00.000Z',
      medioPago: 'Transferencia',
      valor: '100000',
      descripcion: 'Viaje de prueba',
      estado: 'CONFIRMADA',
      estadoPago: null,
      facturaSiigo: null,
    },
  ]
  const facturas: JsonRecord[] = [
    {
      id: 'fac-1',
      operacionId: null,
      siigoInvoiceId: 'siigo-1',
      numero: 'FV-12',
      prefijo: 'FV',
      fecha: '2026-09-01',
      fechaVencimiento: '2026-09-30',
      identificacionCliente: '900123',
      nombreCliente: 'Cliente Demo',
      total: '100000',
      saldo: '100000',
      estadoPago: 'PENDIENTE',
      observaciones: null,
      fechaSincronizacion: '2026-09-28T00:00:00.000Z',
    },
  ]
  const tickets: JsonRecord[] = []

  await page.route('**/api/**', async (route) => {
    const req = route.request()
    const method = req.method()
    const path = new URL(req.url()).pathname

    if (path === '/api/auth/login' && method === 'POST') {
      const body = req.postDataJSON() as { correo?: string; password?: string }
      const match =
        body.correo === ADMIN.correo && body.password === ADMIN.password
          ? adminUser
          : body.correo === CONDUCTOR.correo && body.password === CONDUCTOR.password
            ? conductorAuth
            : null
      if (match) {
        await json(route, {
          accessToken: 'e2e-token',
          tokenType: 'Bearer',
          expiresInMinutes: 720,
          usuario: match,
        })
        return
      }
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 401,
          message: 'Credenciales inválidas',
          code: 'BAD_CREDENTIALS',
        }),
      })
      return
    }

    if (path === '/api/reportes/dashboard' && method === 'GET') {
      await json(route, emptyDashboard)
      return
    }

    if (path === '/api/lineas-negocio' && method === 'GET') {
      await json(route, lineas)
      return
    }
    if (path === '/api/lineas-negocio' && method === 'POST') {
      const body = req.postDataJSON() as JsonRecord
      const created = {
        id: `linea-${lineas.length + 1}`,
        lineaNegocio: body.lineaNegocio,
        descripcion: body.descripcion ?? null,
        estado: 'ACTIVO',
      }
      lineas.push(created)
      await json(route, created, 201)
      return
    }

    if (path === '/api/materiales' && method === 'GET') {
      await json(route, materiales)
      return
    }
    if (path === '/api/materiales' && method === 'POST') {
      const body = req.postDataJSON() as JsonRecord
      const created = {
        id: `mat-${materiales.length + 1}`,
        material: body.material,
        descripcion: body.descripcion ?? null,
      }
      materiales.push(created)
      await json(route, created, 201)
      return
    }

    if (path === '/api/proveedores' && method === 'GET') {
      await json(route, proveedores)
      return
    }
    if (path === '/api/proveedores' && method === 'POST') {
      const body = req.postDataJSON() as JsonRecord
      const created = {
        id: `prov-${proveedores.length + 1}`,
        nombre: body.nombre,
        nit: body.nit,
        departamento: body.departamento ?? null,
        municipio: body.municipio ?? null,
        descripcion: body.descripcion ?? null,
        estado: 'ACTIVO',
      }
      proveedores.push(created)
      await json(route, created, 201)
      return
    }

    if (path === '/api/roles' && method === 'GET') {
      await json(route, roles)
      return
    }
    if (path === '/api/usuarios/catalogo/estados-edicion' && method === 'GET') {
      await json(route, ['ACTIVO', 'INACTIVO'])
      return
    }
    if (path === '/api/usuarios/conductores' && method === 'GET') {
      await json(
        route,
        usuarios.filter((u) => u.rolId === 'rol-conductor'),
      )
      return
    }
    if (path === '/api/usuarios' && method === 'GET') {
      await json(route, usuarios)
      return
    }
    if (path === '/api/usuarios' && method === 'POST') {
      const body = req.postDataJSON() as JsonRecord
      const created = {
        id: `usr-${usuarios.length + 1}`,
        rolId: body.rolId,
        cedula: body.cedula,
        nombre: body.nombre,
        apellido: body.apellido,
        estado: 'ACTIVO',
      }
      usuarios.push(created)
      await json(route, created, 201)
      return
    }

    if (path === '/api/vehiculos' && method === 'GET') {
      await json(route, vehiculos)
      return
    }
    if (path === '/api/vehiculos' && method === 'POST') {
      const body = req.postDataJSON() as JsonRecord
      const conductor = usuarios.find((u) => u.id === body.conductorId)
      const created = {
        id: `veh-${vehiculos.length + 1}`,
        placa: body.placa,
        clase: body.clase,
        marca: body.marca,
        modelo: body.modelo,
        estado: 'ACTIVO',
        conductorId: body.conductorId,
        conductorNombre: conductor ? `${conductor.nombre} ${conductor.apellido}` : null,
      }
      vehiculos.push(created)
      await json(route, created, 201)
      return
    }

    if (path === '/api/operaciones' && method === 'GET') {
      await json(route, operaciones)
      return
    }
    if (path === '/api/operaciones/historial' && method === 'GET') {
      await json(route, operaciones)
      return
    }
    if (/^\/api\/operaciones\/[^/]+\/factura$/.test(path) && method === 'POST') {
      const id = path.split('/')[3]
      const body = req.postDataJSON() as { facturaId?: string }
      const op = operaciones.find((o) => o.id === id)
      const fac = facturas.find((f) => f.id === body.facturaId)
      if (op && fac) {
        op.facturaSiigo = fac.numero
        op.estadoPago = fac.estadoPago
      }
      await json(route, op ?? {})
      return
    }

    if (path === '/api/siigo/facturas' && method === 'GET') {
      await json(route, facturas)
      return
    }

    if (path === '/api/tickets' && method === 'GET') {
      await json(route, tickets)
      return
    }
    if (path === '/api/tickets' && method === 'POST') {
      const created = {
        id: `ticket-${tickets.length + 1}`,
        operacionId: 'op-1',
        usuarioCargaId: adminUser.id,
        numeroTicket: 'TK-E2E',
        nombreArchivoOriginal: 'ticket.png',
        tipoContenidoOriginal: 'image/png',
        tamanoBytesOriginal: 68,
        fechaCarga: new Date().toISOString(),
      }
      tickets.unshift(created)
      await json(route, created, 201)
      return
    }

    if (path === '/api/tipos-costo' && method === 'GET') {
      await json(route, tipos)
      return
    }
    if (path === '/api/tipos-costo' && method === 'POST') {
      const body = req.postDataJSON() as JsonRecord
      const created = createdTipo(body, `tipo-${tipos.length + 1}`)
      tipos.push(created)
      await json(route, created, 201)
      return
    }
    if (path.startsWith('/api/tipos-costo/') && method === 'PUT') {
      const id = path.split('/').pop()
      const body = req.postDataJSON() as JsonRecord
      const idx = tipos.findIndex((t) => t.id === id)
      const updated = { ...body, id, descripcion: body.descripcion ?? null }
      if (idx >= 0) tipos[idx] = updated
      await json(route, updated)
      return
    }

    if (path === '/api/nominas' && method === 'GET') {
      await json(route, nominas)
      return
    }
    if (path === '/api/costos-administrativos' && method === 'GET') {
      await json(route, administrativos)
      return
    }
    if (path === '/api/costos-vehiculo' && method === 'GET') {
      await json(route, costosVehiculo)
      return
    }
    if (path === '/api/costos-financieros' && method === 'GET') {
      await json(route, financieros)
      return
    }
    if (path === '/api/nominas' && method === 'POST') {
      await pushCosto(route, req, nominas, ['usuarioDebitadoId', 'fechaInicio', 'fechaFin'])
      return
    }
    if (path === '/api/costos-administrativos' && method === 'POST') {
      await pushCosto(route, req, administrativos, ['fechaInicio', 'fechaFin'])
      return
    }
    if (path === '/api/costos-vehiculo' && method === 'POST') {
      await pushCosto(route, req, costosVehiculo, ['vehiculoId', 'fechaInicio', 'fechaFin', 'motivo'])
      return
    }
    if (path === '/api/costos-financieros' && method === 'POST') {
      await pushCosto(route, req, financieros, [])
      return
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]',
      })
      return
    }

    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Ruta no mockeada en e2e' }),
    })
  })
}

export async function loginAs(
  page: Page,
  creds: { correo: string; password: string } = ADMIN,
): Promise<void> {
  await mockApi(page)
  await page.goto('/login')
  await page.getByLabel('Correo electrónico').fill(creds.correo)
  await page.getByPlaceholder('Ingresa tu contraseña').fill(creds.password)
  await page.getByRole('button', { name: /entrar/i }).click()
  const inicio = creds.correo === CONDUCTOR.correo ? '**/tickets' : '**/dashboard'
  await page.waitForURL(inicio)
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await loginAs(page, ADMIN)
}
