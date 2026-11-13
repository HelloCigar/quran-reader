import { useEffect, useMemo, useState } from 'react'
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

type PageProps = InertiaProps<{
  surah: Data.Surah.Variants['forReading']
  bismillah: string | null
  ayahs: Data.Ayah[]
  previous: Data.Surah | null
  next: Data.Surah | null
  bookmarks: Data.Bookmark[]
  noteFor: number | null
}>

export default function Show({
  surah,
  bismillah,
  ayahs,
  previous,
  next,
  bookmarks,
  noteFor,
}: PageProps) {
  const bookmarksByAyah = useMemo(
    () => new Map(bookmarks.map((bookmark) => [bookmark.ayahNumber, bookmark])),
    [bookmarks]
  )
  const [noteAyah, setNoteAyah] = useState<number | null>(noteFor)
  const removal = useRemoveBookmark()
  const noteBookmark = noteAyah === null ? null : (bookmarksByAyah.get(noteAyah) ?? null)

  useEffect(() => {
    if (noteFor !== null) {
      document.getElementById(`ayah-${noteFor}`)?.scrollIntoView({ block: 'center' })
    }
  }, [noteFor])

  return (
    <Layout
      height="auto"
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
                  onEditNote={(bookmark) => setNoteAyah(bookmark.ayahNumber)}
                  onRemove={removal.remove}
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
    />
  )
}

Show.layout = [MarketingLayout]
