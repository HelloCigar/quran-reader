import * as stylex from '@stylexjs/stylex'
import { type ReactNode } from 'react'
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'
import {
  borderVars,
  colorVars,
  durationVars,
  textSizeVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { useAppShellMobile } from '@astryxdesign/core/AppShell'
import { Button } from '@astryxdesign/core/Button'
import { Divider } from '@astryxdesign/core/Divider'
import { Icon } from '@astryxdesign/core/Icon'
import { IconButton } from '@astryxdesign/core/IconButton'
import { Popover } from '@astryxdesign/core/Popover'
import { Stack } from '@astryxdesign/core/Stack'
import { TopNavItem } from '@astryxdesign/core/TopNav'
import { urlFor } from '~/client'
import { useRouteForm } from '~/components/forms/use_route_form'
import { type useNavItems } from '~/components/navigation/nav'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
/** The same little overshoot as the segmented bar's pill. */
const SPRING = 'cubic-bezier(0.34, 1.3, 0.5, 1)'
const SETTLE = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

/** The bar's height on a phone: the sheet hangs under it and the scrim starts at it. */
const BAR = `calc(${spacingVars['--spacing-12']} + ${spacingVars['--spacing-2']})`
/** A 14px step, between the scale's 12 and 16. */
const STEP = `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`
/** A bar of the menu button is 1.8px thick. */
const BAR_THICKNESS = `calc(1.8 * ${borderVars['--border-width']})`
/** Two bars 6px apart: each moves half the distance between their centres to cross. */
const BAR_SHIFT = `calc((${spacingVars['--spacing-1-5']} + ${BAR_THICKNESS}) / 2)`

const scrimIn = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })
const rowIn = stylex.keyframes({
  from: { opacity: 0, transform: `translateY(calc(-1 * ${spacingVars['--spacing-1-5']}))` },
  to: { opacity: 1, transform: 'none' },
})

