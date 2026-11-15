import { Head } from '@inertiajs/react'
import { ArrowRightIcon } from '@heroicons/react/20/solid'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { urlFor } from '~/client'
import AppLayout from '~/components/app/app_layout'
import { PAGE_INSET } from '~/components/app/page_layout'
import QuranCredit from '~/components/quran/quran_credit'

/** From Astryx's `centered-hero` template. */
export default function Home() {
  return (
    <Layout
      height="auto"
      content={
        <LayoutContent padding={PAGE_INSET}>
          <Head title="Welcome" />
          <VStack gap={10} hAlign="center" paddingBlock={8}>
            <VStack gap={6} hAlign="center">
              <VStack gap={3} hAlign="center" maxWidth={720}>
                <Heading level={1} type="display-2" justify="center" textWrap="balance">
                  Read the Quran in Arabic and English.
                </Heading>
                <Text type="body" color="secondary" justify="center" textWrap="balance">
                  Read every surah ayah by ayah, in the original Arabic beside the Saheeh
                  International translation. Sign in to bookmark ayahs and keep a note on each.
                </Text>
              </VStack>
              <HStack gap={3} wrap="wrap" hAlign="center">
                <Button
                  label="Read the Quran"
                  href={urlFor('surahs.index')}
                  variant="primary"
                  endContent={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                />
                <Button
                  label="Create an account"
                  href={urlFor('new_account.create')}
                  variant="secondary"
                />
              </HStack>
            </VStack>
            <QuranCredit align="center" />
          </VStack>
        </LayoutContent>
      }
    />
  )
}

Home.layout = [AppLayout]
