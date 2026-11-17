import { type ReactNode } from 'react'
import * as stylex from '@stylexjs/stylex'
import { usePage } from '@inertiajs/react'
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  BookOpenIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  HomeIcon,
  UserIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'
import {
  borderVars,
  colorVars,
  durationVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { AppShell, useAppShellMobile } from '@astryxdesign/core/AppShell'
import { TopNav, TopNavItem } from '@astryxdesign/core/TopNav'
import { HStack } from '@astryxdesign/core/HStack'
import { Divider } from '@astryxdesign/core/Divider'
import { Button } from '@astryxdesign/core/Button'
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu'
import { Icon } from '@astryxdesign/core/Icon'
import { urlFor } from '~/client'
import { useRouteForm } from '~/components/forms/use_route_form'
import Logo from '~/components/brand/logo'
import ThemeToggle from '~/components/theme/theme_toggle'
import FlashToasts from '~/components/feedback/flash_toasts'
import PasskeySignals from '~/components/auth/passkey_signals'
import { useNavItems, type NavItem } from '~/components/navigation/nav'
import SegmentedNav from '~/components/navigation/segmented_nav'
import { RecitationProvider } from '~/components/quran/recitation'
import RecitationFrame from '~/components/quran/recitation_bar'
import {
  OffPageSidebarDrawer,
  ReaderSidebarProvider,
} from '~/components/quran/reader_sidebar_drawer'

/** The areas everyone can open. */
const publicNav: NavItem[] = [{ label: 'Quran', route: 'surahs.index', icon: BookOpenIcon }]

/** The areas added for a signed-in reader. */
const readerNav: NavItem[] = [
  { label: 'Dashboard', route: 'dashboard', icon: HomeIcon },
  { label: 'Bookmarks', route: 'bookmarks.index', icon: BookmarkIcon },
  { label: 'Settings', route: 'settings', icon: Cog6ToothIcon },
]

/** AppShell's `md` breakpoint: below it the bar is the phone's bar. */
const PHONE = '@media (max-width: 768px)'
const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

const dropIn = stylex.keyframes({
  from: { opacity: 0, transform: `translateY(calc(-1 * ${spacingVars['--spacing-4']}))` },
  to: { opacity: 1, transform: 'none' },
})

const styles = stylex.create({
  /**
   * A slim bar in the body colour, let through a little and blurred, with a
   * hairline under it. It drops in once, when the frame first shows.
   */
  bar: {
    minHeight: {
      default: `calc(${spacingVars['--spacing-12']} + ${spacingVars['--spacing-3']})`,
      [PHONE]: `calc(${spacingVars['--spacing-12']} + ${spacingVars['--spacing-2']})`,
    },
    paddingBlock: spacingVars['--spacing-0'],
    paddingInlineStart: {
      default: spacingVars['--spacing-6'],
      [PHONE]: spacingVars['--spacing-4'],
    },
    paddingInlineEnd: {
      default: spacingVars['--spacing-6'],
      [PHONE]: spacingVars['--spacing-2'],
    },
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-background-body']} 82%, transparent)`,
    backdropFilter: `blur(${spacingVars['--spacing-4']})`,
    borderBlockEndWidth: borderVars['--border-width'],
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colorVars['--color-border'],
    animationName: { default: dropIn, [REDUCED_MOTION]: 'none' },
    animationDuration: durationVars['--duration-medium-max'],
    animationTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    animationFillMode: 'both',
  },
  /** The bar's icon buttons are round and give a little under a press. */
  iconButton: {
    borderRadius: radiusVars['--radius-full'],
    transform: {
      default: 'scale(1)',
      ':active': { default: 'scale(0.88)', [REDUCED_MOTION]: 'scale(1)' },
    },
    transitionDuration: { default: durationVars['--duration-fast'], [REDUCED_MOTION]: '0s' },
  },
})

/**
 * The frame of every page except sign-in and sign-up (Astryx
 * `AppShellTopNavOnly` block). The bar has three zones: the logo, the areas,
 * and the theme toggle with the account. It changes with sign-in: everyone
 * sees Quran, a signed-in reader also sees Dashboard, Bookmarks, Settings and
 * the Account menu, which holds Log out, and a signed-out visitor sees Sign in
 * and Get started. Pages render their own `Layout` inside it, which owns the
 * page header and padding.
 *
 * It holds the Recitation and pins its bar under the page, so a Recitation
 * keeps playing from one page to the next, and the Surah and Ayah sidebar's
 * drawer, which the bar opens on any page. Sign-in and sign-up are outside
 * it: going there stops the Recitation.
 *
 * Responsive contract. Wide: the areas sit in the middle of the bar as one
 * segmented group (`SegmentedNav`), and the account sits at its end. Phone
 * (below AppShell's `md` breakpoint): the bar keeps the logo, the theme
 * toggle and the menu button, and the menu's drawer lists the areas, then the
 * account actions (`useAppShellMobile`).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { props } = usePage()
  const signedIn = Boolean(props.user)

  return (
    <RecitationProvider readerId={props.user?.id}>
      <ReaderSidebarProvider>
        <AppShell
          variant="surface"
          topNav={
            <TopNav
              label="Main navigation"
              heading={<Logo />}
              centerContent={<Areas signedIn={signedIn} />}
              endContent={<BarActions signedIn={signedIn} />}
              xstyle={styles.bar}
            />
          }
        >
          <RecitationFrame>{children}</RecitationFrame>
          <FlashToasts />
          <PasskeySignals />
          <OffPageSidebarDrawer />
        </AppShell>
      </ReaderSidebarProvider>
    </RecitationProvider>
  )
}

/**
 * The areas: the segmented group on a wide screen, and on a phone the rows of
 * the menu's drawer, followed by the account actions.
 */
function Areas({ signedIn }: { signedIn: boolean }) {
  const { isMobile } = useAppShellMobile()
  const items = useNavItems(signedIn ? [...publicNav, ...readerNav] : publicNav)
  if (!isMobile) return <SegmentedNav items={items} />

  return (
    <>
      {items.map(({ label, href, icon, isActive }) => (
        <TopNavItem
          key={label}
          label={label}
          href={href}
          isSelected={isActive}
          icon={icon && <Icon icon={icon} size="sm" />}
        />
      ))}
      <DrawerAccountItems signedIn={signedIn} />
    </>
  )
}

/** The end of the bar: the theme toggle, and on a wide screen the account. */
function BarActions({ signedIn }: { signedIn: boolean }) {
  const { isMobile } = useAppShellMobile()

  return (
    <HStack gap={1} vAlign="center">
      <ThemeToggle size="md" xstyle={styles.iconButton} />
      {!isMobile && (signedIn ? <AccountMenu /> : <SignInButtons />)}
    </HStack>
  )
}

/** The account actions as rows of the phone's menu drawer, under the areas. */
function DrawerAccountItems({ signedIn }: { signedIn: boolean }) {
  const logout = useRouteForm('session.destroy', {})

  return (
    <>
      <Divider />
      {signedIn ? (
        <TopNavItem
          label="Log out"
          icon={<Icon icon={ArrowRightStartOnRectangleIcon} size="sm" />}
          isDisabled={logout.processing}
          onClick={() => logout.submit()}
        />
      ) : (
        <>
          <TopNavItem
            label="Sign in"
            href={urlFor('session.create')}
            icon={<Icon icon={ArrowRightEndOnRectangleIcon} size="sm" />}
          />
          <TopNavItem
            label="Get started"
            href={urlFor('new_account.create')}
            icon={<Icon icon={UserPlusIcon} size="sm" />}
          />
        </>
      )}
    </>
  )
}

/** A signed-in reader's account on a wide screen: a round button whose menu holds Log out. */
function AccountMenu() {
  const logout = useRouteForm('session.destroy', {})

  return (
    <DropdownMenu
      button={{
        label: 'Account menu',
        tooltip: 'Account',
        icon: <Icon icon={UserIcon} />,
        variant: 'ghost',
        isIconOnly: true,
        isLoading: logout.processing,
        xstyle: styles.iconButton,
      }}
      hasChevron={false}
      alignment="end"
      items={[
        {
          label: 'Log out',
          icon: ArrowRightStartOnRectangleIcon,
          onClick: () => logout.submit(),
        },
      ]}
    />
  )
}

function SignInButtons() {
  return (
    <>
      <Button label="Sign in" href={urlFor('session.create')} variant="ghost" size="sm" />
      <Button label="Get started" href={urlFor('new_account.create')} variant="primary" size="sm" />
    </>
  )
}
