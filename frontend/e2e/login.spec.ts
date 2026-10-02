import { expect, test } from '@playwright/test'
import { ADMIN, loginAsAdmin, mockApi } from './helpers/apiMock'
import { paso } from './helpers/pasos'

test.describe('Auth', () => {
  test('muestra el formulario de acceso', async ({ page }) => {
    await mockApi(page)

    await paso(page, '1. Abre el login', async () => {
      await page.goto('/login')
      await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
    })

    await paso(page, '2. Muestra correo, contraseña y el botón Entrar', async () => {
      await expect(page.getByLabel('Correo electrónico')).toBeVisible()
      await expect(page.getByPlaceholder('Ingresa tu contraseña')).toBeVisible()
      await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
    })
  })

  test('rechaza credenciales inválidas', async ({ page }) => {
    await mockApi(page)
    await page.goto('/login')

    await paso(page, '1. Envía un correo y una contraseña que no existen', async () => {
      await page.getByLabel('Correo electrónico').fill('nadie@rycapp.local')
      await page.getByPlaceholder('Ingresa tu contraseña').fill('clave-mala')
      await page.getByRole('button', { name: /entrar/i }).click()
      await expect(page.getByText('Credenciales inválidas')).toBeVisible()
      await expect(page).toHaveURL(/\/login/)
    })
  })

  test('entra al dashboard con el administrador', async ({ page }) => {
    await mockApi(page)
    await page.goto('/login')

    await paso(page, '1. Ingresa el correo y la contraseña del administrador', async () => {
      await page.getByLabel('Correo electrónico').fill(ADMIN.correo)
      await page.getByPlaceholder('Ingresa tu contraseña').fill(ADMIN.password)
      await page.getByRole('button', { name: /entrar/i }).click()
      await page.waitForURL('**/dashboard')
    })

    await paso(page, '2. Ve el dashboard con el nombre del usuario', async () => {
      await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible()
      await expect(page.getByRole('main').getByText('Sistema Inicial')).toBeVisible()
    })
  })

  test('cierra la sesión y vuelve al login', async ({ page }) => {
    await loginAsAdmin(page)

    await paso(page, '1. Pulsa Cerrar sesión', async () => {
      await page.getByRole('button', { name: 'Cerrar sesión' }).click()
      await page.waitForURL('**/login')
      await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
    })
  })

  test('sin sesión, el dashboard redirige al login', async ({ page }) => {
    await paso(page, '1. Abre el dashboard sin haber iniciado sesión', async () => {
      await page.goto('/dashboard')
      await page.waitForURL('**/login')
      await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
    })
  })

  test('el registro muestra la validación de la contraseña', async ({ page }) => {
    await paso(page, '1. Abre el registro', async () => {
      await page.goto('/registro')
      await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible()
    })

    await paso(page, '2. Una contraseña corta deja el alta deshabilitada', async () => {
      await page.getByLabel('Contraseña (mín. 8 caracteres)').fill('abc')
      await expect(page.getByText('Mínimo 8 caracteres')).toBeVisible()
      await expect(page.getByRole('button', { name: /registrarme/i })).toBeDisabled()
    })
  })

  test('la recuperación de contraseña pide el correo', async ({ page }) => {
    await paso(page, '1. Abre recuperar contraseña', async () => {
      await page.goto('/recuperar-contrasena')
      await expect(page.getByRole('heading', { name: /recupera el acceso/i })).toBeVisible()
    })

    await paso(page, '2. Muestra el correo y el envío del código', async () => {
      await expect(page.getByLabel('Correo electrónico')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Enviar código OTP' })).toBeVisible()
    })
  })
})
