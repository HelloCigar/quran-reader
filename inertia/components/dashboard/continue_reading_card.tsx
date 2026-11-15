import { BookOpenIcon } from '@heroicons/react/24/outline'
import { ClickableCard } from '@astryxdesign/core/ClickableCard'
import { HStack } from '@astryxdesign/core/HStack'
import { VStack } from '@astryxdesign/core/VStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Icon } from '@astryxdesign/core/Icon'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'

/**
 * The dashboard's main card. It opens the reader at the Reading Position, or
 * at Al-Fatihah 1:1 for a reader who hasn't read yet.
 */
export default function ContinueReadingCard({
  readingPosition,
}: {
  readingPosition: Data.ReadingPosition.Variants['forContinuing'] | null
}) {
  const title = readingPosition ? 'Continue reading' : 'Start reading'
  const surahName = readingPosition ? readingPosition.surahName : 'Al-Fatihah'
  const reference = readingPosition ? readingPosition.reference : '1:1'
  const href = readingPosition
    ? urlFor(
        'surahs.show',
        { number: readingPosition.surahNumber },
        { qs: { ayah: readingPosition.ayahNumber } }
      )
    : urlFor('surahs.show', { number: 1 }, { qs: { ayah: 1 } })

  return (
    <ClickableCard label={`${title} at ${reference}`} href={href} padding={6} elevation="low">
      <HStack gap={4} align="center">
        <Icon icon={BookOpenIcon} size="lg" />
        <VStack gap={1}>
          <Heading level={2}>{title}</Heading>
          <Text type="body" color="secondary">
            {surahName} · Ayah {reference}
          </Text>
        </VStack>
      </HStack>
    </ClickableCard>
  )
}
