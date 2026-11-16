/**
 * How much of an Ayah (in px) has to show below the top of the Ayahs' region
 * for it to count as in view; an Ayah showing less has been scrolled past.
 */
const IN_VIEW_MIN = 24

/**
 * The first and last Ayah numbers the reader can see in the region the Ayahs
 * of `list` scroll in, or `null` when no Ayah is loaded.
 */
export function ayahsInView(list: HTMLElement | null): { first: number; last: number } | null {
  if (!list) return null
  const region = scrollRegion(list)
  const top = region?.getBoundingClientRect().top ?? 0
  const bottom = region?.getBoundingClientRect().bottom ?? window.innerHeight
  const items = Array.from(list.querySelectorAll<HTMLElement>('[id^="ayah-"]'))
  const firstIndex = items.findIndex(
    (item) => item.getBoundingClientRect().bottom > top + IN_VIEW_MIN
  )
  const first = items[firstIndex] ?? items[0]
  if (!first) return null

  const shown = firstIndex === -1 ? [] : items.slice(firstIndex)
  const last = shown.findLast((item) => item.getBoundingClientRect().top < bottom) ?? first
  return { first: ayahNumber(first), last: ayahNumber(last) }
}

/**
 * The region `element` scrolls in: its nearest ancestor that scrolls, or
 * `null` when the window does.
 */
export function scrollRegion(element: HTMLElement | null): HTMLElement | null {
  let region = element?.parentElement ?? null
  while (region && !/auto|scroll/.test(getComputedStyle(region).overflowY)) {
    region = region.parentElement
  }
  return region
}

function ayahNumber(item: HTMLElement) {
  return Number(item.id.slice('ayah-'.length))
}