const styles = stylex.create({
  /** The 44px round button that holds the menu's two bars; its fill shows while it is open. */
  toggle: {
    width: `calc(${spacingVars['--spacing-10']} + ${spacingVars['--spacing-1']})`,
    height: `calc(${spacingVars['--spacing-10']} + ${spacingVars['--spacing-1']})`,
    borderRadius: radiusVars['--radius-full'],
    transform: {
      default: 'scale(1)',
      ':active': { default: 'scale(0.86)', [REDUCED_MOTION]: 'scale(1)' },
    },
    transitionDuration: { default: durationVars['--duration-fast'], [REDUCED_MOTION]: '0s' },
  },
  toggleOpen: {
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-text-primary']} 6%, transparent)`,
  },
  bar: {
    width: `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`,
    height: BAR_THICKNESS,
    borderRadius: spacingVars['--spacing-0-5'],
    backgroundColor: 'currentColor',
    transform: 'none',
    transitionProperty: { default: 'transform', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-medium-min'],
    transitionTimingFunction: SPRING,
  },
  barTopOpen: { transform: `translateY(${BAR_SHIFT}) rotate(45deg)` },
  barBottomOpen: { transform: `translateY(calc(-1 * ${BAR_SHIFT})) rotate(-45deg)` },
  /** The sheet is a 24px-radius card hanging 8px under the bar, with a long soft shadow. */
  sheet: {
    // The popover sits 4px under the button, which ends 6px above the bar's foot.
    marginBlockStart: `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`,
    width: `calc(100vw - 2 * ${spacingVars['--spacing-2']})`,
    maxWidth: 'none',
    marginInlineStart: `calc(-1 * ${spacingVars['--spacing-4']})`,
    borderRadius: `calc(${radiusVars['--radius-page']} + ${spacingVars['--spacing-1']})`,
    boxShadow: `0 ${spacingVars['--spacing-6']} calc(${spacingVars['--spacing-12']} + ${spacingVars['--spacing-2']}) calc(-1 * (${spacingVars['--spacing-5']} + ${spacingVars['--spacing-0-5']})) color-mix(in srgb, ${colorVars['--color-text-primary']} 50%, transparent)`,
  },
  /** One row: 52px tall, 16px corners, 14px between its icon and its label. */
  row: {
    justifyContent: 'flex-start',
    gap: STEP,
    minHeight: `calc(${spacingVars['--spacing-12']} + ${spacingVars['--spacing-1']})`,
    paddingBlock: spacingVars['--spacing-0'],
    paddingInline: STEP,
    borderRadius: spacingVars['--spacing-4'],
    fontSize: `calc(${textSizeVars['--font-size-base']} + 2 * ${borderVars['--border-width']})`,
    fontWeight: fontWeightVars['--font-weight-medium'],
    backgroundColor: {
      default: 'transparent',
      ':active': `color-mix(in srgb, ${colorVars['--color-text-primary']} 5%, transparent)`,
    },
    backgroundImage: 'none',
    color: colorVars['--color-text-primary'],
    transitionProperty: { default: 'background-color', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-fast'],
  },
  /**
   * A Button's icon slot is 16px wide, so a 20px icon overhangs it by 2px on
   * each side: the icon steps in by that, and the gap grows by 4px, so the label
   * lines up with the links'.
   */
  buttonRow: {
    gap: `calc(${STEP} + ${spacingVars['--spacing-1']})`,
  },
  buttonIcon: {
    marginInlineStart: spacingVars['--spacing-0-5'],
  },
  rowCurrent: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-accent']} 10%, transparent)`,
    color: colorVars['--color-text-accent'],
  },
  rowQuiet: {
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
  },
  /** A row drops in a little after the one above it. */
  rowEnter: {
    animationName: { default: rowIn, [REDUCED_MOTION]: 'none' },
    animationDuration: durationVars['--duration-medium-min'],
    animationTimingFunction: SETTLE,
    animationFillMode: 'backwards',
  },
  divider: {
    marginBlock: spacingVars['--spacing-1-5'],
    marginInline: STEP,
  },
  /** Dims the page below the bar, and takes the taps that would reach it. */
  scrim: {
    position: 'fixed',
    insetBlockStart: BAR,
    insetBlockEnd: spacingVars['--spacing-0'],
    insetInline: spacingVars['--spacing-0'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-text-primary']} 32%, transparent)`,
    animationName: { default: scrimIn, [REDUCED_MOTION]: 'none' },
    animationDuration: durationVars['--duration-fast-max'],
    animationTimingFunction: 'ease',
    animationFillMode: 'backwards',
  },
})

/** The enter delay of the row at `order`: 60ms, then 50ms more for each. */
const delays = stylex.create({
  step: (order: number) => ({ animationDelay: `${60 + order * 50}ms` }),
})

type Items = ReturnType<typeof useNavItems>

/**
 * The phone's navigation: a round button of two bars that cross into an X
 * while the menu is open, and under the bar a sheet of rows, one for each
 * area, then the account actions. Wide screens have the segmented bar and the
 * Account menu instead.
 *
 * `AppLayout` owns the open state, so the page below the bar can be dimmed
 * (`PhoneMenuScrim`) and the menu closed when a visit lands. It is a Popover
 * under the bar, so Escape, a tap outside and focus all work as for any popover.
 */
export default function PhoneMenu({
  items,
  signedIn,
  isOpen,
  onOpenChange,
}: {
  items: Items
  signedIn: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}) {
  const logout = useRouteForm('session.destroy', {})
  /** The rows after the areas follow them in, so the count carries on. */
  const afterAreas = items.length

  return (
    <Popover
      label="Menu"
      placement="below"
      alignment="end"
      width={`calc(100vw - 2 * ${spacingVars['--spacing-2']})`}
      padding={2}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      xstyle={styles.sheet}
      content={
        <Stack role="navigation" aria-label="Menu" gap={0.5}>
          {items.map(({ label, href, icon, isActive }, index) => (
            <Row key={label} order={index}>
              <TopNavItem
                label={label}
                href={href}
                isSelected={isActive}
                icon={icon && <Icon icon={icon} />}
                xstyle={[styles.row, isActive && styles.rowCurrent]}
              />
            </Row>
          ))}
          <Stack xstyle={[styles.rowEnter, delays.step(afterAreas)]}>
            <Divider xstyle={styles.divider} />
          </Stack>
          {signedIn ? (
            <Row order={afterAreas + 1}>
              <Button
                label="Log out"
                variant="ghost"
                width="100%"
                icon={
                  <Icon
                    icon={ArrowRightStartOnRectangleIcon}
                    size="md"
                    xstyle={styles.buttonIcon}
                  />
                }
                isLoading={logout.processing}
                onClick={() => logout.submit()}
                xstyle={[styles.row, styles.buttonRow, styles.rowQuiet]}
              />
            </Row>
          ) : (
            <>
              <Row order={afterAreas + 1}>
                <TopNavItem
                  label="Sign in"
                  href={urlFor('session.create')}
                  icon={<Icon icon={ArrowRightEndOnRectangleIcon} />}
                  xstyle={styles.row}
                />
              </Row>
              <Row order={afterAreas + 2}>
                <TopNavItem
                  label="Get started"
                  href={urlFor('new_account.create')}
                  icon={<Icon icon={UserPlusIcon} />}
                  xstyle={styles.row}
                />
              </Row>
            </>
          )}
        </Stack>
      }
    >
      <IconButton
        label={isOpen ? 'Close navigation' : 'Open navigation'}
        variant="ghost"
        icon={
          <Stack hAlign="center" gap={1.5}>
            <Stack aria-hidden xstyle={[styles.bar, isOpen && styles.barTopOpen]} />
            <Stack aria-hidden xstyle={[styles.bar, isOpen && styles.barBottomOpen]} />
          </Stack>
        }
        xstyle={[styles.toggle, isOpen && styles.toggleOpen]}
      />
    </Popover>
  )
}

function Row({ order, children }: { order: number; children: ReactNode }) {
  return <Stack xstyle={[styles.rowEnter, delays.step(order)]}>{children}</Stack>
}

/** Dims the page under the bar while the phone's menu is open; a tap on it closes the menu. */
export function PhoneMenuScrim({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { isMobile } = useAppShellMobile()
  if (!isMobile || !isOpen) return null

  return <Stack aria-hidden xstyle={styles.scrim} onClick={onClose} />
}
