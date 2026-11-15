import { useState } from 'react'
import { List } from '@astryxdesign/core/List'
import type { Data } from '@generated/data'
import type { InertiaProps } from '~/types'
import AppLayout from '~/components/app/app_layout'
import PageLayout from '~/components/app/page_layout'
import BookmarkListItem from '~/components/bookmarks/bookmark_list_item'
import BookmarksEmpty from '~/components/bookmarks/bookmarks_empty'
import NoteDialog from '~/components/bookmarks/note_dialog'
import RemoveBookmarkDialog from '~/components/bookmarks/remove_bookmark_dialog'
import { useRemoveBookmark } from '~/components/bookmarks/use_remove_bookmark'

type PageProps = InertiaProps<{ bookmarks: Data.Bookmark.Variants['forList'][] }>

export default function Index({ bookmarks }: PageProps) {
  const [noteId, setNoteId] = useState<number | null>(null)
  const removal = useRemoveBookmark()
  const noteBookmark = bookmarks.find((bookmark) => bookmark.id === noteId) ?? null

  return (
    <PageLayout title="Bookmarks">
      {bookmarks.length === 0 ? (
        <BookmarksEmpty />
      ) : (
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
