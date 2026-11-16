import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { useRouter } from '@adonisjs/inertia/react'
import { Head, InfiniteScroll } from '@inertiajs/react'
import type { Scroll } from '@adonisjs/inertia/types'
import type { InfiniteScrollRef } from '@inertiajs/core'
import { useAppShellMobile } from '@astryxdesign/core/AppShell'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { VStack } from '@astryxdesign/core/VStack'
import { List } from '@astryxdesign/core/List'
import { HStack } from '@astryxdesign/core/HStack'
import { Spinner } from '@astryxdesign/core/Spinner'
import type { Data } from '@generated/data'
import type { InertiaProps } from '~/types'
import AppLayout from '~/components/app/app_layout'
import { PAGE_INSET, PAGE_WIDTH } from '~/components/app/page_layout'
import ArabicText from '~/components/quran/arabic_text'
import SurahHeading from '~/components/quran/surah_heading'
import AyahItem from '~/components/quran/ayah_item'
import QuranCredit from '~/components/quran/quran_credit'
import SurahPager from '~/components/quran/surah_pager'
import NoteDialog from '~/components/bookmarks/note_dialog'
import RemoveBookmarkDialog from '~/components/bookmarks/remove_bookmark_dialog'
import { useRemoveBookmark } from '~/components/bookmarks/use_remove_bookmark'
import { useReadingPage, useRecitation } from '~/components/quran/recitation'
import { WordPopoversProvider } from '~/components/quran/word_popovers'
import { useNavigationEvent } from '~/components/navigation/navigation_events'
import ReaderLayout from '~/components/quran/reader_layout'
import { ayahsInView } from '~/components/quran/ayahs_in_view'
import { useFollowRecitation } from '~/components/quran/use_follow_recitation'
import { useReadingPosition } from '~/components/quran/use_reading_position'
import { useReaderSidebar } from '~/components/quran/use_reader_sidebar'

/**
 * How far (in px) beyond the screen's edge the next block starts loading, so
 * a reader scrolling steadily rarely reaches the end of what's loaded.
 */
const LOAD_AHEAD = 1600

/**
 * How close (in Ayahs) the Recited Ayah gets to the last loaded Ayah before
 * the next block loads, so the Recited Word is loaded before it is heard.
 */
const RECITATION_LOAD_AHEAD = 5

/** An old link to an Ayah, from before a Surah loaded in blocks: `#ayah-255`. */
const AYAH_HASH = /^#ayah-(\d+)$/

/** Shown at the top or bottom while a block of Ayahs loads. */
const LOADING = (
  <HStack hAlign="center" padding={4}>
    <Spinner aria-label="Loading ayahs" />
  </HStack>
)

type PageProps = InertiaProps<{
  surah: Data.Surah.Variants['forReading']
  bismillah: string | null
  /** The loaded blocks of Ayahs; scrolling up or down loads the blocks around them. */
  ayahs: Scroll<Data.Ayah>
  /** The Ayah to scroll to when the page opens, if any. */
  openedAt: number | null
  previous: Data.Surah | null
  next: Data.Surah | null
  /** Every Surah, for the sidebar `ReaderLayout` and the app layout's drawer render. */
  surahs: Data.Surah.Variants['forNavigation'][]
  bookmarks: Data.Bookmark[]
  noteFor: number | null
  /**
   * Loaded on the first Play, by the Recitation in the app layout, which
   * keeps it from then on; `null` when the Recitation is unavailable.
   */
  recitation?: Data.Recitation | null
}>

