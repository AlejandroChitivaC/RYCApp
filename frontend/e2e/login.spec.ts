import { expect, test } from '@playwright/test'
import { ADMIN, loginAsAdmin, mockApi } from './helpers/apiMock'

test.describe('Login', () => {
  test('muestra el formulario de inicio de sesión', async ({ page }) => {
    await mockApi(page)
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
    await expect(page.getByLabel('Correo electrónico')).toBeVisible()
    await expect(page.getByPlaceholder('Ingresa tu contraseña')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Registrarse' })).toBeVisible()
  })

  test('rechaza credenciales inválidas', async ({ page }) => {
    await mockApi(page)
    await page.goto('/login')
    await page.getByLabel('Correo electrónico').fill(ADMIN.correo)
    await page.getByPlaceholder('Ingresa tu contraseña').fill('clave-incorrecta')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText('Credenciales inválidas')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('entra al dashboard con admin válido', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('main').getByText('Sistema Inicial')).toBeVisible()
  })

  test('cierra sesión y vuelve al login', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole('button', { name: 'Cerrar sesión' }).click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
  })
})
