import { Head, usePage } from '@inertiajs/react'
import { ArrowRightIcon, ArrowUpRightIcon } from '@heroicons/react/20/solid'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { Section } from '@astryxdesign/core/Section'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Token } from '@astryxdesign/core/Token'
import { List, ListItem } from '@astryxdesign/core/List'
import { urlFor } from '~/client'
import MarketingLayout from '~/components/marketing/marketing_layout'

const links = [
  {
    label: 'Documentation',
    description: 'Guides & API reference',
    href: 'https://docs.adonisjs.com',
  },
  {
    label: 'AdonisJS Plus',
    description: 'Feature packs and Flow AI',
    href: 'https://plus.adonisjs.com',
  },
  {
    label: 'Discord',
    description: 'Meet fellow AdonisJS developers',
    href: 'https://discord.com/invite/vDcEjq6',
  },
]

const stack = ['AdonisJS', 'Inertia', 'React', 'TypeScript', 'Vite', 'Astryx', 'StyleX']

/** From Astryx's `centered-hero` template. */
export default function Home() {
  const { props } = usePage()

  return (
    <Layout
      height="auto"
      content={
        <LayoutContent padding={6}>
          <Head title="Welcome" />
          <VStack gap={10} hAlign="center">
            <VStack gap={6} hAlign="center">
              <HStack gap={2} vAlign="center">
                <StatusDot variant="success" label="Server ready" isPulsing />
                <Text type="supporting" color="secondary">
                  Server ready
                </Text>
              </HStack>
              <VStack gap={3} hAlign="center" maxWidth={720}>
                <Heading level={1} type="display-2" justify="center" textWrap="balance">
                  Welcome to the power of a full-stack React app.
                </Heading>
                <Text type="body" color="secondary" justify="center" textWrap="balance">
                  Powered by Inertia and React, this setup blends server-driven routing with rich
                  client-side interactivity. This page is simply proof the engine started.
                  Everything from here is yours to build.
                </Text>
              </VStack>
              <HStack gap={3}>
                <Button
                  label={props.user ? 'Go to dashboard' : 'Get started'}
                  href={urlFor(props.user ? 'dashboard' : 'new_account.create')}
                  variant="primary"
                  endContent={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                />
                <Button label="Read the Quran" href={urlFor('surahs.index')} variant="secondary" />
                <Button
                  label="Read the docs"
                  href="https://docs.adonisjs.com"
                  target="_blank"
                  variant="secondary"
                />
              </HStack>
            </VStack>

            <Section variant="transparent" padding={0} maxWidth={640} width="100%">
              <VStack gap={6}>
                <List hasDividers edge="flush">
                  {links.map(({ label, description, href }) => (
                    <ListItem
                      key={label}
                      label={label}
                      description={description}
                      href={href}
                      target="_blank"
                      endContent={<Icon icon={ArrowUpRightIcon} size="sm" color="secondary" />}
                    />
                  ))}
                </List>
                <VStack gap={2} hAlign="center">
                  <Text type="label" color="secondary">
                    Built with
                  </Text>
                  <HStack gap={2} wrap="wrap" justify="center">
                    {stack.map((name) => (
                      <Token key={name} label={name} size="sm" />
                    ))}
                  </HStack>
                </VStack>
              </VStack>
            </Section>
          </VStack>
        </LayoutContent>
      }
    />
  )
}

Home.layout = [MarketingLayout]
