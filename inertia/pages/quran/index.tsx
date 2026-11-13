import { Head } from '@inertiajs/react'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { VStack } from '@astryxdesign/core/VStack'
import { Heading } from '@astryxdesign/core/Heading'
import { List } from '@astryxdesign/core/List'
import type { Data } from '@generated/data'
import type { InertiaProps } from '~/types'
import MarketingLayout from '~/components/marketing/marketing_layout'
import SurahListItem from '~/components/quran/surah_list_item'
import QuranCredit from '~/components/quran/quran_credit'

type PageProps = InertiaProps<{ surahs: Data.Surah[] }>

export default function Index({ surahs }: PageProps) {
  return (
    <Layout
      height="auto"
      contentWidth={720}
      content={
        <LayoutContent padding={6}>
          <Head title="The Quran" />
          <VStack gap={6}>
            <Heading level={1}>The Quran</Heading>
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

Index.layout = [MarketingLayout]
