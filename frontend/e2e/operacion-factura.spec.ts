import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './helpers/apiMock'

const operacion = {
  id: 'op-1',
  usuarioRegistroId: '020bce2a-5c0f-4121-9b4b-69d09e644cc3',
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
}

const factura = {
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
}

test('asigna una factura de Siigo a una operación confirmada', async ({ page }) => {
  await loginAsAdmin(page)

  await page.route('**/api/operaciones**', async (route) => {
    const req = route.request()
    const path = new URL(req.url()).pathname
    if (path === '/api/operaciones/op-1/factura' && req.method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...operacion, facturaSiigo: 'FV-12', estadoPago: 'PENDIENTE' }),
      })
      return
    }
    if (path === '/api/operaciones' && req.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([operacion]),
      })
      return
    }
    await route.fallback()
  })

  await page.route('**/api/siigo/facturas', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([factura]),
    })
  })

  await page.goto('/operaciones')
  await page.getByRole('button', { name: 'Asignar factura' }).click()
  await page.getByLabel('Factura').selectOption({ index: 1 })
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByRole('cell', { name: 'FV-12' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cambiar factura' })).toBeVisible()
})
