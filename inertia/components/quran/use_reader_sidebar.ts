import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { usePage } from '@inertiajs/react'
import { useReaderPreference } from '~/components/quran/use_reader_preference'
import { useNavigationEvent } from '~/components/navigation/navigation_events'
import { useRecitation } from '~/components/quran/use_recitation'

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
 * The Surah and Ayah sidebar, for every page of the app layout, which keeps
 * it from one page to the next. Responsive contract on a Surah's page. Wide:
 * a start panel beside the Ayahs, which the reader can hide. Narrow (phones,
 * up to 768px): the panel is dropped so the Ayahs keep the width, and the
 * same sidebar opens in a drawer. On any other page there is no panel: the
 * sidebar opens in the drawer at any width, set to the Surah being recited.
 * Either way `toggle` is the one control, on the Recitation bar.
 *
 * The drawer closes once a visit from it lands, except when the reader chose
 * a Surah in Verse mode: that is half of choosing an Ayah, so it stays open,
 * unless the Surah's page then shows the panel. Whether the panel shows and
 * the mode are kept in cookies, which the server passes back in the shared
 * `preferences`.
 *
 * A Surah's page passes every Surah; `OffPageSidebarDrawer` loads them on any
 * other page.
 */
export function useReaderSidebarState() {
  const { props } = usePage()
  const { readingPage, recited } = useRecitation()
  const isNarrow = useIsNarrow()
  const [isOpen, setIsOpen] = useState(false)
  const choices = props.preferences.sidebar
  const [shown, setShown] = useReaderPreference(
    'reader_sidebar',
    choices.isShown ? 'shown' : 'hidden'
  )
  const [mode, setMode] = useReaderPreference<SidebarMode>('reader_sidebar_mode', choices.mode)
  const isReadingPage = readingPage !== null
  const hasPanel = isReadingPage && !isNarrow && shown === 'shown'
  /** A wide Surah's page has the panel in place of the drawer. */
  const hasDrawer = !isReadingPage || isNarrow
  /** Off a Surah's page the sidebar is set to the Surah recited, so it needs a Recitation. */
  const hasSurah = isReadingPage || recited !== null

  // A drawer left open where it can't show would open again on the next page.
  if (isOpen && (!hasDrawer || !hasSurah)) setIsOpen(false)

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
    if (closesDrawer.current) setIsOpen(false)
  })
  useNavigationEvent('finish', (event) => {
    if (!event.detail.visit.async) closesDrawer.current = false
  })

  const onToggle = useCallback(() => {
    if (hasDrawer) setIsOpen(true)
    else setShown(hasPanel ? 'hidden' : 'shown')
  }, [hasDrawer, hasPanel, setShown])
  const toggle = useMemo(
    () => ({
      /** What the toggle says it does. */
      label: hasPanel ? 'Hide Surahs' : 'Show Surahs',
      onToggle,
    }),
    [hasPanel, onToggle]
  )

  return useMemo(
    () => ({
      /** The panel shows; only on a wide Surah's page. */
      hasPanel,
      /** The drawer is open, over the page. */
      isDrawerOpen: isOpen,
      setDrawerOpen: setIsOpen,
      mode,
      setMode,
      toggle,
    }),
    [hasPanel, isOpen, mode, setMode, toggle]
  )
}

export type ReaderSidebar = ReturnType<typeof useReaderSidebarState>

export const ReaderSidebarContext = createContext<ReaderSidebar | null>(null)

/** The sidebar, inside the app layout. */
export function useReaderSidebar() {
  const sidebar = use(ReaderSidebarContext)
  if (!sidebar) throw new Error('useReaderSidebar needs a ReaderSidebarProvider')
  return sidebar
}
