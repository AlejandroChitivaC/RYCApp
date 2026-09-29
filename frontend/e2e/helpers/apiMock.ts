import type { Page, Request, Route } from '@playwright/test'

export const ADMIN = {
  correo: 'admin@rycapp.local',
  password: 'Admin1234!',
}

const adminUser = {
  id: '020bce2a-5c0f-4121-9b4b-69d09e644cc3',
  correo: ADMIN.correo,
  nombre: 'Sistema',
  apellido: 'Inicial',
  rol: 'Administrador',
}

const emptyDashboard = {
  operaciones: 0,
  ingresos: '0',
  costos: '0',
  utilidad: '0',
  serieMensual: [],
  porLinea: [],
}

const lineas = [
  {
    id: 'linea-1',
    lineaNegocio: 'Transporte de agregados',
    descripcion: 'Línea de prueba',
    estado: 'ACTIVO',
  },
]

type JsonRecord = Record<string, unknown>

async function json(route: Route, body: unknown) {
  await route.fulfill({
    status: 200,
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
  await route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify(created),
  })
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

  await page.route('**/api/**', async (route) => {
    const req = route.request()
    const method = req.method()
    const path = new URL(req.url()).pathname

    if (path === '/api/auth/login' && method === 'POST') {
      const body = req.postDataJSON() as { correo?: string; password?: string }
      if (body.correo === ADMIN.correo && body.password === ADMIN.password) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            accessToken: 'e2e-token',
            tokenType: 'Bearer',
            expiresInMinutes: 720,
            usuario: adminUser,
          }),
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
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyDashboard),
      })
      return
    }

    if (path === '/api/lineas-negocio' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(lineas),
      })
      return
    }

    if (path === '/api/usuarios' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: adminUser.id,
            rolId: 'rol-admin',
            cedula: '10000000',
            nombre: 'Sistema',
            apellido: 'Inicial',
            estado: 'ACTIVO',
          },
        ]),
      })
      return
    }

    if (path === '/api/vehiculos' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
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
        ]),
      })
      return
    }

    if (path === '/api/tipos-costo' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(tipos),
      })
      return
    }

    if (path === '/api/tipos-costo' && method === 'POST') {
      const body = req.postDataJSON() as JsonRecord
      const created = createdTipo(body, `tipo-${tipos.length + 1}`)
      tipos.push(created)
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      })
      return
    }

    if (path.startsWith('/api/tipos-costo/') && method === 'PUT') {
      const id = path.split('/').pop()
      const body = req.postDataJSON() as JsonRecord
      const idx = tipos.findIndex((t) => t.id === id)
      const updated = { ...body, id, descripcion: body.descripcion ?? null }
      if (idx >= 0) tipos[idx] = updated
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updated),
      })
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

export async function loginAsAdmin(page: Page): Promise<void> {
  await mockApi(page)
  await page.goto('/login')
  await page.getByLabel('Correo electrónico').fill(ADMIN.correo)
  await page.getByPlaceholder('Ingresa tu contraseña').fill(ADMIN.password)
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL('**/dashboard')
}
