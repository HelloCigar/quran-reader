import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { TextArea } from '@astryxdesign/core/TextArea'
import type { Data } from '@generated/data'
import { focusBookmarkTrigger } from '~/components/bookmarks/bookmarked_menu'
import { useRouteForm } from '~/components/forms/use_route_form'

/**
 * Asks for the optional note on a bookmark, and saves it. "Not now" dismisses
 * it without changing anything; saving an empty note clears it. Shared by the
 * surah page and the bookmarks list.
 */
export default function NoteDialog({
  bookmark,
  onClose,
}: {
  bookmark: Data.Bookmark
  onClose: () => void
}) {
  const close = () => {
    onClose()
    focusBookmarkTrigger(bookmark.id)
  }
  const form = useRouteForm(
    'bookmarks.update',
    { note: bookmark.note ?? '' },
    {
      routeParams: { id: bookmark.id },
      errorBag: 'note',
      // Only the bookmarks change, so the Ayahs loaded so far stay.
      preserveScroll: true,
      preserveState: true,
      only: ['bookmarks'],
      onSuccess: close,
    }
  )

  return (
    <Dialog isOpen onOpenChange={(isOpen) => !isOpen && close()} purpose="form" width={480}>
      <form onSubmit={form.submit}>
        <Layout
          header={<DialogHeader title={`Note on ${bookmark.reference}`} onOpenChange={close} />}
          content={
            <LayoutContent>
              <TextArea label="Note" maxLength={500} {...form.field('note')} />
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button label="Not now" variant="secondary" onClick={close} />
                <Button type="submit" label="Save" variant="primary" isLoading={form.processing} />
              </HStack>
            </LayoutFooter>
          }
        />
      </form>
    </Dialog>
  )
}
