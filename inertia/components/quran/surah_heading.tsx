import { VStack } from '@astryxdesign/core/VStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import type { Data } from '@generated/data'

/**
 * The top of a surah: its transliterated name, Arabic name, meaning, where it
 * was revealed and how many ayahs it has.
 */
export default function SurahHeading({ surah }: { surah: Data.Surah.Variants['forReading'] }) {
  return (
    <VStack gap={2}>
      <Heading level={1}>{surah.name}</Heading>
      <VStack dir="rtl">
        <Text type="large">{surah.arabicName}</Text>
      </VStack>
      <Text type="body" color="secondary">
        {surah.meaning}
      </Text>
      <Text type="supporting">{`${surah.revelation} · ${surah.ayahCount.formatted}`}</Text>
    </VStack>
  )
}
