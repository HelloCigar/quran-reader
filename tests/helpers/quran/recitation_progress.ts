import type { Page } from 'playwright'

/** The thumb of the Recitation bar's progress bar. */
export function recitationThumb(page: Page) {
  return page.getByRole('slider', { name: 'Recitation progress', exact: true })
}

/** How close (in px) the thumb has to get to where the drag is going. */
const THUMB_NEAR = 1

/** How many times the drag corrects itself before it settles for where the thumb is. */
const CORRECTIONS = 5

/**
 * Presses the mouse on the thumb of the Recitation's progress bar and drags
 * the thumb to `fraction` of the way along its travel (0 to 1), which is that
 * fraction of the way through the Recitation, without letting go: the test
 * lets go with `page.mouse.up()`. Returns the Ayah Reference the thumb shows
 * (it reads `Ayah 2:255`).
 *
 * The thumb trails the mouse: a drag starts only once the mouse has moved a
 * little, and the thumb's travel is shorter than the bar by the thumb's own
 * width. So the drag goes on, as a reader's does, until the thumb is where it
 * should be, whatever the bar's width. A bar that counts in Ayahs moves its
 * thumb a whole Ayah at a time, so it can stop short of the exact place.
 */
export async function holdRecitationThumbAt(page: Page, fraction: number): Promise<string> {
  const thumb = recitationThumb(page)
  // The bar rises into place as it appears: hovering waits until the thumb holds still.
  await thumb.hover()
  const from = await thumb.boundingBox()
  // The track is the thumb's parent: the thumb travels from one end of it to the other.
  const track = await thumb.locator('xpath=..').boundingBox()
  if (!from || !track) throw new Error('The Recitation progress bar is not on screen')

  /** Where the thumb's centre goes. */
  const to = track.x + from.width / 2 + (track.width - from.width) * fraction
  const y = from.y + from.height / 2
  // Two frames: the thumb has moved and the page has seen it.
  const settle = () =>
    page.evaluate(
      `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`
    )
  /** Moves the mouse on by however far the thumb is short, up to `left` more times. */
  const correct = async (mouseX: number, left: number): Promise<void> => {
    await settle()
    const at = await thumb.boundingBox()
    if (!at) throw new Error('The Recitation progress bar left the screen during the drag')
    const short = to - (at.x + at.width / 2)
    if (left === 0 || Math.abs(short) <= THUMB_NEAR) return
    await page.mouse.move(mouseX + short, y, { steps: 2 })
    await correct(mouseX + short, left - 1)
  }

  await page.mouse.move(from.x + from.width / 2, y)
  await page.mouse.down()
  await page.mouse.move(to, y, { steps: 10 })
  await correct(to, CORRECTIONS)
  return ((await thumb.getAttribute('aria-valuetext')) ?? '').replace('Ayah ', '')
}

/** Waits until the progress bar says the Recitation has got past `ms` of its audio. */
export async function waitForRecitationPast(page: Page, ms: number) {
  await page.waitForFunction(
    `Number(document.querySelector('[role="slider"]')?.getAttribute('aria-valuenow')) > ${ms}`
  )
}
