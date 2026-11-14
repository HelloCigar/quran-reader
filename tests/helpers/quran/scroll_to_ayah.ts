import type { Page } from 'playwright'

/**
 * Wheels the reading page as far as it goes down or up, as a reader flicking
 * through it would. The Ayahs scroll inside the page's content region, so the
 * wheel turns over the middle of the screen.
 */
export async function scrollAyahs(page: Page, direction: 'down' | 'up') {
  const { width, height } = page.viewportSize() ?? { width: 1280, height: 720 }
  await page.mouse.move(width / 2, height / 2)
  await page.mouse.wheel(0, direction === 'down' ? 100_000 : -100_000)
}

/**
 * Scrolls the reading page down or up until the Ayah with `reference` (e.g.
 * `2:61`) is loaded. Each scroll reaches the edge of the loaded Ayahs and
 * waits for the block it brings in.
 */
export async function scrollToAyah(page: Page, reference: string, direction: 'down' | 'up') {
  const ayahs = page.getByRole('list', { name: 'Ayahs', exact: true }).getByRole('listitem')
  const target = page.getByText(reference, { exact: true })

  // At most 30 scrolls: a Surah has at most 15 blocks above or below.
  for (const _ of Array.from({ length: 30 })) {
    if ((await target.count()) > 0) return
    const loaded = await ayahs.count()
    await scrollAyahs(page, direction)
    await page.waitForFunction(
      `document.querySelectorAll('[aria-label="Ayahs"] > li').length > ${loaded}`
    )
  }
}

/**
 * Waits until the top of the Ayah numbered `ayah` is on screen. Japa's browser
 * client has no in-viewport assertion.
 */
export async function waitForAyahInView(page: Page, ayah: number) {
  await page.waitForFunction(`(() => {
    const top = document.getElementById('ayah-${ayah}')?.getBoundingClientRect().top
    return top !== undefined && top >= 0 && top < window.innerHeight
  })()`)
}
