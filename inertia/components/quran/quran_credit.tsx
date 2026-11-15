import { Text } from '@astryxdesign/core/Text'
import { Link } from '@astryxdesign/core/Link'

/**
 * The credit on every page that shows Quran text: the source and the
 * translation.
 */
export default function QuranCredit({ align = 'start' }: { align?: 'start' | 'center' }) {
  return (
    <Text type="supporting" color="secondary" as="p" justify={align}>
      Quran text and word-by-word data from{' '}
      <Link href="https://quran.foundation" target="_blank">
        Quran Foundation
      </Link>{' '}
      (quran.foundation) · English translation: Saheeh International.
    </Text>
  )
}
