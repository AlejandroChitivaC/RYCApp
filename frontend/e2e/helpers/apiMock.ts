import type { Page } from '@playwright/test'

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

export async function mockApi(page: Page): Promise<void> {
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
