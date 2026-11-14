import { createContext, use, useRef, useState, useSyncExternalStore } from 'react'
import { useReaderPreference } from '~/components/quran/use_reader_preference'
import { useNavigationEvent } from '~/components/navigation/navigation_events'

const NARROW = '(max-width: 768px)'

/** A Surah's page opened at its start, as choosing a Surah opens it. */
const SURAH_PATH = /^\/quran\/\d+$/

/** Surah: just the Surahs. Verse: the open Surah's Ayahs beside them. */
export type SidebarMode = 'surah' | 'verse'

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
 * Where the reading page shows its sidebar, for `ReaderLayout`, which stays
 * mounted from one Surah to the next. Responsive contract. Wide: a start
 * panel beside the Ayahs, which the reader can hide. Narrow (phones, up to
 * 768px): the panel is dropped so the Ayahs keep the width, and the same
 * sidebar opens in a drawer. Either way `toggle` is the one control, and the
 * page puts it in its footer, out of the text.
 *
 * The drawer closes once a visit from it lands, except when the reader chose
 * a Surah in Verse mode: that is half of choosing an Ayah, so it stays open.
 * Whether the panel shows and the mode are kept in cookies, which the
 * controller passes back as `choices`.
 */
export function useReaderSidebar(choices: { isShown: boolean; mode: SidebarMode }) {
  const isNarrow = useIsNarrow()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [shown, setShown] = useReaderPreference(
    'reader_sidebar',
    choices.isShown ? 'shown' : 'hidden'
  )
  const [mode, setMode] = useReaderPreference<SidebarMode>('reader_sidebar_mode', choices.mode)
  const hasPanel = !isNarrow && shown === 'shown'

  /** Whether the visit in flight closes the drawer when it lands. */
  const closesDrawer = useRef(false)
  useNavigationEvent('start', (event) => {
    const { visit } = event.detail
    if (visit.async) return
    const choosesSurahForVerse =
      mode === 'verse' && SURAH_PATH.test(visit.url.pathname) && !visit.url.searchParams.has('ayah')
    closesDrawer.current = !choosesSurahForVerse
  })
  // A visit that fails validation (a bad Verse) fires `error`, not
  // `success`, so the drawer stays open to show why.
  useNavigationEvent('success', () => {
    if (closesDrawer.current) setIsDrawerOpen(false)
  })
  useNavigationEvent('finish', (event) => {
    if (!event.detail.visit.async) closesDrawer.current = false
  })

  return {
    hasPanel,
    /** The drawer is open; only on a narrow screen. */
    isDrawerOpen: isNarrow && isDrawerOpen,
    setDrawerOpen: setIsDrawerOpen,
    mode,
    setMode,
    toggle: {
      /** What the toggle says it does. */
      label: hasPanel ? 'Hide Surahs' : 'Show Surahs',
      onToggle: () => {
        if (isNarrow) setIsDrawerOpen(true)
        else setShown(hasPanel ? 'hidden' : 'shown')
      },
    },
  }
}

export type ReaderSidebarToggle = ReturnType<typeof useReaderSidebar>['toggle']

/** The sidebar toggle `ReaderLayout` hands to the page's footer. */
export const ReaderSidebarToggleContext = createContext<ReaderSidebarToggle | null>(null)

/** The sidebar toggle, inside `ReaderLayout`; `null` outside it. */
export function useReaderSidebarToggle() {
  return use(ReaderSidebarToggleContext)
}
