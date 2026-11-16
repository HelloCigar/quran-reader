import type { Page } from 'playwright'

/** The thumb of the Recitation bar's progress bar. */
export function recitationThumb(page: Page) {
  return page.getByRole('slider', { name: 'Recitation progress', exact: true })
}

/**
 * Presses the mouse on the thumb of the Recitation's progress bar and drags
 * it to `fraction` of the way along (0 to 1), without letting go: the test
 * lets go with `page.mouse.up()`. Returns the Ayah Reference the thumb shows
 * (it reads `Ayah 2:255`).
 */
export async function holdRecitationThumbAt(page: Page, fraction: number): Promise<string> {
  const thumb = recitationThumb(page)
  const from = await thumb.boundingBox()
  // The track is the thumb's parent: the thumb travels its whole width.
  const track = await thumb.locator('xpath=..').boundingBox()
  if (!from || !track) throw new Error('The Recitation progress bar is not on screen')

  const y = from.y + from.height / 2
  await page.mouse.move(from.x + from.width / 2, y)
  await page.mouse.down()
  await page.mouse.move(track.x + track.width * fraction, y, { steps: 10 })
  // Two frames: the thumb has moved and the page has seen it.
  await page.evaluate(
    `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`
  )
  return ((await thumb.getAttribute('aria-valuetext')) ?? '').replace('Ayah ', '')
}

/** Waits until the progress bar says the Recitation has got past `ms` of its audio. */
export async function waitForRecitationPast(page: Page, ms: number) {
  await page.waitForFunction(
    `Number(document.querySelector('[role="slider"]')?.getAttribute('aria-valuenow')) > ${ms}`
  )
}
