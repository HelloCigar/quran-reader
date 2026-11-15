import { type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import {
  ArrowRightStartOnRectangleIcon,
  BookOpenIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'
import { AppShell } from '@astryxdesign/core/AppShell'
import { TopNav, TopNavItem } from '@astryxdesign/core/TopNav'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { urlFor } from '~/client'
import { useRouteForm } from '~/components/forms/use_route_form'
import Logo from '~/components/brand/logo'
import ThemeToggle from '~/components/theme/theme_toggle'
import FlashToasts from '~/components/feedback/flash_toasts'
import PasskeySignals from '~/components/auth/passkey_signals'
import { useNavItems, type NavItem } from '~/components/navigation/nav'

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
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { props } = usePage()
  const signedIn = Boolean(props.user)
  const items = useNavItems(signedIn ? [...publicNav, ...readerNav] : publicNav)

  return (
    <AppShell
      variant="surface"
      topNav={
        <TopNav
          label="Main navigation"
          heading={<Logo />}
          startContent={items.map(({ label, href, icon, isActive }) => (
            <TopNavItem
              key={label}
              label={label}
              href={href}
              isSelected={isActive}
              icon={icon && <Icon icon={icon} size="sm" />}
            />
          ))}
          endContent={
            <HStack gap={2} vAlign="center">
              <ThemeToggle />
              {signedIn ? <LogOutButton /> : <SignInButtons />}
            </HStack>
          }
        />
      }
    >
      {children}
      <FlashToasts />
      <PasskeySignals />
    </AppShell>
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
