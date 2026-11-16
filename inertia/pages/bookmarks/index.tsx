import { useState } from 'react'
import { useRouter } from '@adonisjs/inertia/react'
import { List } from '@astryxdesign/core/List'
import { Pagination } from '@astryxdesign/core/Pagination'
import { VStack } from '@astryxdesign/core/VStack'
import type { Data } from '@generated/data'
import type { InertiaProps, Paginated } from '~/types'
import AppLayout from '~/components/app/app_layout'
import PageLayout from '~/components/app/page_layout'
import BookmarkListItem from '~/components/bookmarks/bookmark_list_item'
import BookmarksEmpty from '~/components/bookmarks/bookmarks_empty'
import NoteDialog from '~/components/bookmarks/note_dialog'
import RemoveBookmarkDialog from '~/components/bookmarks/remove_bookmark_dialog'
import { useRemoveBookmark } from '~/components/bookmarks/use_remove_bookmark'

type PageProps = InertiaProps<{
  /** One page of the reader's Bookmarks, newest first; `?page=` names it. */
  bookmarks: Paginated<Data.Bookmark.Variants['forList']>
}>

export default function Index({ bookmarks: { data: bookmarks, metadata } }: PageProps) {
  const router = useRouter()
  const [noteId, setNoteId] = useState<number | null>(null)
  const removal = useRemoveBookmark()
  const noteBookmark = bookmarks.find((bookmark) => bookmark.id === noteId) ?? null

  return (
    <PageLayout title="Bookmarks">
      {bookmarks.length === 0 ? (
        <BookmarksEmpty />
      ) : (
        <VStack gap={4} hAlign="stretch">
          <List hasDividers edge="flush" aria-label="Bookmarks">
            {bookmarks.map((bookmark) => (
              <BookmarkListItem
                key={bookmark.id}
                bookmark={bookmark}
                onEditNote={() => setNoteId(bookmark.id)}
                onRemove={() => removal.remove(bookmark)}
              />
            ))}
          </List>
          {metadata.lastPage > 1 && (
            <Pagination
              label="Pages of bookmarks"
              page={metadata.currentPage}
              totalItems={metadata.total}
              pageSize={metadata.perPage}
              onChange={(page) => router.visit({ route: 'bookmarks.index', qs: { page } })}
            />
          )}
        </VStack>
      )}
      {noteBookmark && (
        <NoteDialog key={noteBookmark.id} bookmark={noteBookmark} onClose={() => setNoteId(null)} />
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
