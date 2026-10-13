import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './helpers/apiMock'
import { paso } from './helpers/pasos'

test('asigna una factura de Siigo y el historial muestra la operación', async ({ page }) => {
  await loginAsAdmin(page)

  await paso(page, '1. Abre la operación confirmada', async () => {
    await page.getByRole('navigation').getByRole('link', { name: 'Ventas', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Ventas', level: 1 })).toBeVisible()
    await expect(page.getByRole('table').getByText('Transporte de agregados')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Asignar factura' })).toBeVisible()
  })

  await paso(page, '2. Asigna la factura FV-12', async () => {
    await page.getByRole('button', { name: 'Asignar factura' }).click()
    await expect(page.getByRole('option', { name: /FV-12/ })).toBeAttached()
    await page.getByLabel('Factura').selectOption({ index: 1 })
    await page.getByRole('button', { name: 'Guardar', exact: true }).click()
    await expect(page.getByRole('cell', { name: 'FV-12' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cambiar factura' })).toBeVisible()
  })

  await paso(page, '3. El historial muestra esa operación con la factura', async () => {
    await page.getByRole('navigation').getByRole('link', { name: 'Historial de ventas', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Historial de ventas', level: 1 })).toBeVisible()
    await expect(page.getByText('Viaje de prueba')).toBeVisible()
    await expect(page.getByRole('cell', { name: 'FV-12' })).toBeVisible()
  })
})
