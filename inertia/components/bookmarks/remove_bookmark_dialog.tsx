import * as stylex from '@stylexjs/stylex'
import { useId } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
import { colorVars, radiusVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { Dialog } from '@astryxdesign/core/Dialog'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { VStack } from '@astryxdesign/core/VStack'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { Text } from '@astryxdesign/core/Text'
import type { Data } from '@generated/data'
import { dialogButtonStyles, dialogStyles } from '~/components/bookmarks/dialog_styles'

const styles = stylex.create({
  /** The mark: a trash can on a faint red disc, so the question reads as a warning at a glance. */
  mark: {
    width: spacingVars['--spacing-12'],
    height: spacingVars['--spacing-12'],
    boxSizing: 'content-box',
    padding: spacingVars['--spacing-0-5'],
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-error']} 10%, transparent)`,
    color: colorVars['--color-text-error'],
  },
  title: {
    fontSize: '1.3125rem',
    lineHeight: 1.3,
    textAlign: 'center',
  },
  /** The note that would be lost, in a faint green box. */
  note: {
    width: '100%',
    boxSizing: 'border-box',
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`,
    borderRadius: `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`,
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-accent']} 7%, transparent)`,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    textAlign: 'start',
  },
  /** Keep and Remove share the row, half each. */
  actions: {
    width: '100%',
    marginBlockStart: spacingVars['--spacing-1'],
  },
  action: {
    width: '100%',
  },
})

/**
 * Confirms removing a bookmark that has a note, showing the note that would
 * be lost. "Keep" changes nothing, and has focus when the dialog opens.
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
  const titleId = useId()
  const noteId = useId()

  return (
    <Dialog
      isOpen={bookmark !== null}
      onOpenChange={(isOpen) => !isOpen && onCancel()}
      purpose="form"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={noteId}
      width={400}
      padding={6}
      xstyle={[dialogStyles.panel, dialogStyles.alert]}
    >
      {/* A confirmation has a little more room above it than below. */}
      <VStack gap={4} hAlign="center" paddingBlockStart={1}>
        <VStack hAlign="center" vAlign="center" aria-hidden xstyle={styles.mark}>
          <Icon icon={TrashIcon} size="lg" />
        </VStack>
        <Heading level={2} weight="medium" id={titleId} xstyle={styles.title}>
          {bookmark ? `Remove bookmark ${bookmark.reference}? Your note will be lost.` : ''}
        </Heading>
        <Text type="body" id={noteId} xstyle={styles.note}>
          {bookmark?.note ?? ''}
        </Text>
        <Stack direction="horizontal" gap={2} xstyle={styles.actions}>
          <Button
            label="Keep"
            variant="secondary"
            onClick={onCancel}
            data-autofocus
            xstyle={[
              dialogButtonStyles.pill,
              dialogButtonStyles.secondary,
              dialogButtonStyles.taller,
              styles.action,
            ]}
          />
          <Button
            label="Remove"
            variant="destructive"
            onClick={onConfirm}
            xstyle={[
              dialogButtonStyles.pill,
              dialogButtonStyles.destructive,
              dialogButtonStyles.taller,
              styles.action,
            ]}
          />
        </Stack>
      </VStack>
    </Dialog>
  )
}