export default function Show({
  surah,
  bismillah,
  ayahs,
  previous,
  next,
  bookmarks,
  noteFor,
  openedAt,
}: PageProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const sidebar = useReaderSidebar()
  const scrollRef = useRef<InfiniteScrollRef>(null)
  /**
   * Inertia drops a visit's page when a client-side URL change lands while
   * that page is still being set, so a Bookmark saved as a block finished
   * loading never showed. The address bar stops following the scroll while
   * a visit (anything but a block or Recitation load) is in flight.
   */
  const [isVisiting, setIsVisiting] = useState(false)
  useNavigationEvent('start', (event) => {
    if (!event.detail.visit.async) setIsVisiting(true)
  })
  useNavigationEvent('finish', (event) => {
    if (!event.detail.visit.async) setIsVisiting(false)
  })
  const loaded = ayahs.data
  const hasFirstAyah = loaded[0]?.number === 1
  const hasLastAyah = loaded.at(-1)?.number === surah.ayahCount.raw
  const bookmarksByAyah = useMemo(
    () => new Map(bookmarks.map((bookmark) => [bookmark.ayahNumber, bookmark])),
    [bookmarks]
  )
  /**
   * `noteFor` only says which note to open when the page loads. Visits that
   * keep this page's state (saving a note, removing a bookmark, loading the
   * Recitation) keep the same `noteFor`; following it would reopen a note the
   * reader closed.
   */
  // react-doctor-disable-next-line no-derived-useState
  const [noteAyah, setNoteAyah] = useState<number | null>(noteFor)
  const removal = useRemoveBookmark()
  const noteBookmark = noteAyah === null ? null : (bookmarksByAyah.get(noteAyah) ?? null)
  /**
   * The first Ayah the reader can see in the region the Ayahs scroll in.
   */
  const firstAyahInView = useCallback(() => ayahsInView(listRef.current)?.first ?? 1, [])
  /**
   * Scrolls to the Ayah the Recitation bar moved to. The Ayah just before or
   * after the loaded blocks waits in `ayahToShowRef` while its block loads.
   * One further away waits in `ayahToOpen` for the page to open again at it,
   * as a link to that Ayah opens it: only its block loads, and the blocks
   * around it load as the reader scrolls.
   */
  const ayahToShowRef = useRef<number | null>(null)
  const [ayahToOpen, setAyahToOpen] = useState<number | null>(null)
  const showAyah = useCallback((ayah: number) => {
    ayahToShowRef.current = null
    setAyahToOpen(null)
    const element = document.getElementById(`ayah-${ayah}`)
    if (element) {
      element.scrollIntoView({ block: 'start' })
      return
    }
    const items = listRef.current?.querySelectorAll('[id^="ayah-"]')
    const first = Number(items?.[0]?.id.slice('ayah-'.length))
    const last = Number(items?.[items.length - 1]?.id.slice('ayah-'.length))
    if (ayah === first - 1) {
      ayahToShowRef.current = ayah
      scrollRef.current?.fetchPrevious()
    } else if (ayah === last + 1) {
      ayahToShowRef.current = ayah
      scrollRef.current?.fetchNext()
    } else setAyahToOpen(ayah)
  }, [])
  /** The Recitation the app layout holds: this Surah's, or one started elsewhere. */
  const recitation = useRecitation()
  const pageRef = useRef<HTMLDivElement>(null)
  const { shown, play, openWord } = recitation
  const editNote = useCallback((bookmark: Data.Bookmark) => setNoteAyah(bookmark.ayahNumber), [])
  const openByReader = useCallback(
    (location: string, isOpen: boolean) => openWord(surah.number, location, isOpen),
    [openWord, surah.number]
  )

  /**
   * A click on the page, outside the popover the Recitation opened, pauses
   * the Recitation and closes it, as a click outside does for a popover the
   * reader opened. A click on the Recitation bar, the top nav or the sidebar
   * does neither: going to another page keeps the Recitation playing.
   */
  const recitedWord = shown?.by === 'recitation' ? shown.location : null
  /**
   * While the sidebar drawer or the menu drawer covers the Ayahs, the
   * Recitation plays on with the Recited Word's popover closed: it would open
   * on top of the drawer. It comes back when the drawer closes.
   */
  const { isMobileNavOpen } = useAppShellMobile()
  const isCovered = sidebar.isDrawerOpen || isMobileNavOpen
  const shownOnPage = recitedWord !== null && isCovered ? null : shown
  const isRecitedHere = recitedWord?.startsWith(`${surah.number}:`) ?? false
  const closeRecitedWord = useEffectEvent((event: PointerEvent) => {
    const target = event.target as Element | null
    if (recitedWord === null) return
    if (!pageRef.current?.contains(target) || target?.closest('[role="dialog"]')) return
    openByReader(recitedWord, false)
  })
  useEffect(() => {
    if (!isRecitedHere) return
    const onPointerDown = (event: PointerEvent) => closeRecitedWord(event)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [isRecitedHere])

  const { recited } = recitation
  const recitedAyah = recited?.recitation.surahNumber === surah.number ? recited.ayah : null

  const follow = useFollowRecitation({
    listRef,
    shown: shownOnPage,
    recitedAyah,
  })
  /** Prev or Next on the Recitation bar: the page shows the Ayah moved to, and follows again. */
  const showMovedTo = useCallback(
    (ayah: number) => {
      follow()
      showAyah(ayah)
    },
    [follow, showAyah]
  )
  useReadingPage({
    surahNumber: surah.number,
    ayahCount: surah.ayahCount.raw,
    firstAyahInView,
    showAyah: showMovedTo,
  })
  const playFrom = useCallback(
    (ayah: number) => {
      follow()
      play(surah.number, ayah)
    },
    [follow, play, surah.number]
  )

  /**
   * A Recitation plays to the end of the Surah: as the Recited Ayah nears the
   * last loaded Ayah, the next block loads, as it does when the reader
   * scrolls down. A Recited Ayah outside the loaded blocks loads nothing: the
   * reader opened the Surah somewhere else, and the bar links to it.
   */
  const firstLoaded = loaded[0]?.number
  const lastLoaded = loaded.at(-1)?.number
  useEffect(() => {
    if (recitedAyah === null || firstLoaded === undefined || lastLoaded === undefined) return
    if (recitedAyah < firstLoaded || recitedAyah > lastLoaded) return
    if (lastLoaded - recitedAyah < RECITATION_LOAD_AHEAD) scrollRef.current?.fetchNext()
  }, [recitedAyah, firstLoaded, lastLoaded])

  // The block of the Ayah waiting in `ayahToShowRef` has loaded: the page scrolls to it.
  useEffect(() => {
    if (ayahToShowRef.current === null) return
    const element = document.getElementById(`ayah-${ayahToShowRef.current}`)
    if (!element) return
    ayahToShowRef.current = null
    element.scrollIntoView({ block: 'start' })
  }, [firstLoaded, lastLoaded])

  useEffect(() => {
    if (openedAt !== null) {
      document.getElementById(`ayah-${openedAt}`)?.scrollIntoView({ block: 'start' })
    }
  }, [openedAt])

  /**
   * The browser never sends `#ayah-N` to the server, so an old link opens at
   * the Surah's start. When Ayah N is loaded the page scrolls to it; when it
   * isn't, the page opens again at `?ayah=N`, in place of the old URL.
   */
  const router = useRouter()
  const openHashAyah = useEffectEvent(() => {
    const match = AYAH_HASH.exec(window.location.hash)
    if (!match) return
    const ayah = Number(match[1])
    const element = document.getElementById(`ayah-${ayah}`)
    if (element) {
      element.scrollIntoView({ block: 'start' })
      return
    }
    router.get(
      { route: 'surahs.show', routeParams: { number: surah.number }, qs: { ayah } },
      { replace: true }
    )
  })
  useEffect(() => openHashAyah(), [])

  /**
   * Opens the page again at `ayahToOpen`. A visit would cancel a Recitation
   * still loading, so it waits for that load: dragging through the Recitation
   * before the first Play starts both.
   */
  const isRecitationLoading = recitation.isLoading
  const surahNumber = surah.number
  useEffect(() => {
    if (ayahToOpen === null || isRecitationLoading) return
    router.get(
      { route: 'surahs.show', routeParams: { number: surahNumber }, qs: { ayah: ayahToOpen } },
      { replace: true }
    )
  }, [ayahToOpen, isRecitationLoading, router, surahNumber])

  // After the effects above, so the jump to the Ayah the page opens at is already made.
  useReadingPosition({
    surahNumber: surah.number,
    listRef,
    isPlaying: recitation.isPlaying,
    saver: recitation.readingPositionSaver,
  })

  return (
    <WordPopoversProvider shown={shownOnPage} onOpenChange={openByReader}>
      <Layout
        ref={pageRef}
        contentWidth={PAGE_WIDTH}
        content={
          <LayoutContent padding={PAGE_INSET}>
            <Head title={surah.name} />
            <InfiniteScroll
              ref={scrollRef}
              data="ayahs"
              itemsElement={listRef}
              buffer={LOAD_AHEAD}
              preserveUrl={isVisiting}
              loading={LOADING}
            >
              <VStack gap={6}>
                {hasFirstAyah && <SurahHeading surah={surah} />}
                {hasFirstAyah && bismillah && (
                  <ArabicText align="center" data-testid="bismillah">
                    {bismillah}
                  </ArabicText>
                )}
                <List ref={listRef} hasDividers edge="flush" aria-label="Ayahs">
                  {loaded.map((ayah) => (
                    <AyahItem
                      key={ayah.number}
                      surahNumber={surah.number}
                      ayah={ayah}
                      bookmark={bookmarksByAyah.get(ayah.number) ?? null}
                      onEditNote={editNote}
                      onRemove={removal.remove}
                      onPlayFrom={playFrom}
                    />
                  ))}
                </List>
                {hasLastAyah && <SurahPager previous={previous} next={next} />}
                {hasLastAyah && <QuranCredit />}
              </VStack>
            </InfiniteScroll>
            {noteBookmark && (
              <NoteDialog
                key={noteBookmark.id}
                bookmark={noteBookmark}
                onClose={() => setNoteAyah(null)}
              />
            )}
            <RemoveBookmarkDialog
              bookmark={removal.pending}
              onConfirm={removal.confirm}
              onCancel={removal.cancel}
            />
          </LayoutContent>
        }
      />
    </WordPopoversProvider>
  )
}

Show.layout = [AppLayout, ReaderLayout]
