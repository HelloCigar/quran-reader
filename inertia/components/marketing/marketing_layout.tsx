import { type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import { AppShell } from '@astryxdesign/core/AppShell'
import { TopNav } from '@astryxdesign/core/TopNav'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { urlFor } from '~/client'
import Logo from '~/components/brand/logo'
import ThemeToggle from '~/components/theme/theme_toggle'
import FlashToasts from '~/components/feedback/flash_toasts'

/**
 * The public frame (Astryx `AppShellTopNavOnly` block): the logo, the theme
 * toggle and sign-in actions. Pages render their own `Layout` inside it.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  const { props } = usePage()

  return (
    <AppShell
      variant="surface"
      topNav={
        <TopNav
          label="Main navigation"
          heading={<Logo />}
          endContent={
            <HStack gap={2} vAlign="center">
              <ThemeToggle />
              {props.user ? (
                <Button label="Dashboard" href={urlFor('dashboard')} variant="primary" size="sm" />
              ) : (
                <>
                  <Button
                    label="Sign in"
                    href={urlFor('session.create')}
                    variant="ghost"
                    size="sm"
                  />
                  <Button
                    label="Get started"
                    href={urlFor('new_account.create')}
                    variant="primary"
                    size="sm"
                  />
                </>
              )}
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
