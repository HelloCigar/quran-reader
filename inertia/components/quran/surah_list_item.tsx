import { ListItem } from '@astryxdesign/core/List'
import { Text } from '@astryxdesign/core/Text'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'

/**
 * One surah row in the surah list: "1 · Al-Faatiha", its meaning and its
 * ayah count, linking to the surah.
 */
export default function SurahListItem({ surah }: { surah: Data.Surah }) {
  return (
    <ListItem
      label={`${surah.number} · ${surah.name}`}
      description={surah.meaning}
      endContent={
        <Text type="supporting" color="secondary">
          {surah.ayahCount.formatted}
        </Text>
      }
      href={urlFor('surahs.show', { number: surah.number })}
    />
  )
}
