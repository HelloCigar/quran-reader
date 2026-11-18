import * as stylex from '@stylexjs/stylex'
import { List } from '@astryxdesign/core/List'
import { VStack } from '@astryxdesign/core/VStack'
import {
  borderVars,
  colorVars,
  durationVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { BookOpenIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import type { Data } from '@generated/data'
import type { InertiaProps } from '~/types'
import { urlFor } from '~/client'
import AppLayout from '~/components/app/app_layout'
import PageLayout from '~/components/app/page_layout'
import SurahListItem from '~/components/quran/surah_list_item'
import ContinueReadingCard from '~/components/quran/continue_reading_card'
import QuranCredit from '~/components/quran/quran_credit'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
/** The buttons spring back with a little overshoot. */
const SPRING = 'cubic-bezier(0.34, 1.5, 0.5, 1)'
/** 18px: the padding of a button beside its label. */
const BUTTON_PAD = `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`

const PHONE = '@media (max-width: 600px)'

const styles = stylex.create({
  /** The pills sit in the heading on a screen; a phone has the card under it, and a menu for the bookmarks. */
  wide: { display: { default: null, [PHONE]: 'none' } },
  /** The phone's card is hidden on a wide screen. */
  phone: { display: { default: 'none', [PHONE]: 'flex' } },
  /** The rows sit 4px apart, 2px on a phone. */
  list: { rowGap: { default: spacingVars['--spacing-1'], [PHONE]: spacingVars['--spacing-0-5'] } },
  /** A pill, 44px high, that lifts under a mouse and gives under a press. */
  button: {
    minHeight: spacingVars['--spacing-11'],
    paddingInline: BUTTON_PAD,
    borderRadius: radiusVars['--radius-full'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    transform: {
      default: 'none',
      ':hover': {
        default: null,
        '@media (hover: hover)': `translateY(calc(-1 * ${borderVars['--border-width']}))`,
      },
      ':active': 'scale(0.96)',
    },
    transitionProperty: {
      default: 'transform, background-color, box-shadow',
      [REDUCED_MOTION]: 'none',
    },
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: SPRING,
  },
  /** White on the page, held by a faint ring. */
  secondary: {
    backgroundColor: colorVars['--color-background-card'],
    boxShadow: `0 0 0 ${borderVars['--border-width']} ${colorVars['--color-border']}`,
  },
})

type PageProps = InertiaProps<{
  surahs: Data.Surah.Variants['forIndex'][]
  /** "114 Surahs". */
  surahCount: string
  readingPosition: Data.ReadingPosition.Variants['forIndex'] | null
}>

export default function Index({ surahs, surahCount, readingPosition, user }: PageProps) {
  const continueHref =
    readingPosition &&
    urlFor(
      'surahs.show',
      { number: readingPosition.surahNumber },
      { qs: { ayah: readingPosition.ayahNumber } }
    )

  return (
    <PageLayout
      title="The Quran"
      inset="row"
      eyebrow={surahCount}
      actions={
        (readingPosition || user) && (
          <>
            {readingPosition && continueHref && (
              <Button
                label={`Continue at ${readingPosition.reference}`}
                variant="primary"
                size="lg"
                xstyle={[styles.button, styles.wide]}
                icon={<Icon icon={BookOpenIcon} />}
                href={continueHref}
              />
            )}
            {user && (
              <Button
                label="Your bookmarks"
                variant="secondary"
                size="lg"
                xstyle={[styles.button, styles.secondary, styles.wide]}
                icon={<Icon icon={BookmarkIcon} />}
                href={urlFor('bookmarks.index')}
              />
            )}
          </>
        )
      }
    >
      {readingPosition && continueHref && (
        <ContinueReadingCard
          surahName={readingPosition.surahName}
          reference={readingPosition.reference}
          href={continueHref}
          xstyle={styles.phone}
        />
      )}
      <List edge="flush" aria-label="Surahs" xstyle={styles.list}>
        {surahs.map((surah, index) => (
          <SurahListItem key={surah.number} surah={surah} entranceOrder={index + 1} />
        ))}
      </List>
      <VStack paddingInline={5}>
        <QuranCredit size="roomy" />
      </VStack>
    </PageLayout>
  )
}

Index.layout = [AppLayout]
