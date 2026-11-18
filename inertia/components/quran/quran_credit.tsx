import * as stylex from '@stylexjs/stylex'
import { Text } from '@astryxdesign/core/Text'
import { Link } from '@astryxdesign/core/Link'
import { textSizeVars } from '@astryxdesign/core/theme/tokens.stylex'

const styles = stylex.create({
  /** One step up from the supporting text: 13px, for the credit under a list. */
  roomy: {
    fontSize: `calc((${textSizeVars['--font-size-sm']} + ${textSizeVars['--font-size-base']}) / 2)`,
  },
})

/**
 * The credit on every page that shows Quran text: the source and the
 * translation. `size="roomy"` sets it a little larger, as under the surah list.
 */
export default function QuranCredit({
  align = 'start',
  size = 'default',
}: {
  align?: 'start' | 'center'
  size?: 'default' | 'roomy'
}) {
  return (
    <Text
      type="supporting"
      color="secondary"
      as="p"
      justify={align}
      xstyle={size === 'roomy' && styles.roomy}
    >
      Quran text and word-by-word data from{' '}
      <Link href="https://quran.foundation" target="_blank">
        Quran Foundation
      </Link>{' '}
      (quran.foundation) · English translation: Saheeh International.
    </Text>
  )
}
