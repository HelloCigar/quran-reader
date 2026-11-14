import { useEffect, useRef } from 'react'
import { VStack } from '@astryxdesign/core/VStack'
import { List, ListItem } from '@astryxdesign/core/List'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import GoToAyahForm from '~/components/quran/go_to_ayah_form'

/**
 * The reading page's way around the Quran: "Go to Ayah", and every Surah with
 * the one being read marked and scrolled into view.
 */
export default function ReaderSidebar({
  surahs,
  current,
}: {
  surahs: Data.Surah.Variants['forNavigation'][]
  current: number
}) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    listRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'center' })
  }, [current])

  return (
    <VStack gap={4}>
      <GoToAyahForm />
      <List ref={listRef} density="compact" aria-label="Surahs">
        {surahs.map((surah) => (
          <ListItem
            key={surah.number}
            label={`${surah.number} · ${surah.name}`}
            href={urlFor('surahs.show', { number: surah.number })}
            isSelected={surah.number === current}
          />
        ))}
      </List>
    </VStack>
  )
}
