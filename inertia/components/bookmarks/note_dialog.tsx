import { useState } from 'react'
import { Form } from '@adonisjs/inertia/react'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { TextArea } from '@astryxdesign/core/TextArea'
import type { Data } from '@generated/data'
import { focusBookmarkTrigger } from '~/components/bookmarks/bookmarked_menu'

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
  const [note, setNote] = useState(bookmark.note ?? '')
  const close = () => {
    onClose()
    focusBookmarkTrigger(bookmark.id)
  }

  return (
    <Dialog isOpen onOpenChange={(isOpen) => !isOpen && close()} purpose="form" width={480}>
      <Form
        route="bookmarks.update"
        routeParams={{ id: bookmark.id }}
        errorBag="note"
        // Only the bookmarks change, so the Ayahs loaded so far stay.
        options={{ preserveScroll: true, preserveState: true, only: ['bookmarks'] }}
        onSuccess={close}
      >
        {({ errors, processing }) => (
          <Layout
            header={<DialogHeader title={`Note on ${bookmark.reference}`} onOpenChange={close} />}
            content={
              <LayoutContent>
                <TextArea
                  label="Note"
                  htmlName="note"
                  maxLength={500}
                  value={note}
                  onChange={setNote}
                  status={errors.note ? { type: 'error', message: errors.note } : undefined}
                />
              </LayoutContent>
            }
            footer={
              <LayoutFooter>
                <HStack gap={2} hAlign="end">
                  <Button label="Not now" variant="secondary" onClick={close} />
                  <Button type="submit" label="Save" variant="primary" isLoading={processing} />
                </HStack>
              </LayoutFooter>
            }
          />
        )}
      </Form>
    </Dialog>
  )
}
