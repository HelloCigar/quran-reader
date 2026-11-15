import { type ReactNode } from 'react'
import { ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline'
import { Head } from '@inertiajs/react'
import { useRouter } from '@adonisjs/inertia/react'
import { useMediaQuery } from '@astryxdesign/core/hooks'
import { Layout, LayoutContent, LayoutHeader, LayoutPanel } from '@astryxdesign/core/Layout'
import { VStack } from '@astryxdesign/core/VStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Icon } from '@astryxdesign/core/Icon'
import { List, ListItem } from '@astryxdesign/core/List'
import { TabList, Tab } from '@astryxdesign/core/TabList'
import { useNavItems, type NavItem } from '~/components/navigation/nav'

/**
 * The pages of the settings area, listed in the side panel. Register a route
 * for each page and add it here, for example:
 *
 * `{ label: 'Profile', route: 'settings.profile', icon: UserIcon }`
 */
const nav: NavItem[] = [
  { label: 'Profile', route: 'profile.show', icon: UserIcon },
  { label: 'Security', route: 'security.show', icon: ShieldCheckIcon },
]

/**
 * The settings area, from Astryx's `settings` (Settings Form) template: a
 * header, the section list in a side panel (tabs on narrow screens) and the
 * current page. Nest it under the app layout from each settings page:
 *
 * `Profile.layout = [AppLayout, SettingsLayout]`
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  const items = useNavItems(nav, { exact: true })
  const isNarrow = useMediaQuery('(max-width: 768px)')
  const router = useRouter()
  const active = items.find((item) => item.isActive)

  return (
    <Layout
      height="fill"
      contentWidth={1440}
      header={
        <LayoutHeader hasDivider>
          <Head title="Settings" />
          <VStack gap={1}>
            <Heading level={1}>Settings</Heading>
            <Text type="supporting" color="secondary">
              Manage your account settings and preferences.
            </Text>
          </VStack>
        </LayoutHeader>
      }
      start={
        isNarrow || items.length === 0 ? undefined : (
          <LayoutPanel hasDivider={false} width={260} padding={2} label="Settings sections">
            <List density="balanced">
              {items.map(({ label, href, icon, isActive }) => (
                <ListItem
                  key={label}
                  label={label}
                  href={href}
                  isSelected={isActive}
                  startContent={icon && <Icon icon={icon} size="sm" />}
                />
              ))}
            </List>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={4}>
          <VStack gap={4}>
            {isNarrow && items.length > 0 && (
              <VStack hAlign="center">
                <TabList value={active?.href ?? ''} onChange={(href) => router.visit({ href })}>
                  {items.map(({ label, href }) => (
                    <Tab key={label} value={href} label={label} />
                  ))}
                </TabList>
              </VStack>
            )}
            {children}
          </VStack>
        </LayoutContent>
      }
    />
  )
}
