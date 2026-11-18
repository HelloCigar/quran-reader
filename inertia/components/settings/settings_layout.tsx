import * as stylex from '@stylexjs/stylex'
import { type ReactNode, useState } from 'react'
import { ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline'
import {
  borderVars,
  colorVars,
  durationVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { HStack } from '@astryxdesign/core/HStack'
import { Stack } from '@astryxdesign/core/Stack'
import { VStack } from '@astryxdesign/core/VStack'
import { Icon } from '@astryxdesign/core/Icon'
import { TopNavItem } from '@astryxdesign/core/TopNav'
import { useNavItems, type NavItem } from '~/components/navigation/nav'
import PageLayout from '~/components/app/page_layout'
import { ENTRANCE_DELAYS, entranceStyles } from '~/components/quran/entrance_styles'
import { SaveBarHost } from '~/components/settings/save_bar_host'

/**
 * The pages of the settings area, listed beside the panel. Register a route
 * for each page and add it here, for example:
 *
 * `{ label: 'Profile', route: 'settings.profile', icon: UserIcon }`
 */
const nav: NavItem[] = [
  { label: 'Profile', route: 'profile.show', icon: UserIcon },
  { label: 'Security', route: 'security.show', icon: ShieldCheckIcon },
]

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
/** The page's phone breakpoint, the one `PageLayout` uses. */
const PHONE = '@media (max-width: 600px)'
/** A little overshoot, so the pill settles into its row instead of stopping dead. */
const SPRING = 'cubic-bezier(0.34, 1.36, 0.5, 1)'

/** A link's height, 44px. */
const ITEM_HEIGHT = spacingVars['--spacing-11']
/** The corners of a link and of its pill, 14px. */
const ITEM_RADIUS = `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`
/** The space between the links, 4px. */
const ITEM_GAP = spacingVars['--spacing-1']
/** The icon of a link, 18px; 17px on a phone. */
const ICON_SIZE = {
  default: `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`,
  [PHONE]: '1.0625rem',
}
/** The space between the sections list and the panel on a phone, 18px. */
const PHONE_GAP = `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`

/** A hairline ring in the text colour. */
const ring = (percent: number) =>
  `0 0 0 ${borderVars['--border-width']} color-mix(in srgb, ${colorVars['--color-text-primary']} ${percent}%, transparent)`

const styles = stylex.create({
  /** The row of the sections list and the panel: it wraps on a narrow screen. */
  body: {
    alignItems: 'flex-start',
    columnGap: spacingVars['--spacing-8'],
    rowGap: { default: spacingVars['--spacing-8'], [PHONE]: PHONE_GAP },
    /** The page's 96px of room below, and 16px more for the Save changes bar fixed under it. */
    marginBlockEnd: { default: 0, [PHONE]: spacingVars['--spacing-4'] },
  },
  /**
   * The list takes 200px to start and is never wider than 240px. On a phone
   * it is a track the width of the page: two equal columns on a tinted,
   * fully rounded bar, with 4px of padding, so the pill can slide by whole
   * widths.
   */
  nav: {
    position: 'relative',
    flex: { default: '1 1 12.5rem', [PHONE]: '1 1 100%' },
    maxWidth: { default: '15rem', [PHONE]: 'none' },
    rowGap: ITEM_GAP,
    display: { default: null, [PHONE]: 'grid' },
    gridTemplateColumns: { default: null, [PHONE]: '1fr 1fr' },
    columnGap: { default: null, [PHONE]: 0 },
    padding: { default: null, [PHONE]: spacingVars['--spacing-1'] },
    borderRadius: { default: null, [PHONE]: radiusVars['--radius-full'] },
    backgroundColor: {
      default: null,
      [PHONE]: `color-mix(in srgb, ${colorVars['--color-text-primary']} 6%, transparent)`,
    },
  },
  /**
   * The white pill behind the section that is open. It is taken out of the
   * flow and sits over the first link; each link is one pill and one gap
   * further down, so it needs no measuring, and it slides because the
   * layout stays mounted when the reader moves between sections.
   */
  pill: {
    position: 'absolute',
    insetBlockStart: { default: 0, [PHONE]: spacingVars['--spacing-1'] },
    insetInlineStart: { default: 0, [PHONE]: spacingVars['--spacing-1'] },
    insetInlineEnd: { default: 0, [PHONE]: 'auto' },
    /** On a phone the pill is one column wide, less the track's padding. */
    width: { default: null, [PHONE]: `calc((100% - 2 * ${spacingVars['--spacing-1']}) / 2)` },
    height: ITEM_HEIGHT,
    pointerEvents: 'none',
    borderRadius: { default: ITEM_RADIUS, [PHONE]: radiusVars['--radius-full'] },
    backgroundColor: colorVars['--color-background-card'],
    boxShadow: `${ring(5)}, 0 ${spacingVars['--spacing-1-5']} ${spacingVars['--spacing-4']} calc(-1 * (${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})) color-mix(in srgb, ${colorVars['--color-text-primary']} 30%, transparent)`,
    transitionProperty: { default: 'transform, opacity', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: SPRING,
  },
  /** Down to its row on a screen; across to its column on a phone. */
  pillAt: (index: number) => ({
    transform: {
      default: `translateY(calc(${index} * (100% + ${ITEM_GAP})))`,
      [PHONE]: `translateX(${index * 100}%)`,
    },
  }),
  pillHidden: { opacity: 0 },
  /** The link paints no background of its own: the pill under it is the selection. */
  item: {
    position: 'relative',
    height: ITEM_HEIGHT,
    minHeight: ITEM_HEIGHT,
    justifyContent: { default: 'flex-start', [PHONE]: 'center' },
    gap: {
      default: `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`,
      [PHONE]: spacingVars['--spacing-2'],
    },
    paddingBlock: 0,
    paddingInline: {
      default: `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`,
      [PHONE]: 0,
    },
    borderRadius: { default: ITEM_RADIUS, [PHONE]: radiusVars['--radius-full'] },
    fontSize: '0.875rem',
    fontWeight: {
      default: fontWeightVars['--font-weight-medium'],
      [PHONE]: fontWeightVars['--font-weight-semibold'],
    },
    backgroundColor: 'transparent',
    backgroundImage: 'none',
    color: {
      default: colorVars['--color-text-secondary'],
      ':hover': colorVars['--color-text-primary'],
    },
    transitionProperty: { default: 'color', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-fast'],
  },
  itemSelected: { color: colorVars['--color-text-primary'] },
  icon: { width: ICON_SIZE, height: ICON_SIZE },
  /** The mount point of the phone's Save changes bar: it takes no room of its own. */
  barHost: { display: 'contents' },
  /**
   * The panel the section sits in: a white card of 24px corners and 32px
   * padding; on a phone, 22px corners and 22px above and below, 18px to each side.
   */
  panel: {
    flex: '999 1 30rem',
    minWidth: 0,
    boxSizing: 'border-box',
    paddingBlock: {
      default: spacingVars['--spacing-8'],
      [PHONE]: `calc(${spacingVars['--spacing-5']} + ${spacingVars['--spacing-0-5']})`,
    },
    paddingInline: {
      default: spacingVars['--spacing-8'],
      [PHONE]: `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`,
    },
    borderRadius: {
      default: spacingVars['--spacing-6'],
      [PHONE]: `calc(${spacingVars['--spacing-5']} + ${spacingVars['--spacing-0-5']})`,
    },
    backgroundColor: colorVars['--color-background-card'],
    boxShadow: ring(5),
  },
})

/**
 * The settings area, under the page's header: the sections as a list beside
 * a white panel that holds the open one. A white pill marks the open section
 * and slides to the next when the reader changes section. Nest it under the
 * app layout from each settings page:
 *
 * `Profile.layout = [AppLayout, SettingsLayout]`
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  const items = useNavItems(nav, { exact: true })
  const selected = items.findIndex((item) => item.isActive)
  // The Save changes bar of a phone renders here, outside the panel's
  // entrance: a fixed bar would otherwise sit in the panel, which moves.
  const [barHost, setBarHost] = useState<HTMLElement | null>(null)

  return (
    <PageLayout title="Settings" size="wide" gap="compact" phoneTop="roomy" phoneSides="roomy">
      <SaveBarHost value={barHost}>
        <HStack wrap="wrap" xstyle={styles.body}>
          {items.length > 0 && (
            <VStack
              as="nav"
              aria-label="Settings sections"
              xstyle={[styles.nav, entranceStyles.fadeUp, ENTRANCE_DELAYS[1]]}
            >
              <Stack
                aria-hidden
                xstyle={[
                  styles.pill,
                  selected === -1 ? styles.pillHidden : styles.pillAt(selected),
                ]}
              />
              {items.map(({ label, href, icon, isActive }) => (
                <TopNavItem
                  key={label}
                  label={label}
                  href={href}
                  isSelected={isActive}
                  icon={icon && <Icon icon={icon} xstyle={styles.icon} />}
                  xstyle={[styles.item, isActive && styles.itemSelected]}
                />
              ))}
            </VStack>
          )}
          <VStack
            as="section"
            hAlign="stretch"
            xstyle={[styles.panel, entranceStyles.fadeUp, ENTRANCE_DELAYS[2]]}
          >
            {children}
          </VStack>
        </HStack>
      </SaveBarHost>
      <Stack ref={setBarHost} xstyle={styles.barHost} />
    </PageLayout>
  )
}
