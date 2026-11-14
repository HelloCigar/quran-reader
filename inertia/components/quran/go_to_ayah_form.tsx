import { ArrowRightIcon } from '@heroicons/react/20/solid'
import { HStack } from '@astryxdesign/core/HStack'
import { StackItem } from '@astryxdesign/core/Stack'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { useRouteForm } from '~/components/forms/use_route_form'

/**
 * "Go to Ayah": the reader types an Ayah Reference (`2:255`) and the Surah
 * opens at that Ayah. A reference the server rejects shows its error here and
 * the reader stays where they were.
 */
export default function GoToAyahForm() {
  const form = useRouteForm(
    'ayahs.show',
    { reference: '' },
    { preserveState: 'errors', preserveScroll: 'errors' }
  )

  return (
    <form onSubmit={form.submit}>
      <HStack gap={2} vAlign="end">
        <StackItem size="fill">
          <TextInput
            label="Go to Ayah"
            placeholder="2:255"
            autoComplete="off"
            enterKeyHint="go"
            {...form.field('reference')}
          />
        </StackItem>
        <Button
          type="submit"
          label="Go"
          isIconOnly
          icon={<Icon icon={ArrowRightIcon} />}
          isLoading={form.processing}
        />
      </HStack>
    </form>
  )
}
