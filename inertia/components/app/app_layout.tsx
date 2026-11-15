import { type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  BookOpenIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  HomeIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'
import { AppShell, useAppShellMobile } from '@astryxdesign/core/AppShell'
import { TopNav, TopNavItem } from '@astryxdesign/core/TopNav'
import { HStack } from '@astryxdesign/core/HStack'
import { Divider } from '@astryxdesign/core/Divider'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { urlFor } from '~/client'
import { useRouteForm } from '~/components/forms/use_route_form'
import Logo from '~/components/brand/logo'
import ThemeToggle from '~/components/theme/theme_toggle'
import FlashToasts from '~/components/feedback/flash_toasts'
import PasskeySignals from '~/components/auth/passkey_signals'
import { useNavItems, type NavItem } from '~/components/navigation/nav'
import { RecitationProvider } from '~/components/quran/recitation'
import RecitationFrame from '~/components/quran/recitation_bar'

/** The areas everyone can open. */
const publicNav: NavItem[] = [{ label: 'Quran', route: 'surahs.index', icon: BookOpenIcon }]

/** The areas added for a signed-in reader. */
const readerNav: NavItem[] = [
  { label: 'Dashboard', route: 'dashboard', icon: HomeIcon },
  { label: 'Bookmarks', route: 'bookmarks.index', icon: BookmarkIcon },
  { label: 'Settings', route: 'settings', icon: Cog6ToothIcon },
]

/**
 * The frame of every page except sign-in and sign-up (Astryx
 * `AppShellTopNavOnly` block). The nav changes with sign-in: everyone sees
 * Quran, a signed-in reader also sees Dashboard, Bookmarks and Log out, and a
 * signed-out visitor sees Sign in and Get started. Pages render their own
 * `Layout` inside it, which owns the page header and padding.
 *
 * It holds the Recitation and pins its bar under the page, so a Recitation
 * keeps playing from one page to the next. Sign-in and sign-up are outside
 * it: going there stops the Recitation.
 *
 * Responsive contract. Wide: the areas and the account actions sit in the
 * bar. Phone (below AppShell's `md` breakpoint): the bar keeps the logo, the
 * theme toggle and the menu button, and the menu's drawer lists the areas,
 * then the account actions (`useAppShellMobile`).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { props } = usePage()
  const signedIn = Boolean(props.user)
  const items = useNavItems(signedIn ? [...publicNav, ...readerNav] : publicNav)

  return (
    <RecitationProvider readerId={props.user?.id}>
      <AppShell
        variant="surface"
        topNav={
          <TopNav
            label="Main navigation"
            heading={<Logo />}
            startContent={
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
            }
            endContent={<BarActions signedIn={signedIn} />}
          />
        }
      >
        <RecitationFrame>{children}</RecitationFrame>
        <FlashToasts />
        <PasskeySignals />
      </AppShell>
    </RecitationProvider>
  )
}

/** The end of the bar: the theme toggle, and on a wide screen the account actions. */
function BarActions({ signedIn }: { signedIn: boolean }) {
  const { isMobile } = useAppShellMobile()

  return (
    <HStack gap={2} vAlign="center">
      <ThemeToggle />
      {!isMobile && (signedIn ? <LogOutButton /> : <SignInButtons />)}
    </HStack>
  )
}

/** The account actions as rows of the phone's menu drawer, under the areas. */
function DrawerAccountItems({ signedIn }: { signedIn: boolean }) {
  const { isMobile } = useAppShellMobile()
  const logout = useRouteForm('session.destroy', {})
  if (!isMobile) return null

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

function LogOutButton() {
  const logout = useRouteForm('session.destroy', {})

  return (
    <Button
      label="Log out"
      variant="secondary"
      size="sm"
      icon={<Icon icon={ArrowRightStartOnRectangleIcon} />}
      isLoading={logout.processing}
      onClick={() => logout.submit()}
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
