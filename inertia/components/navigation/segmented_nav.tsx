import * as stylex from '@stylexjs/stylex'
import {
  borderVars,
  colorVars,
  durationVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { Grid } from '@astryxdesign/core/Grid'
import { Stack } from '@astryxdesign/core/Stack'
import { Icon } from '@astryxdesign/core/Icon'
import { TopNavItem } from '@astryxdesign/core/TopNav'
import { type useNavItems } from '~/components/navigation/nav'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
/** A little overshoot, so the pill and the icons settle instead of stopping dead. */
const SPRING = 'cubic-bezier(0.34, 1.36, 0.5, 1)'

const styles = stylex.create({
  /** The tinted track. Its equal columns are what let the pill slide by whole widths. */
  track: {
    position: 'relative',
    padding: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-text-primary']} 6%, transparent)`,
  },
  /**
   * The selected pill. It is taken out of the flow and sits over the first
   * column, inside the track's padding; `pillWidth` gives it one column's
   * width, so it needs no measuring.
   */
  pill: {
    position: 'absolute',
    insetBlock: spacingVars['--spacing-1'],
    insetInlineStart: spacingVars['--spacing-1'],
    pointerEvents: 'none',
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-background-card'],
    boxShadow: shadowVars['--shadow-low'],
    transitionProperty: { default: 'transform, opacity', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: SPRING,
  },
  /** One of `count` equal columns of the track, less its padding on both sides. */
  pillWidth: (count: number) => ({
    width: `calc((100% - 2 * ${spacingVars['--spacing-1']}) / ${count})`,
  }),
  /** One column is 100% of the pill's own width. */
  pillAt: (index: number) => ({ transform: `translateX(${index * 100}%)` }),
  /** No area is open (the home page, an error page): the pill fades out where it was. */
  pillHidden: { opacity: 0 },
  /** The item paints no background of its own: the pill under it is the selection. */
  item: {
    position: 'relative',
    justifyContent: 'center',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    borderRadius: radiusVars['--radius-full'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    whiteSpace: 'nowrap',
    backgroundColor: 'transparent',
    backgroundImage: 'none',
    color: {
      default: colorVars['--color-text-secondary'],
      ':hover': colorVars['--color-text-primary'],
    },
    transitionProperty: { default: 'color', [REDUCED_MOTION]: 'none' },
    '--segmented-nav-icon-transform': {
      default: 'none',
      ':hover': {
        default: `translateY(calc(-1 * ${borderVars['--border-width']})) scale(1.08)`,
        [REDUCED_MOTION]: 'none',
      },
    },
  },
  itemSelected: {
    color: colorVars['--color-text-primary'],
  },
  /** The icon lifts while its item is hovered; the item sets the variable. */
  icon: {
    transform: 'var(--segmented-nav-icon-transform, none)',
    transitionProperty: { default: 'transform', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-medium-min'],
    transitionTimingFunction: SPRING,
  },
})

/**
 * The areas of the top bar on a wide screen, as one segmented group: the
 * links sit side by side on a tinted track, and one pill marks the area that
 * is open and slides to the next one when the reader changes area. The links
 * are `TopNavItem`s, so they navigate with Inertia and the open one carries
 * `aria-current="page"`.
 *
 * Render it inside `TopNav` (its `centerContent`). It only draws the wide
 * bar; the phone's menu drawer lists plain `TopNavItem`s instead.
 */
export default function SegmentedNav({ items }: { items: ReturnType<typeof useNavItems> }) {
  const selected = items.findIndex((item) => item.isActive)

  return (
    <Grid columns={items.length} xstyle={styles.track}>
      <Stack
        aria-hidden
        xstyle={[
          styles.pill,
          styles.pillWidth(items.length),
          selected === -1 ? styles.pillHidden : styles.pillAt(selected),
        ]}
      />
      {items.map(({ label, href, icon, isActive }) => (
        <TopNavItem
          key={label}
          label={label}
          href={href}
          isSelected={isActive}
          icon={icon && <Icon icon={icon} size="sm" xstyle={styles.icon} />}
          xstyle={[styles.item, isActive && styles.itemSelected]}
        />
      ))}
    </Grid>
  )
}
