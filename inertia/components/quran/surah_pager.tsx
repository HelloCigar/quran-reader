import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'

/**
 * The end of a surah: the previous and next surahs on one row, with the surah
 * list beneath. Al-Faatiha has no previous surah and An-Naas has no next. Each
 * button shows the surah's name; its accessible name says which way it goes.
 */
export default function SurahPager({
  previous,
  next,
}: {
  previous: Data.Surah | null
  next: Data.Surah | null
}) {
  return (
    <VStack gap={3}>
      <HStack gap={3} justify={previous ? 'between' : 'end'}>
        {previous && (
          <Button
            label={`Previous surah: ${previous.name}`}
            icon={<Icon icon={ArrowLeftIcon} />}
            href={urlFor('surahs.show', { number: previous.number })}
          >
            {previous.name}
          </Button>
        )}
        {next && (
          <Button
            label={`Next surah: ${next.name}`}
            endContent={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            href={urlFor('surahs.show', { number: next.number })}
          >
            {next.name}
          </Button>
        )}
      </HStack>
      <HStack justify="center">
        <Button label="All surahs" href={urlFor('surahs.index')} variant="ghost" />
      </HStack>
    </VStack>
  )
}
