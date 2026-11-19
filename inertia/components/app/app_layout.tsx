import { useState, type ReactNode } from 'react'
import * as stylex from '@stylexjs/stylex'
import { usePage } from '@inertiajs/react'
import {
  ArrowRightStartOnRectangleIcon,
  BookOpenIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  HomeIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import {
  borderVars,
  colorVars,
  durationVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { AppShell, useAppShellMobile } from '@astryxdesign/core/AppShell'
import { TopNav } from '@astryxdesign/core/TopNav'
import { HStack } from '@astryxdesign/core/HStack'
import { VStack } from '@astryxdesign/core/VStack'
import { Button } from '@astryxdesign/core/Button'
import { Link } from '@astryxdesign/core/Link'
import { DropdownMenu, DropdownMenuItem } from '@astryxdesign/core/DropdownMenu'
import { Text } from '@astryxdesign/core/Text'
import { Icon } from '@astryxdesign/core/Icon'
import { urlFor } from '~/client'
import { useRouteForm } from '~/components/forms/use_route_form'
import Logo from '~/components/brand/logo'
import ThemeToggle from '~/components/theme/theme_toggle'
import FlashToasts from '~/components/feedback/flash_toasts'
import PasskeySignals from '~/components/auth/passkey_signals'
import { useNavItems, type NavItem } from '~/components/navigation/nav'
import PhoneMenu, { PhoneMenuScrim } from '~/components/navigation/phone_menu'
import SegmentedNav from '~/components/navigation/segmented_nav'
import { useNavigationEvent } from '~/components/navigation/navigation_events'
import { RecitationProvider } from '~/components/quran/recitation'
import RecitationFrame from '~/components/quran/recitation_bar'
import {
  OffPageSidebarDrawer,
  ReaderSidebarProvider,
} from '~/components/quran/reader_sidebar_drawer'

/** The areas everyone can open. */
const publicNav: NavItem[] = [{ label: 'Quran', route: 'surahs.index', icon: BookOpenIcon }]

/** The areas only a signed-out visitor sees: the home page sends a reader to the dashboard. */
const visitorNav: NavItem[] = [{ label: 'Home', route: 'home', icon: HomeIcon }]

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
    backgroundColor: {
      default: `color-mix(in srgb, ${colorVars['--color-background-body']} 82%, transparent)`,
      [PHONE]: `color-mix(in srgb, ${colorVars['--color-background-body']} 85%, transparent)`,
    },
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
  /** The phone's bar has 44px icon buttons. */
  phoneIconButton: {
    width: `calc(${spacingVars['--spacing-10']} + ${spacingVars['--spacing-1']})`,
    height: `calc(${spacingVars['--spacing-10']} + ${spacingVars['--spacing-1']})`,
    borderRadius: radiusVars['--radius-full'],
    transform: {
      default: 'scale(1)',
      ':active': { default: 'scale(0.86)', [REDUCED_MOTION]: 'scale(1)' },
    },
    transitionDuration: { default: durationVars['--duration-fast'], [REDUCED_MOTION]: '0s' },
  },
  /** The theme toggle's icon on a phone: 18px, drawn with a 1.8px stroke. */
  phoneIcon: {
    width: `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`,
    height: `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`,
    strokeWidth: `calc(1.8 * ${borderVars['--border-width']})`,
  },
  /** A phone's signed-out visitor has a text link, 44px tall, in place of the menu. */
  phoneSignIn: {
    display: 'inline-flex',
    alignItems: 'center',
    height: `calc(${spacingVars['--spacing-10']} + ${spacingVars['--spacing-1']})`,
    paddingInline: spacingVars['--spacing-3'],
    textDecoration: 'none',
  },
  /**
   * The account menu's surface is Astryx's popover: a rounder panel
   * (twice the element radius) on a hairline and a long soft drop. The
   * popover paints from these tokens, so the menu's wrapper sets them.
   */
  accountSurface: {
    display: 'contents',
    '--radius-container': `calc(2 * ${radiusVars['--radius-element']})`,
    '--shadow-low': `0 0 0 ${borderVars['--border-width']} ${colorVars['--color-border']}, 0 calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']}) ${spacingVars['--spacing-10']} calc(-1 * ${spacingVars['--spacing-4']}) color-mix(in srgb, ${colorVars['--color-text-primary']} 35%, transparent)`,
  },
  /** The name and email, set apart from the rows by a hairline inset from the edges. */
  accountHeader: {
    // The popover's header region already holds 4px of padding on every side.
    margin: spacingVars['--spacing-0-5'],
    marginBlockEnd: spacingVars['--spacing-0'],
    gap: borderVars['--border-width'],
    paddingBlockStart: `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`,
    paddingBlockEnd: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-3'],
    borderBlockEndWidth: borderVars['--border-width'],
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colorVars['--color-border'],
  },
  /** The name and email sit on their natural line height, a hairline apart. */
  tightLine: {
    lineHeight: 'normal',
  },
  /** The row's icon is 18px, between Astryx's sm and md. */
  accountIcon: {
    width: `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`,
    height: `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`,
  },
  /** The menu's rows start 6px in from the surface's edge, and 6px under the hairline. */
  accountMenu: {
    padding: spacingVars['--spacing-1-5'],
    paddingBlockStart: spacingVars['--spacing-0-5'],
  },
  /** A row 40px tall with a 10px-radius highlight. */
  accountItem: {
    minHeight: spacingVars['--spacing-10'],
    paddingInline: spacingVars['--spacing-3'],
    gap: `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`,
    borderRadius: `calc(1.25 * ${radiusVars['--radius-element']})`,
  },
})

