import * as stylex from '@stylexjs/stylex'
import { HStack } from '@astryxdesign/core/HStack'
import { VStack } from '@astryxdesign/core/VStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import ArabicText from '~/components/quran/arabic_text'
import type { Data } from '@generated/data'

const styles = stylex.create({
  /** The small capitals over the name, spaced a little apart. */
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  /** The two names stand on one line: their letters share a baseline. */
  names: {
    alignItems: 'baseline',
    columnGap: spacingVars['--spacing-4'],
  },
})

/**
 * The top of a surah, in three rows: its number, where it was revealed and
 * how many ayahs it has, in small capitals; its transliterated name as the
 * page's title with its Arabic name in the accent colour across from it, the
 * two on one baseline; and its meaning. On a narrow screen the Arabic name
 * wraps under the title.
 */
export default function SurahHeading({ surah }: { surah: Data.Surah.Variants['forReading'] }) {
  return (
    <VStack gap={1} paddingInline={3}>
      <Text type="supporting" weight="medium" xstyle={styles.eyebrow}>
        {`Surah ${surah.number} · ${surah.revelation} · ${surah.ayahCount.formatted}`}
      </Text>
      <HStack hAlign="between" wrap="wrap" xstyle={styles.names}>
        <Heading level={1} type="display-2" weight="medium">
          {surah.name}
        </Heading>
        <ArabicText color="accent">{surah.arabicName}</ArabicText>
      </HStack>
      <Text type="body" color="secondary">
        {surah.meaning}
      </Text>
    </VStack>
  )
}
