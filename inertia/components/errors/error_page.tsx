import { Head } from '@inertiajs/react'
import { MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { Center } from '@astryxdesign/core/Center'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Icon } from '@astryxdesign/core/Icon'
import { Button } from '@astryxdesign/core/Button'
import { urlFor } from '~/client'

/**
 * The body of the 404 and 500 pages: the status, a short explanation and a
 * way back home, centered in the page.
 */
export default function ErrorPage({
  status,
  title,
  description,
}: {
  status: 404 | 500
  title: string
  description: string
}) {
  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={6}>
          <Head title={title} />
          <Center axis="both" height="100%">
            <EmptyState
              headingLevel={1}
              icon={
                <Icon
                  icon={status === 404 ? MagnifyingGlassIcon : ExclamationTriangleIcon}
                  size="lg"
                  color="secondary"
                />
              }
              title={title}
              description={description}
              actions={<Button label="Back to home" href={urlFor('home')} variant="primary" />}
            />
          </Center>
        </LayoutContent>
      }
    />
  )
}
