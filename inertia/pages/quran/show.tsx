import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Head } from '@inertiajs/react'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { VStack } from '@astryxdesign/core/VStack'
import { List } from '@astryxdesign/core/List'
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

type PageProps = InertiaProps<{
  surah: Data.Surah.Variants['forReading']
  bismillah: string | null
  ayahs: Data.Ayah[]
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
  recitation,
}: PageProps) {
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
    if (noteFor !== null) {
      document.getElementById(`ayah-${noteFor}`)?.scrollIntoView({ block: 'center' })
    }
  }, [noteFor])

  return (
    <WordPopoversProvider shown={shown} onOpenChange={openByReader}>
      <Layout
        contentWidth={720}
        content={
          <LayoutContent padding={6}>
            <Head title={surah.name} />
            <VStack gap={6}>
              <SurahHeading surah={surah} />
              {bismillah && (
                <ArabicText align="center" data-testid="bismillah">
                  {bismillah}
                </ArabicText>
              )}
              <List hasDividers edge="flush" aria-label="Ayahs">
                {ayahs.map((ayah) => (
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
              <SurahPager previous={previous} next={next} />
              <QuranCredit />
            </VStack>
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
              ayahs.find(({ number }) => number === player.recitedAyah)?.reference ?? null
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
