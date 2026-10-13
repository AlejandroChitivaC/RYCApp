import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './helpers/apiMock'
import { paso } from './helpers/pasos'

test.describe('Catálogos', () => {
  test('crea una línea de negocio y la ve en la lista', async ({ page }) => {
    await loginAsAdmin(page)

    await paso(page, '1. Abre líneas de negocio', async () => {
      await page.getByRole('link', { name: 'Líneas de negocio', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Líneas de negocio', level: 1 })).toBeVisible()
      await expect(page.getByText('Transporte de agregados')).toBeVisible()
    })

    await paso(page, '2. Registra Carga refrigerada', async () => {
      await page.getByRole('button', { name: '+ Nueva línea' }).click()
      await page.getByLabel('Línea de negocio').fill('Carga refrigerada')
      await page.getByLabel('Descripción').fill('Cadena de frío')
      await page.getByRole('button', { name: 'Guardar' }).click()
    })

    await paso(page, '3. La lista muestra la línea nueva', async () => {
      await expect(page.getByText('Carga refrigerada')).toBeVisible()
      await expect(page.getByText('Cadena de frío')).toBeVisible()
    })
  })

  test('crea un material y lo ve en la lista', async ({ page }) => {
    await loginAsAdmin(page)

    await paso(page, '1. Abre materiales', async () => {
      await page.getByRole('link', { name: 'Materiales', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Materiales', level: 1 })).toBeVisible()
      await expect(page.getByText('Sin materiales')).toBeVisible()
    })

    await paso(page, '2. Registra Arena de río', async () => {
      await page.getByRole('button', { name: '+ Nuevo material' }).click()
      await page.getByLabel('Material').fill('Arena de río')
      await page.getByLabel('Descripción').fill('Agregado fino')
      await page.getByRole('button', { name: 'Guardar' }).click()
    })

    await paso(page, '3. La lista muestra el material', async () => {
      await expect(page.getByText('Arena de río')).toBeVisible()
      await expect(page.getByText('Agregado fino')).toBeVisible()
    })
  })

  test('crea un cliente y lo ve en la lista', async ({ page }) => {
    await loginAsAdmin(page)

    await paso(page, '1. Abre clientes', async () => {
      await page.getByRole('link', { name: 'Clientes', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Clientes', level: 1 })).toBeVisible()
      await expect(page.getByText('Sin clientes')).toBeVisible()
    })

    await paso(page, '2. Registra Cantera Norte', async () => {
      await page.getByRole('button', { name: '+ Nuevo cliente' }).click()
      const form = page.locator('form')
      await form.getByLabel('Nombre').fill('Cantera Norte')
      await form.getByLabel('NIT').fill('900111222')
      await form.getByRole('combobox', { name: /^Departamento/ }).selectOption('Bogotá D.C.')
      await form.getByRole('combobox', { name: /^Municipio/ }).selectOption('Bogotá D.C.')
      await form.getByRole('button', { name: 'Guardar' }).click()
    })

    await paso(page, '3. La lista muestra el cliente', async () => {
      await expect(page.getByText('Cantera Norte')).toBeVisible()
      await expect(page.getByText('900111222')).toBeVisible()
    })
  })

  test('crea un vehículo y lo ve en la lista', async ({ page }) => {
    await loginAsAdmin(page)

    await paso(page, '1. Abre vehículos', async () => {
      await page.getByRole('link', { name: 'Vehículos', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Vehículos', level: 1 })).toBeVisible()
      await expect(page.getByText('ABC123')).toBeVisible()
    })

    await paso(page, '2. Registra la volqueta XYZ789', async () => {
      await page.getByRole('button', { name: '+ Nuevo vehículo' }).click()
      await page.getByLabel('Placa').fill('XYZ789')
      await page.getByLabel('Clase').fill('Volqueta')
      await page.getByLabel('Marca').fill('Kenworth')
      await page.getByLabel('Modelo').fill('2022')
      await page.getByLabel('Conductor (usuario)').selectOption({ label: 'Juan Ruta · 20000000' })
      await page.getByRole('button', { name: 'Guardar' }).click()
    })

    await paso(page, '3. La lista muestra el vehículo', async () => {
      await expect(page.getByText('XYZ789')).toBeVisible()
      await expect(page.getByText('Juan Ruta')).toBeVisible()
    })
  })

  test('crea un usuario y lo ve en la lista', async ({ page }) => {
    await loginAsAdmin(page)

    await paso(page, '1. Abre usuarios', async () => {
      await page.getByRole('link', { name: 'Usuarios', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Usuarios', level: 1 })).toBeVisible()
      await expect(page.getByRole('table').getByText('Sistema Inicial')).toBeVisible()
    })

    await paso(page, '2. Registra a Ana Prueba', async () => {
      await page.getByRole('button', { name: '+ Nuevo usuario' }).click()
      const form = page.locator('form')
      await form.getByRole('combobox', { name: /^Rol/ }).selectOption({ label: 'Conductor' })
      await form.getByLabel('Cédula').fill('30000000')
      await form.getByLabel('Nombre').fill('Ana')
      await form.getByLabel('Apellido').fill('Prueba')
      await form.getByRole('button', { name: 'Guardar' }).click()
    })

    await paso(page, '3. La lista muestra el usuario', async () => {
      await expect(page.getByText('Ana Prueba')).toBeVisible()
      await expect(page.getByText('30000000')).toBeVisible()
    })
  })
})
