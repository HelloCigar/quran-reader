import { useState, useSyncExternalStore } from 'react'
import { useReaderPreference } from '~/components/quran/use_reader_preference'

const NARROW = '(max-width: 768px)'

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(NARROW)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/**
 * Whether the screen is narrow, read on the first render too, so a phone
 * never draws the panel for a frame. (Astryx's `useMediaQuery` always starts
 * `false`.) A server render, should one run, assumes a wide screen.
 */
function useIsNarrow() {
  return useSyncExternalStore(
    subscribeToWidth,
    () => window.matchMedia(NARROW).matches,
    () => false
  )
}

/**
 * Where the reading page shows its sidebar. Responsive contract. Wide: a
 * start panel beside the Ayahs, which the reader can hide (kept in the
 * `reader_sidebar` cookie). Narrow (phones, up to 768px): the panel is
 * dropped so the Ayahs keep the width, and the same sidebar opens in a
 * drawer. Either way `toggle` is the one control, kept out of the text.
 */
export function useReaderSidebar(isShown: boolean) {
  const isNarrow = useIsNarrow()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [shown, setShown] = useReaderPreference('reader_sidebar', isShown ? 'shown' : 'hidden')
  const hasPanel = !isNarrow && shown === 'shown'

  return {
    /** The panel shows beside the Ayahs. */
    hasPanel,
    /** The drawer is open; only on a narrow screen. */
    isDrawerOpen: isNarrow && isDrawerOpen,
    closeDrawer: () => setIsDrawerOpen(false),
    setDrawerOpen: setIsDrawerOpen,
    /** What the toggle says it does. */
    toggleLabel: hasPanel ? 'Hide Surahs' : 'Show Surahs',
    toggle: () => {
      if (isNarrow) setIsDrawerOpen(true)
      else setShown(hasPanel ? 'hidden' : 'shown')
    },
  }
}
