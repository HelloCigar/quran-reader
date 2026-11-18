import * as stylex from '@stylexjs/stylex'
import { useId } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { colorVars, radiusVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { Dialog } from '@astryxdesign/core/Dialog'
import { Heading } from '@astryxdesign/core/Heading'
import { HStack } from '@astryxdesign/core/HStack'
import { VStack } from '@astryxdesign/core/VStack'
import { Button } from '@astryxdesign/core/Button'
import { IconButton } from '@astryxdesign/core/IconButton'
import { Icon } from '@astryxdesign/core/Icon'
import { TextArea } from '@astryxdesign/core/TextArea'
import type { Data } from '@generated/data'
import { focusBookmarkTrigger } from '~/components/bookmarks/bookmarked_menu'
import { dialogButtonStyles, dialogStyles } from '~/components/bookmarks/dialog_styles'
import { useRouteForm } from '~/components/forms/use_route_form'
import ArabicText from '~/components/quran/arabic_text'

const styles = stylex.create({
  title: {
    fontSize: '1.375rem',
    lineHeight: 'normal',
    outline: 'none',
  },
  /** The Ayah under the title: Arabic at a reading size, a step quieter than the title. */
  arabic: {
    fontSize: '1.25rem',
    lineHeight: 1.7,
  },
  /** The close button is a round 40px target that tucks into the dialog's corner. */
  close: {
    width: spacingVars['--spacing-10'],
    height: spacingVars['--spacing-10'],
    marginBlockStart: `calc(${spacingVars['--spacing-1-5']} * -1)`,
    marginInlineEnd: `calc(${spacingVars['--spacing-1-5']} * -1)`,
    borderRadius: radiusVars['--radius-full'],
    color: colorVars['--color-text-secondary'],
  },
})

/**
 * Asks for the optional note on a bookmark, and saves it. "Not now" dismisses
 * it without changing anything; saving an empty note clears it. Shared by the
 * surah page and the bookmarks list. Pass `arabic`, the Ayah's text, to show
 * it under the title.
 */
export default function NoteDialog({
  bookmark,
  arabic,
  onClose,
}: {
  bookmark: Data.Bookmark
  arabic?: string
  onClose: () => void
}) {
  const titleId = useId()
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
    <Dialog
      isOpen
      onOpenChange={(isOpen) => !isOpen && close()}
      purpose="form"
      width={480}
      padding={6}
      aria-labelledby={titleId}
      xstyle={dialogStyles.panel}
    >
      <form onSubmit={form.submit}>
        <VStack gap={5}>
          <HStack hAlign="between" vAlign="start" gap={3}>
            <VStack gap={1}>
              <Heading
                level={2}
                weight="medium"
                id={titleId}
                tabIndex={-1}
                data-autofocus="dialog-title"
                xstyle={styles.title}
              >
                {`Note on ${bookmark.reference}`}
              </Heading>
              {arabic && (
                <ArabicText color="secondary" xstyle={styles.arabic}>
                  {arabic}
                </ArabicText>
              )}
            </VStack>
            <IconButton
              label="Close"
              variant="ghost"
              icon={<Icon icon={XMarkIcon} />}
              onClick={close}
              xstyle={styles.close}
            />
          </HStack>
          <TextArea label="Note" rows={5} maxLength={500} {...form.field('note')} />
          <HStack gap={2} hAlign="end">
            <Button
              label="Not now"
              variant="secondary"
              onClick={close}
              xstyle={[dialogButtonStyles.pill, dialogButtonStyles.secondary]}
            />
            <Button
              type="submit"
              label="Save"
              variant="primary"
              isLoading={form.processing}
              xstyle={[dialogButtonStyles.pill, dialogButtonStyles.primary]}
            />
          </HStack>
        </VStack>
      </form>
    </Dialog>
  )
}
