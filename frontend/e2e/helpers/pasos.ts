import { test, type Page } from '@playwright/test'

/** Paso numerado del caso: la acción, la comprobación y un pantallazo quedan juntos en el reporte. */
export async function paso(page: Page, titulo: string, accion: () => Promise<void>): Promise<void> {
  await test.step(titulo, async () => {
    try {
      await accion()
    } finally {
      try {
        const png = await page.screenshot({ fullPage: true })
        // El nombre termina en .png. Si el título lleva un punto («1. Abre…»), el reporte
        // tomaría el resto —tildes incluidas— como extensión y esas rutas no se sirven.
        await test.info().attach(`${titulo}.png`, { body: png, contentType: 'image/png' })
      } catch {
        // Si la página ya se cerró, el fallo de la acción sigue siendo el resultado del paso.
      }
    }
  })
}
