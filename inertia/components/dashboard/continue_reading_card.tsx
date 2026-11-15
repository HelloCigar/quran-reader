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
 * where a new reader starts.
 */
export default function ContinueReadingCard({
  continueReading,
}: {
  continueReading: Data.ReadingPosition.Variants['forContinuing']
}) {
  return (
    <ClickableCard
      label={continueReading.label}
      href={urlFor(
        'surahs.show',
        { number: continueReading.surahNumber },
        { qs: { ayah: continueReading.ayahNumber } }
      )}
      padding={6}
      elevation="low"
    >
      <HStack gap={4} align="center">
        <Icon icon={BookOpenIcon} size="lg" />
        <VStack gap={1}>
          <Heading level={2}>{continueReading.heading}</Heading>
          <Text type="body" color="secondary">
            {continueReading.title}
          </Text>
        </VStack>
      </HStack>
    </ClickableCard>
  )
}
