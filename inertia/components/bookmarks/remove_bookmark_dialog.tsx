import { AlertDialog } from '@astryxdesign/core/AlertDialog'
import type { Data } from '@generated/data'

/**
 * Confirms removing a bookmark that has a note, showing the note that would
 * be lost. "Keep" changes nothing.
 */
export default function RemoveBookmarkDialog({
  bookmark,
  onConfirm,
  onCancel,
}: {
  bookmark: Data.Bookmark | null
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <AlertDialog
      isOpen={bookmark !== null}
      onOpenChange={(isOpen) => !isOpen && onCancel()}
      title={bookmark ? `Remove bookmark ${bookmark.reference}? Your note will be lost.` : ''}
      description={bookmark?.note ?? ''}
      actionLabel="Remove"
      cancelLabel="Keep"
      onAction={onConfirm}
    />
  )
}
