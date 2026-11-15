import { Head } from '@inertiajs/react'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { VStack } from '@astryxdesign/core/VStack'
import { Heading } from '@astryxdesign/core/Heading'
import type { Data } from '@generated/data'
import type { InertiaProps } from '~/types'
import AppLayout from '~/components/app/app_layout'
import ContinueReadingCard from '~/components/dashboard/continue_reading_card'
import RecentBookmarks from '~/components/dashboard/recent_bookmarks'

type PageProps = InertiaProps<{
  readingPosition: Data.ReadingPosition.Variants['forContinuing'] | null
  bookmarks: Data.Bookmark.Variants['forRecent'][]
}>

export default function Dashboard({ readingPosition, bookmarks }: PageProps) {
  return (
    <Layout
      height="auto"
      contentWidth={720}
      content={
        <LayoutContent padding={6}>
          <Head title="Dashboard" />
          <VStack gap={8}>
            <Heading level={1}>Dashboard</Heading>
            <ContinueReadingCard readingPosition={readingPosition} />
            <RecentBookmarks bookmarks={bookmarks} />
          </VStack>
        </LayoutContent>
      }
    />
  )
}

Dashboard.layout = [AppLayout]
