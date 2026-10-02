import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './helpers/apiMock'
import { paso } from './helpers/pasos'

test.describe('Costos', () => {
  test('crea un tipo de costo y registra un costo administrativo', async ({ page }) => {
    await loginAsAdmin(page)

    await paso(page, '1. Abre tipos de costo vacíos', async () => {
      await page.getByRole('link', { name: 'Tipos de costo', exact: true }).click()
      await expect(page).toHaveURL(/\/tipos-costo/)
      await expect(page.getByRole('heading', { name: 'Tipos de costo', level: 1 })).toBeVisible()
      await expect(page.getByText('Aún no hay tipos de costo')).toBeVisible()
    })

    await paso(page, '2. Crea el tipo Papelería como administrativo', async () => {
      await page.getByRole('button', { name: '+ Nuevo tipo' }).click()
      await page.getByLabel('Tipo de costo').fill('Papelería')
      await page.getByLabel('Flujo').selectOption('ADMINISTRATIVO')
      await page.getByLabel('Descripción').fill('Insumos de oficina')
      await page.getByRole('button', { name: 'Guardar' }).click()
      await expect(page.getByText('Papelería')).toBeVisible()
      await expect(page.getByText('Administrativo').first()).toBeVisible()
      await expect(page.getByText('ACTIVO', { exact: true })).toBeVisible()
    })

    await paso(page, '3. Registra un costo administrativo de 150000', async () => {
      await page.getByRole('link', { name: 'Costos', exact: true }).click()
      await expect(page).toHaveURL(/\/costos$/)
      await expect(page.getByRole('heading', { name: 'Costos', level: 1 })).toBeVisible()
      await page.getByRole('button', { name: '+ Nuevo costo' }).click()
      await page.getByLabel('Categoría').selectOption('ADMINISTRATIVO')
      await page.getByLabel('Tipo de costo').selectOption({ label: 'Papelería' })
      await page.getByLabel('Medio de pago').fill('Transferencia')
      await page.getByLabel('Valor').fill('150000')
      await page.getByRole('button', { name: 'Guardar' }).click()
    })

    await paso(page, '4. El movimiento queda en la lista', async () => {
      await expect(page.getByRole('cell', { name: 'Papelería' })).toBeVisible()
      await expect(page.getByRole('cell', { name: 'Transferencia' })).toBeVisible()
      await expect(page.getByRole('cell', { name: /150\.?000/ })).toBeVisible()
    })
  })

  test('nómina exige usuario debitado y vehículo exige un vehículo', async ({ page }) => {
    await loginAsAdmin(page)

    await paso(page, '1. Crea los tipos Sueldo y Combustible', async () => {
      await page.getByRole('link', { name: 'Tipos de costo', exact: true }).click()
      await page.getByRole('button', { name: '+ Nuevo tipo' }).click()
      await page.getByLabel('Tipo de costo').fill('Sueldo')
      await page.getByLabel('Flujo').selectOption('NOMINA')
      await page.getByRole('button', { name: 'Guardar' }).click()
      await expect(page.getByText('Sueldo')).toBeVisible()

      await page.getByRole('button', { name: '+ Nuevo tipo' }).click()
      await page.getByLabel('Tipo de costo').fill('Combustible')
      await page.getByLabel('Flujo').selectOption('VEHICULO')
      await page.getByRole('button', { name: 'Guardar' }).click()
      await expect(page.getByText('Combustible')).toBeVisible()
    })

    await paso(page, '2. La nómina exige el usuario debitado', async () => {
      await page.getByRole('link', { name: 'Costos', exact: true }).click()
      await page.getByRole('button', { name: '+ Nuevo costo' }).click()
      await page.getByLabel('Categoría').selectOption('NOMINA')
      await page.getByLabel('Tipo de costo').selectOption({ label: 'Sueldo' })
      await page.getByLabel('Medio de pago').fill('Transferencia')
      await page.getByLabel('Valor').fill('800000')
      await page.getByRole('button', { name: 'Guardar' }).click()
      await expect(page.getByText('Debe asignar el usuario al que se le debita.')).toBeVisible()
    })

    await paso(page, '3. Al asignar el usuario, la nómina se guarda', async () => {
      await page.getByLabel('Usuario debitado').selectOption({ label: 'Sistema Inicial · 10000000' })
      await page.getByRole('button', { name: 'Guardar' }).click()
      await expect(page.getByRole('cell', { name: 'Sueldo' })).toBeVisible()
      await expect(page.getByRole('cell', { name: 'Sistema Inicial' })).toBeVisible()
    })

    await paso(page, '4. El costo de vehículo exige un vehículo', async () => {
      await page.getByRole('button', { name: '+ Nuevo costo' }).click()
      await page.getByLabel('Categoría').selectOption('VEHICULO')
      await page.getByLabel('Tipo de costo').selectOption({ label: 'Combustible' })
      await page.getByLabel('Medio de pago').fill('Efectivo')
      await page.getByLabel('Valor').fill('90000')
      await page.getByRole('button', { name: 'Guardar' }).click()
      await expect(page.getByText('Debe asignar el vehículo.')).toBeVisible()
    })

    await paso(page, '5. Al asignar ABC123, el costo se guarda', async () => {
      await page.getByRole('combobox', { name: /^Vehículo/ }).selectOption({ label: 'ABC123 · Chevrolet 2020' })
      await page.getByRole('button', { name: 'Guardar' }).click()
      await expect(page.getByRole('cell', { name: 'Combustible' })).toBeVisible()
      await expect(page.getByRole('cell', { name: 'ABC123' })).toBeVisible()
    })
  })
})
