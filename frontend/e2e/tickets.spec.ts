import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './helpers/apiMock'
import { paso } from './helpers/pasos'

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

test('el ticket exige operación e imagen y luego aparece en la lista', async ({ page }) => {
  await loginAsAdmin(page)

  await paso(page, '1. Abre tickets', async () => {
    await page.getByRole('navigation').getByRole('link', { name: 'Tickets', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Tickets', level: 1 })).toBeVisible()
    await expect(page.getByText('Sin tickets')).toBeVisible()
  })

  await paso(page, '2. Sin imagen, el formulario no deja cargar', async () => {
    await page.getByRole('button', { name: '+ Cargar ticket' }).click()
    await expect(page.locator('form').getByText('Cargar ticket digital')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cargar ticket', exact: true })).toBeDisabled()
  })

  await paso(page, '3. Con imagen y sin operación, pide la operación', async () => {
    await page.locator('input[type="file"]').setInputFiles({
      name: 'ticket.png',
      mimeType: 'image/png',
      buffer: png,
    })
    await expect(page.getByText('ticket.png')).toBeVisible()
    await page.getByRole('button', { name: 'Cargar ticket', exact: true }).click()
    await expect(page.getByText('Selecciona una operación.')).toBeVisible()
  })

  await paso(page, '4. Al cargar la imagen, la lista muestra el ticket', async () => {
    await page.getByLabel('Operación asociada').selectOption('op-1')
    await page.getByLabel('Número de ticket (opcional)').fill('TK-E2E')
    await page.getByRole('button', { name: 'Cargar ticket', exact: true }).click()
    await expect(page.getByRole('cell', { name: 'TK-E2E' })).toBeVisible()
    await expect(page.getByText('ticket.png')).toBeVisible()
  })
})
