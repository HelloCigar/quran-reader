import { type ReactNode } from 'react'
import { HomeIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { AppShell } from '@astryxdesign/core/AppShell'
import { TopNav, TopNavItem } from '@astryxdesign/core/TopNav'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { useRouteForm } from '~/components/forms/use_route_form'
import Logo from '~/components/brand/logo'
import ThemeToggle from '~/components/theme/theme_toggle'
import FlashToasts from '~/components/feedback/flash_toasts'
import { useNavItems, type NavItem } from '~/components/navigation/nav'

/**
 * Top-level app navigation. Add an entry here for every new area of your
 * app, and it shows up in the navigation bar with its active state handled.
 */
const nav: NavItem[] = [{ label: 'Dashboard', route: 'dashboard', icon: HomeIcon }]

/**
 * The signed-in app frame (Astryx `AppShellTopNavOnly` block). Pages render
 * their own `Layout` inside it, which owns the page header and padding.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const items = useNavItems(nav)
  const logout = useRouteForm('session.destroy', {})

  return (
    <AppShell
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
              <Button
                label="Log out"
                variant="secondary"
                size="sm"
                icon={<Icon icon={ArrowRightStartOnRectangleIcon} />}
                isLoading={logout.processing}
                onClick={() => logout.submit()}
              />
            </HStack>
          }
        />
      }
    >
      {children}
      <FlashToasts />
    </AppShell>
  )
}
