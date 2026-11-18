import { useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { List } from '@astryxdesign/core/List'
import { VStack } from '@astryxdesign/core/VStack'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import type { Data } from '@generated/data'
import type { InertiaProps, Paginated } from '~/types'
import AppLayout from '~/components/app/app_layout'
import PageLayout from '~/components/app/page_layout'
import BookmarkListItem from '~/components/bookmarks/bookmark_list_item'
import BookmarksEmpty from '~/components/bookmarks/bookmarks_empty'
import BookmarksPagination from '~/components/bookmarks/bookmarks_pagination'
import NoteDialog from '~/components/bookmarks/note_dialog'
import RemoveBookmarkDialog from '~/components/bookmarks/remove_bookmark_dialog'
import { useLeavingRows } from '~/components/bookmarks/use_leaving_rows'
import { useRemoveBookmark } from '~/components/bookmarks/use_remove_bookmark'

const PHONE = '@media (max-width: 600px)'
const SPACE_10 = `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`
const SPACE_18 = `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`

const styles = stylex.create({
  /** The cards sit 12px apart, 10px on a phone. */
  list: { rowGap: { default: spacingVars['--spacing-3'], [PHONE]: SPACE_10 } },
  /** The list and its pages sit 32px apart, 18px on a phone. */
  body: { rowGap: { default: spacingVars['--spacing-8'], [PHONE]: SPACE_18 } },
})

type PageProps = InertiaProps<{
  /** One page of the reader's Bookmarks, newest first; `?page=` names it. */
  bookmarks: Paginated<Data.Bookmark.Variants['forList']>
}>

export default function Index({ bookmarks: { data: bookmarks, metadata } }: PageProps) {
  const [noteId, setNoteId] = useState<number | null>(null)
  const removal = useRemoveBookmark()
  const rows = useLeavingRows(bookmarks, metadata.currentPage)
  const noteBookmark = bookmarks.find((bookmark) => bookmark.id === noteId) ?? null

  return (
    <PageLayout
      title="Bookmarks"
      eyebrow={
        metadata.total > 0
          ? `${metadata.total} saved ${metadata.total === 1 ? 'ayah' : 'ayahs'}`
          : undefined
      }
      gap="compact"
      phoneTop="roomy"
      phoneInset="row"
    >
      {bookmarks.length === 0 ? (
        <BookmarksEmpty />
      ) : (
        <VStack hAlign="stretch" xstyle={styles.body}>
          <List edge="flush" aria-label="Bookmarks" xstyle={styles.list}>
            {rows.map(({ item: bookmark, leaving }, index) => (
              <BookmarkListItem
                key={bookmark.id}
                bookmark={bookmark}
                entranceOrder={index}
                leaving={leaving}
                onEditNote={() => setNoteId(bookmark.id)}
                onRemove={() => removal.remove(bookmark)}
              />
            ))}
          </List>
          {metadata.lastPage > 1 && (
            <BookmarksPagination currentPage={metadata.currentPage} lastPage={metadata.lastPage} />
          )}
        </VStack>
      )}
      {noteBookmark && (
        <NoteDialog
          key={noteBookmark.id}
          bookmark={noteBookmark}
          arabic={noteBookmark.text?.arabic}
          onClose={() => setNoteId(null)}
        />
      )}
      <RemoveBookmarkDialog
        bookmark={removal.pending}
        onConfirm={removal.confirm}
        onCancel={removal.cancel}
      />
    </PageLayout>
  )
}

Index.layout = [AppLayout]
