import { Head } from '@inertiajs/react'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { VStack } from '@astryxdesign/core/VStack'
import { Text } from '@astryxdesign/core/Text'
import { List } from '@astryxdesign/core/List'
import type { Data } from '@generated/data'
import type { InertiaProps } from '~/types'
import MarketingLayout from '~/components/marketing/marketing_layout'
import SurahHeading from '~/components/quran/surah_heading'
import AyahItem from '~/components/quran/ayah_item'
import QuranCredit from '~/components/quran/quran_credit'
import SurahPager from '~/components/quran/surah_pager'

type PageProps = InertiaProps<{
  surah: Data.Surah.Variants['forReading']
  bismillah: string | null
  ayahs: Data.Ayah[]
  previous: Data.Surah | null
  next: Data.Surah | null
}>

export default function Show({ surah, bismillah, ayahs, previous, next }: PageProps) {
  return (
    <Layout
      height="auto"
      contentWidth={720}
      content={
        <LayoutContent padding={6}>
          <Head title={surah.name} />
          <VStack gap={6}>
            <SurahHeading surah={surah} />
            {bismillah && (
              <VStack dir="rtl" hAlign="center" data-testid="bismillah">
                <Text type="large" justify="center">
                  {bismillah}
                </Text>
              </VStack>
            )}
            <List hasDividers edge="flush" aria-label="Ayahs">
              {ayahs.map((ayah) => (
                <AyahItem key={ayah.number} ayah={ayah} />
              ))}
            </List>
            <SurahPager previous={previous} next={next} />
            <QuranCredit />
          </VStack>
        </LayoutContent>
      }
    />
  )
}

Show.layout = [MarketingLayout]
