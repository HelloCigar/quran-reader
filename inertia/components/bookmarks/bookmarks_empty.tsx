import * as stylex from '@stylexjs/stylex'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import {
  borderVars,
  durationVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { urlFor } from '~/client'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
const HOVER = '@media (hover: hover)'
/** The button springs back with a little overshoot. */
const SPRING = 'cubic-bezier(0.34, 1.5, 0.5, 1)'
/** 18px: the padding of a button beside its label. */
const BUTTON_PAD = `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`

const styles = stylex.create({
  /** A green pill, 44px high, that lifts under a mouse and gives under a press. */
  pill: {
    minHeight: spacingVars['--spacing-11'],
    paddingInline: BUTTON_PAD,
    borderRadius: radiusVars['--radius-full'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    transform: {
      default: 'none',
      ':hover': {
        default: null,
        [HOVER]: `translateY(calc(-1 * ${borderVars['--border-width']}))`,
      },
      ':active': 'scale(0.96)',
    },
    transitionProperty: { default: 'transform, background-color', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: SPRING,
  },
})

/**
 * The bookmarks list with nothing in it, offering a way to the Quran.
 */
export default function BookmarksEmpty() {
  return (
    <EmptyState
      headingLevel={2}
      icon={<Icon icon={BookmarkIcon} size="lg" />}
      title="You haven't bookmarked any ayahs yet"
      actions={
        <Button
          label="Read the Quran"
          variant="primary"
          size="lg"
          xstyle={styles.pill}
          href={urlFor('surahs.index')}
        />
      }
    />
  )
}
