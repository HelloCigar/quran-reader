import {
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from '@adonisjs/inertia/react'
import { Head, InfiniteScroll } from '@inertiajs/react'
import type { Scroll } from '@adonisjs/inertia/types'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { VStack } from '@astryxdesign/core/VStack'
import { List } from '@astryxdesign/core/List'
import { HStack } from '@astryxdesign/core/HStack'
import { Spinner } from '@astryxdesign/core/Spinner'
import type { Data } from '@generated/data'
import type { InertiaProps } from '~/types'
import MarketingLayout from '~/components/marketing/marketing_layout'
import ArabicText from '~/components/quran/arabic_text'
import SurahHeading from '~/components/quran/surah_heading'
import AyahItem from '~/components/quran/ayah_item'
import QuranCredit from '~/components/quran/quran_credit'
import SurahPager from '~/components/quran/surah_pager'
import NoteDialog from '~/components/bookmarks/note_dialog'
import RemoveBookmarkDialog from '~/components/bookmarks/remove_bookmark_dialog'
import { useRemoveBookmark } from '~/components/bookmarks/use_remove_bookmark'
import RecitationPlayer from '~/components/quran/recitation_player'
import { useRecitation } from '~/components/quran/use_recitation'
import { WordPopoversProvider } from '~/components/quran/word_popovers'
import { useNavigationEvent } from '~/components/navigation/navigation_events'

/**
 * How far (in px) beyond the screen's edge the next block starts loading, so
 * a reader scrolling steadily rarely reaches the end of what's loaded.
 */
const LOAD_AHEAD = 1600

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
  bookmarks: Data.Bookmark[]
  noteFor: number | null
  /** Loaded on the first Play; `null` when the Recitation is unavailable. */
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
  recitation,
}: PageProps) {
  const listRef = useRef<HTMLUListElement>(null)
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
  const player = useRecitation(recitation)
  const playerRef = useRef<HTMLDivElement>(null)
  const { shown, openByReader } = player
  const editNote = useCallback((bookmark: Data.Bookmark) => setNoteAyah(bookmark.ayahNumber), [])
  /**
   * `player.play` changes as the Recitation loads and moves between Ayahs.
   * Ayahs get a stable function that calls the latest one, so they don't
   * re-render with every change.
   */
  const playRef = useRef(player.play)
  useLayoutEffect(() => {
    playRef.current = player.play
  })
  const playFrom = useCallback((ayah: number) => playRef.current(ayah), [])

  /**
   * A click outside the popover the Recitation opened (but not on the player)
   * pauses the Recitation and closes it, as a click outside does for a popover
   * the reader opened.
   */
  useEffect(() => {
    if (shown?.by !== 'recitation') return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (playerRef.current?.contains(target) || target?.closest('[role="dialog"]')) return
      openByReader(shown.location, false)
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [shown, openByReader])

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

  return (
    <WordPopoversProvider shown={shown} onOpenChange={openByReader}>
      <Layout
        contentWidth={720}
        content={
          <LayoutContent padding={6}>
            <Head title={surah.name} />
            <InfiniteScroll
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
        footer={
          <RecitationPlayer
            footerRef={playerRef}
            isPlaying={player.isPlaying}
            isLoading={player.isLoading}
            recitedReference={
              loaded.find(({ number }) => number === player.recitedAyah)?.reference ?? null
            }
            onPlay={() => player.play()}
            onPause={player.pause}
          />
        }
      />
    </WordPopoversProvider>
  )
}

Show.layout = [MarketingLayout]
