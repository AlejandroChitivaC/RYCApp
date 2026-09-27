import { expect, test } from '@playwright/test'
import { loginAsAdmin, mockApi } from './helpers/apiMock'

test.describe('Navegación autenticada', () => {
  test('sin sesión redirige /dashboard a login', async ({ page }) => {
    await mockApi(page)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('abre líneas de negocio desde el menú', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole('link', { name: 'Líneas de negocio' }).click()
    await expect(page).toHaveURL(/\/lineas-negocio/)
    await expect(page.getByRole('heading', { name: 'Líneas de negocio', level: 1 })).toBeVisible()
    await expect(page.getByText('Transporte de agregados')).toBeVisible()
  })
})
