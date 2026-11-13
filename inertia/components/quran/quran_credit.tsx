import { Text } from '@astryxdesign/core/Text'
import { Link } from '@astryxdesign/core/Link'

/**
 * The credit the text source's terms require on every page that shows Quran
 * text: the source and the translation.
 */
export default function QuranCredit() {
  return (
    <Text type="supporting" as="p">
      Quran text from{' '}
      <Link href="https://alquran.cloud" target="_blank">
        Al Quran Cloud
      </Link>{' '}
      (alquran.cloud) · English translation: Saheeh International.
    </Text>
  )
}