/**
 * The frame of every page except sign-in and sign-up (Astryx
 * `AppShellTopNavOnly` block). The bar has three zones: the logo, the areas,
 * and the theme toggle with the account. It changes with sign-in: everyone
 * sees Quran, a signed-out visitor also sees Home, a signed-in reader also sees Dashboard, Bookmarks, Settings and
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
 * (below AppShell's `md` breakpoint, read with `useAppShellMobile`): a
 * signed-in reader's bar keeps the logo, the theme toggle and the menu button,
 * and the menu's sheet (`PhoneMenu`) lists the areas, then the account
 * actions. A signed-out visitor's has the logo, the theme toggle and a Sign in
 * link: no menu and no Get started. AppShell's own mobile drawer is off
 * (`mobileNav={false}`).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { props } = usePage()
  const signedIn = Boolean(props.user)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // The phone's menu closes once a visit lands, as the sidebar's drawer does.
  useNavigationEvent('success', () => setIsMenuOpen(false))

  return (
    <RecitationProvider readerId={props.user?.id}>
      <ReaderSidebarProvider>
        <AppShell
          variant="surface"
          mobileNav={false}
          topNav={
            <TopNav
              label="Main navigation"
              heading={<Logo />}
              centerContent={<Areas signedIn={signedIn} />}
              endContent={
                <BarActions
                  signedIn={signedIn}
                  isMenuOpen={isMenuOpen}
                  onMenuOpenChange={setIsMenuOpen}
                />
              }
              xstyle={styles.bar}
            />
          }
        >
          <RecitationFrame>{children}</RecitationFrame>
          <PhoneMenuScrim isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          <FlashToasts />
          <PasskeySignals />
          <OffPageSidebarDrawer />
        </AppShell>
      </ReaderSidebarProvider>
    </RecitationProvider>
  )
}

/** The areas of a wide screen's bar: one segmented group. A phone lists them in its menu. */
function Areas({ signedIn }: { signedIn: boolean }) {
  const { isMobile } = useAppShellMobile()
  const items = useNavItems(signedIn ? [...publicNav, ...readerNav] : [...visitorNav, ...publicNav])

  return isMobile ? null : <SegmentedNav items={items} />
}

/**
 * The end of the bar: the theme toggle, then on a wide screen the account, on
 * a phone the menu button, which opens the areas and the account actions.
 */
function BarActions({
  signedIn,
  isMenuOpen,
  onMenuOpenChange,
}: {
  signedIn: boolean
  isMenuOpen: boolean
  onMenuOpenChange: (isOpen: boolean) => void
}) {
  const { isMobile } = useAppShellMobile()
  const items = useNavItems(signedIn ? [...publicNav, ...readerNav] : [...visitorNav, ...publicNav])

  return (
    <HStack gap={isMobile ? 0 : 1} vAlign="center">
      <ThemeToggle
        size="md"
        xstyle={isMobile ? styles.phoneIconButton : styles.iconButton}
        iconXstyle={isMobile ? styles.phoneIcon : undefined}
      />
      {isMobile ? (
        signedIn ? (
          <PhoneMenu
            items={items}
            signedIn={signedIn}
            isOpen={isMenuOpen}
            onOpenChange={onMenuOpenChange}
          />
        ) : (
          <Link
            href={urlFor('session.create')}
            isStandalone
            size="base"
            weight="semibold"
            xstyle={styles.phoneSignIn}
          >
            Sign in
          </Link>
        )
      ) : signedIn ? (
        <AccountMenu />
      ) : (
        <SignInButtons />
      )}
    </HStack>
  )
}

/**
 * A signed-in reader's account on a wide screen: a round button whose menu
 * names the reader (name and email) above one row, Log out.
 */
function AccountMenu() {
  const { props } = usePage()
  const logout = useRouteForm('session.destroy', {})
  const user = props.user

  return (
    <HStack xstyle={styles.accountSurface}>
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
        menuWidth={`calc(${spacingVars['--spacing-10']} * 5.5)`}
        xstyle={styles.accountMenu}
        header={
          user && (
            <VStack xstyle={styles.accountHeader}>
              {user.fullName && (
                <Text type="body" weight="semibold" xstyle={styles.tightLine}>
                  {user.fullName}
                </Text>
              )}
              <Text type="supporting" size="sm" xstyle={styles.tightLine}>
                {user.email}
              </Text>
            </VStack>
          )
        }
      >
        <DropdownMenuItem
          label="Log out"
          icon={
            <Icon
              icon={ArrowRightStartOnRectangleIcon}
              size="sm"
              color="primary"
              xstyle={styles.accountIcon}
            />
          }
          onClick={() => logout.submit()}
          xstyle={styles.accountItem}
        />
      </DropdownMenu>
    </HStack>
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
