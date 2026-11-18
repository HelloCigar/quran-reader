import * as stylex from '@stylexjs/stylex'
import { useRouter } from '@adonisjs/inertia/react'
import { Button } from '@astryxdesign/core/Button'
import { HStack } from '@astryxdesign/core/HStack'
import { Text } from '@astryxdesign/core/Text'
import {
  borderVars,
  colorVars,
  durationVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
const HOVER = '@media (hover: hover)'
const PHONE = '@media (max-width: 600px)'
const PAGE_SIZE = { default: spacingVars['--spacing-10'], [PHONE]: spacingVars['--spacing-11'] }

/** The pages a reader can go to: all of them, or the first, the last and those around the current one. */
function pagesToShow(current: number, last: number): (number | 'gap')[] {
  if (last <= 7) return Array.from({ length: last }, (_, index) => index + 1)
  const from = Math.max(2, Math.min(current - 1, last - 4))
  const to = Math.min(last - 1, Math.max(current + 1, 5))
  const middle = Array.from({ length: to - from + 1 }, (_, index) => from + index)
  return [
    1,
    ...(from > 2 ? ['gap' as const] : []),
    ...middle,
    ...(to < last - 1 ? ['gap' as const] : []),
    last,
  ]
}

const styles = stylex.create({
  nav: { columnGap: spacingVars['--spacing-1'] },
  /** A round 40px button (44px on a phone); the current page is filled. */
  page: {
    width: PAGE_SIZE,
    height: PAGE_SIZE,
    minWidth: PAGE_SIZE,
    minHeight: PAGE_SIZE,
    padding: 0,
    borderRadius: radiusVars['--radius-full'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    fontVariantNumeric: 'tabular-nums',
    color: colorVars['--color-text-secondary'],
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        default: null,
        [HOVER]: `color-mix(in srgb, ${colorVars['--color-text-primary']} 6%, transparent)`,
      },
    },
    transitionProperty: {
      default: 'background-color, color, box-shadow',
      [REDUCED_MOTION]: 'none',
    },
    transitionDuration: durationVars['--duration-fast'],
  },
  current: {
    color: colorVars['--color-background-card'],
    backgroundColor: {
      default: colorVars['--color-text-primary'],
      ':hover': colorVars['--color-text-primary'],
    },
  },
  gap: {
    width: PAGE_SIZE,
    textAlign: 'center',
    borderBlockStart: `${borderVars['--border-width']} solid transparent`,
  },
})

/**
 * The bookmarks list's pages, as round numbered buttons with the current one
 * filled. Choosing one opens that page of the list.
 */
export default function BookmarksPagination({
  currentPage,
  lastPage,
}: {
  currentPage: number
  lastPage: number
}) {
  const router = useRouter()

  return (
    <HStack
      as="nav"
      aria-label="Pages of bookmarks"
      hAlign="center"
      vAlign="center"
      xstyle={styles.nav}
    >
      {pagesToShow(currentPage, lastPage).map((page, index) =>
        page === 'gap' ? (
          <Text
            key={`gap-${index}`}
            type="body"
            color="secondary"
            aria-hidden="true"
            xstyle={styles.gap}
          >
            …
          </Text>
        ) : (
          <Button
            key={page}
            label={String(page)}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            variant="ghost"
            xstyle={[styles.page, page === currentPage && styles.current]}
            onClick={() => router.visit({ route: 'bookmarks.index', qs: { page } })}
          />
        )
      )}
    </HStack>
  )
}
