import type { Data } from '@generated/data'
import type { InertiaProps } from '~/types'
import AppLayout from '~/components/app/app_layout'
import PageLayout from '~/components/app/page_layout'
import ContinueReadingCard from '~/components/dashboard/continue_reading_card'
import RecentBookmarks from '~/components/dashboard/recent_bookmarks'

type PageProps = InertiaProps<{
  continueReading: Data.ReadingPosition.Variants['forContinuing']
  bookmarks: Data.Bookmark.Variants['forRow'][]
}>

export default function Dashboard({ continueReading, bookmarks }: PageProps) {
  return (
    <PageLayout
      title="Dashboard"
      eyebrow="Assalamu alaikum"
      gap="roomy"
      phoneTop="roomy"
      phoneSides="roomy"
    >
      <ContinueReadingCard continueReading={continueReading} />
      <RecentBookmarks bookmarks={bookmarks} />
    </PageLayout>
  )
}

Dashboard.layout = [AppLayout]
