import { List } from '@astryxdesign/core/List'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { BookOpenIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import type { Data } from '@generated/data'
import type { InertiaProps } from '~/types'
import { urlFor } from '~/client'
import AppLayout from '~/components/app/app_layout'
import PageLayout from '~/components/app/page_layout'
import SurahListItem from '~/components/quran/surah_list_item'
import QuranCredit from '~/components/quran/quran_credit'

type PageProps = InertiaProps<{
  surahs: Data.Surah[]
  readingPosition: Data.ReadingPosition | null
}>

export default function Index({ surahs, readingPosition, user }: PageProps) {
  return (
    <PageLayout
      title="The Quran"
      actions={
        (readingPosition || user) && (
          <>
            {readingPosition && (
              <Button
                label={`Continue at ${readingPosition.reference}`}
                variant="primary"
                icon={<Icon icon={BookOpenIcon} />}
                href={urlFor(
                  'surahs.show',
                  { number: readingPosition.surahNumber },
                  { qs: { ayah: readingPosition.ayahNumber } }
                )}
              />
            )}
            {user && (
              <Button
                label="Your bookmarks"
                variant="secondary"
                icon={<Icon icon={BookmarkIcon} />}
                href={urlFor('bookmarks.index')}
              />
            )}
          </>
        )
      }
    >
      <List hasDividers edge="flush" aria-label="Surahs">
        {surahs.map((surah) => (
          <SurahListItem key={surah.number} surah={surah} />
        ))}
      </List>
      <QuranCredit />
    </PageLayout>
  )
}

Index.layout = [AppLayout]
