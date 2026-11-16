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

/**
 * Wheels the reading page down a little at a time, as a reader reading on
 * would, until the Ayah numbered `ayah` has left the top of the view and the
 * next Ayah is the first one in view.
 */
export async function scrollPastAyah(page: Page, ayah: number) {
  const { width, height } = page.viewportSize() ?? { width: 1280, height: 720 }
  await page.mouse.move(width / 2, height / 2)

  // At most 400 small turns of the wheel: plenty to read past the first block.
  for (const _ of Array.from({ length: 400 })) {
    if (await isFirstAyahInViewAfter(page, ayah)) return
    await page.mouse.wheel(0, 40)
    // Two frames: the wheel has scrolled the page and the page has seen it.
    await page.evaluate(
      `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`
    )
  }
  throw new Error(`Scrolling never passed Ayah ${ayah}`)
}

/**
 * Whether the first Ayah in view, as the reading page counts it (more than
 * 24 px of it below the top of the region the Ayahs scroll in), comes after
 * the Ayah numbered `ayah`.
 */
async function isFirstAyahInViewAfter(page: Page, ayah: number): Promise<boolean> {
  return page.evaluate(`(() => {
    const list = document.querySelector('[aria-label="Ayahs"]')
    let region = list?.parentElement ?? null
    while (region && !/auto|scroll/.test(getComputedStyle(region).overflowY)) {
      region = region.parentElement
    }
    const top = region?.getBoundingClientRect().top ?? 0
    const first = Array.from(list?.querySelectorAll('[id^="ayah-"]') ?? []).find(
      (item) => item.getBoundingClientRect().bottom > top + 24
    )
    return first ? Number(first.id.slice('ayah-'.length)) > ${ayah} : false
  })()`)
}

/**
 * A script for `page.evaluate`: whether the Ayah numbered `ayah` shows in the
 * region the Ayahs scroll in, as the reading page counts it (more than 24 px
 * of it below the top of that region).
 */
const IS_AYAH_IN_VIEW = `((ayah) => {
  const item = document.getElementById('ayah-' + ayah)
  if (!item) return false
  let region = item.parentElement
  while (region && !/auto|scroll/.test(getComputedStyle(region).overflowY)) {
    region = region.parentElement
  }
  const view = region?.getBoundingClientRect() ?? { top: 0, bottom: window.innerHeight }
  const rect = item.getBoundingClientRect()
  return rect.bottom > view.top + 24 && rect.top < view.bottom
})`

/** A script for `page.evaluate`: the number of the Recited Ayah the Recitation bar names. */
const RECITED_AYAH = `Number(
  document.querySelector('[data-testid="recited-ayah"]')?.textContent?.split(':')[1] ?? NaN
)`

/** The number of the Recited Ayah the Recitation bar names. */
export async function recitedAyah(page: Page): Promise<number> {
  return page.evaluate(RECITED_AYAH)
}

/**
 * Whether any of the Ayah numbered `ayah` shows on screen.
 */
export async function isAyahInView(page: Page, ayah: number): Promise<boolean> {
  return page.evaluate(`${IS_AYAH_IN_VIEW}(${ayah})`)
}

/**
 * Waits until the Recited Ayah is one numbered `from` to `to` and shows on
 * screen. A Word is heard too briefly to wait for one Ayah alone.
 */
export async function waitForRecitedAyahInView(
  page: Page,
  { from, to }: { from: number; to: number },
  timeout = 20_000
) {
  await page.waitForFunction(
    `(() => {
      const ayah = ${RECITED_AYAH}
      return ayah >= ${from} && ayah <= ${to} && ${IS_AYAH_IN_VIEW}(ayah)
    })()`,
    undefined,
    { timeout }
  )
}

/**
 * Waits until the Recited Ayah no longer shows on screen, as once a scroll
 * away from it has settled.
 */
export async function waitForRecitedAyahOutOfView(page: Page) {
  await page.waitForFunction(`!${IS_AYAH_IN_VIEW}(${RECITED_AYAH})`)
}

/**
 * Wheels the reading page up a little at a time, as a reader looking for it
 * would, until the Recited Ayah shows on screen.
 */
export async function scrollUpToRecitedAyah(page: Page) {
  const { width, height } = page.viewportSize() ?? { width: 1280, height: 720 }
  await page.mouse.move(width / 2, height / 2)

  // At most 400 small turns of the wheel: plenty to go back over a block.
  for (const _ of Array.from({ length: 400 })) {
    if (await page.evaluate(`${IS_AYAH_IN_VIEW}(${RECITED_AYAH})`)) return
    await page.mouse.wheel(0, -40)
    // Two frames: the wheel has scrolled the page and the page has seen it.
    await page.evaluate(
      `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`
    )
  }
  throw new Error('Scrolling up never reached the Recited Ayah')
}
