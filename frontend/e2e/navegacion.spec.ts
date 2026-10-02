import { expect, test } from '@playwright/test'
import { CONDUCTOR, loginAs, loginAsAdmin } from './helpers/apiMock'
import { paso } from './helpers/pasos'

const menu = [
  { etiqueta: 'Dashboard', ruta: /\/dashboard$/ },
  { etiqueta: 'Líneas de negocio', ruta: /\/lineas-negocio$/ },
  { etiqueta: 'Usuarios', ruta: /\/usuarios$/ },
  { etiqueta: 'Materiales', ruta: /\/materiales$/ },
  { etiqueta: 'Proveedores', ruta: /\/proveedores$/ },
  { etiqueta: 'Vehículos', ruta: /\/vehiculos$/ },
  { etiqueta: 'Costos', ruta: /\/costos$/ },
  { etiqueta: 'Tipos de costo', ruta: /\/tipos-costo$/ },
  { etiqueta: 'Operaciones', ruta: /\/operaciones$/ },
  { etiqueta: 'Historial de operaciones', ruta: /\/historial-operaciones$/ },
  { etiqueta: 'Tickets', ruta: /\/tickets$/ },
  { etiqueta: 'Siigo', ruta: /\/siigo$/ },
]

test.describe('Menú', () => {
  test('cada ítem del administrador abre su pantalla', async ({ page }) => {
    await loginAsAdmin(page)

    for (const [i, item] of menu.entries()) {
      await paso(page, `${i + 1}. Abre ${item.etiqueta}`, async () => {
        await page.getByRole('navigation').getByRole('link', { name: item.etiqueta, exact: true }).click()
        await expect(page).toHaveURL(item.ruta)
        await expect(page.getByRole('heading', { name: item.etiqueta, level: 1 })).toBeVisible()
      })
    }
  })
})

test.describe('Roles', () => {
  test('el conductor no entra a historial, consulta de tickets ni Siigo', async ({ page }) => {
    await loginAs(page, CONDUCTOR)

    await paso(page, '1. El menú oculta historial y Siigo', async () => {
      await expect(page.getByRole('link', { name: 'Historial de operaciones' })).toHaveCount(0)
      await expect(page.getByRole('link', { name: 'Siigo', exact: true })).toHaveCount(0)
      await expect(page.getByRole('link', { name: 'Tickets', exact: true })).toBeVisible()
    })

    await paso(page, '2. En tickets no ve la consulta, solo la carga', async () => {
      await page.getByRole('link', { name: 'Tickets', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Tickets', level: 1 })).toBeVisible()
      await expect(page.getByRole('button', { name: '+ Cargar ticket' })).toBeVisible()
      await expect(page.getByText(/reservada a administración y contabilidad/i)).toBeVisible()
      await expect(page.getByLabel('Filtrar por operación')).toHaveCount(0)
    })

    await paso(page, '3. Una ruta directa a Siigo no muestra esa pantalla', async () => {
      await page.goto('/siigo')
      await page.waitForURL('**/dashboard')
      await expect(page.getByRole('heading', { name: 'Integración Siigo' })).toHaveCount(0)
      await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()
    })

    await paso(page, '4. Una ruta directa al historial vuelve al dashboard', async () => {
      await page.goto('/historial-operaciones')
      await page.waitForURL('**/dashboard')
      await expect(page.getByRole('heading', { name: 'Historial de operaciones', level: 1 })).toHaveCount(0)
    })
  })
})
