import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'

/**
 * The end of a surah: the previous surah, the surah list and the next surah.
 * Al-Faatiha has no previous surah and An-Naas has no next.
 */
export default function SurahPager({
  previous,
  next,
}: {
  previous: Data.Surah | null
  next: Data.Surah | null
}) {
  return (
    <HStack gap={3} wrap="wrap" justify="between">
      {previous && (
        <Button
          label={`← ${previous.name}`}
          href={urlFor('surahs.show', { number: previous.number })}
        />
      )}
      <Button label="All surahs" href={urlFor('surahs.index')} variant="ghost" />
      {next && (
        <Button label={`${next.name} →`} href={urlFor('surahs.show', { number: next.number })} />
      )}
    </HStack>
  )
}
