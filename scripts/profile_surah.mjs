/**
 * Times a Surah's reading page in a headless browser: how long until its last
 * Ayah is on the page, the main-thread long tasks during that load, and how
 * long opening one Word takes.
 *
 * A manual check, not a test: timings vary by machine. Compare a long Surah
 * (2, Al-Baqarah: 6,116 Words) against a short one (108), before and after a
 * change. Dev numbers are several times slower than a production build.
 *
 *   node scripts/profile_surah.mjs [surah=2] [runs=3]
 *   BASE=http://localhost:3334 node scripts/profile_surah.mjs 2
 *
 * Needs a running server (`npm run dev`, or a production build).
 */
import { chromium } from 'playwright'

const surah = process.argv[2] ?? '2'
const runs = Number(process.argv[3] ?? 3)
const base = process.env.BASE ?? 'http://localhost:3333'

const browser = await chromium.launch()
const results = []

for (let run = 0; run < runs; run++) {
  const page = await browser.newPage()
  await page.addInitScript(() => {
    globalThis.longTaskMs = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) globalThis.longTaskMs += entry.duration
    }).observe({ type: 'longtask', buffered: true })
  })

  await page.goto(`${base}/quran/${surah}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[aria-label="Ayahs"] [id^="ayah-"]:last-child', { timeout: 120_000 })
  const loadedMs = await page.evaluate(() => performance.now())
  const longTaskMs = await page.evaluate(() => globalThis.longTaskMs)
  const words = await page.locator('[data-word-location]').count()

  const startedAt = await page.evaluate(() => performance.now())
  await page.locator('[data-word-location]').nth(5).click()
  await page.waitForSelector('[role="dialog"]')
  const openWordMs = (await page.evaluate(() => performance.now())) - startedAt

  results.push({
    loadedMs: Math.round(loadedMs),
    longTaskMs: Math.round(longTaskMs),
    openWordMs: Math.round(openWordMs),
    words,
  })
  await page.close()
}

await browser.close()
console.table(results)
