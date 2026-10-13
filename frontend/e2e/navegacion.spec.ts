import { expect, test } from '@playwright/test'
import { CONDUCTOR, loginAs, loginAsAdmin } from './helpers/apiMock'
import { paso } from './helpers/pasos'

const menu = [
  { etiqueta: 'Dashboard', ruta: /\/dashboard$/ },
  { etiqueta: 'Líneas de negocio', ruta: /\/lineas-negocio$/ },
  { etiqueta: 'Usuarios', ruta: /\/usuarios$/ },
  { etiqueta: 'Materiales', ruta: /\/materiales$/ },
  { etiqueta: 'Clientes', ruta: /\/proveedores$/ },
  { etiqueta: 'Vehículos', ruta: /\/vehiculos$/ },
  { etiqueta: 'Costos', ruta: /\/costos$/ },
  { etiqueta: 'Tipos de costo', ruta: /\/tipos-costo$/ },
  { etiqueta: 'Ventas', ruta: /\/operaciones$/ },
  { etiqueta: 'Historial de ventas', ruta: /\/historial-operaciones$/ },
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
  test('el conductor entra por tickets y no ve historial ni Siigo', async ({ page }) => {
    await loginAs(page, CONDUCTOR)

    await paso(page, '1. Entra a Tickets y el menú no muestra historial ni Siigo', async () => {
      await expect(page).toHaveURL(/\/tickets$/)
      await expect(page.getByRole('heading', { name: 'Tickets', level: 1 })).toBeVisible()
      await expect(page.getByRole('navigation').getByRole('link', { name: 'Tickets', exact: true })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Historial de ventas' })).toHaveCount(0)
      await expect(page.getByRole('link', { name: 'Siigo', exact: true })).toHaveCount(0)
      await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).toHaveCount(0)
    })

    await paso(page, '2. Puede cargar un ticket', async () => {
      await expect(page.getByRole('button', { name: '+ Cargar ticket' })).toBeVisible()
    })

    await paso(page, '3. Una ruta directa a Siigo vuelve a Tickets', async () => {
      await page.goto('/siigo')
      await page.waitForURL('**/tickets')
      await expect(page.getByRole('heading', { name: 'Integración Siigo' })).toHaveCount(0)
      await expect(page.getByRole('heading', { name: 'Tickets', level: 1 })).toBeVisible()
    })

    await paso(page, '4. Una ruta directa al historial vuelve a Tickets', async () => {
      await page.goto('/historial-operaciones')
      await page.waitForURL('**/tickets')
      await expect(page.getByRole('heading', { name: 'Historial de ventas', level: 1 })).toHaveCount(0)
      await expect(page.getByRole('heading', { name: 'Tickets', level: 1 })).toBeVisible()
    })
  })
})
