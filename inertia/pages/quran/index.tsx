import { Head } from '@inertiajs/react'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { VStack } from '@astryxdesign/core/VStack'
import { Heading } from '@astryxdesign/core/Heading'
import { List } from '@astryxdesign/core/List'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { Link } from '@astryxdesign/core/Link'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import type { Data } from '@generated/data'
import type { InertiaProps } from '~/types'
import { urlFor } from '~/client'
import AppLayout from '~/components/app/app_layout'
import SurahListItem from '~/components/quran/surah_list_item'
import QuranCredit from '~/components/quran/quran_credit'

type PageProps = InertiaProps<{
  surahs: Data.Surah[]
  readingPosition: Data.ReadingPosition | null
}>

export default function Index({ surahs, readingPosition, user }: PageProps) {
  return (
    <Layout
      height="auto"
      contentWidth={720}
      content={
        <LayoutContent padding={6}>
          <Head title="The Quran" />
          <VStack gap={6}>
            <VStack gap={3} hAlign="start">
              <Heading level={1}>The Quran</Heading>
              {user && (
                <Button
                  label="Your bookmarks"
                  variant="secondary"
                  icon={<Icon icon={BookmarkIcon} />}
                  href={urlFor('bookmarks.index')}
                />
              )}
            </VStack>
            {readingPosition && (
              <Link
                href={urlFor(
                  'surahs.show',
                  { number: readingPosition.surahNumber },
                  { qs: { ayah: readingPosition.ayahNumber } }
                )}
              >
                Continue at {readingPosition.reference}
              </Link>
            )}
            <List hasDividers edge="flush" aria-label="Surahs">
              {surahs.map((surah) => (
                <SurahListItem key={surah.number} surah={surah} />
              ))}
            </List>
            <QuranCredit />
          </VStack>
        </LayoutContent>
      }
    />
  )
}

Index.layout = [AppLayout]
