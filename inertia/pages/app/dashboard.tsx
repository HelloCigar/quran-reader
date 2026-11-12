import { Head } from '@inertiajs/react'
import { Squares2X2Icon } from '@heroicons/react/24/outline'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { Center } from '@astryxdesign/core/Center'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Icon } from '@astryxdesign/core/Icon'
import { Text } from '@astryxdesign/core/Text'
import AppLayout from '~/components/app/app_layout'

export default function Dashboard() {
  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={6}>
          <Head title="Dashboard" />
          <Center axis="both" height="100%">
            <EmptyState
              headingLevel={1}
              icon={<Icon icon={Squares2X2Icon} size="lg" />}
              title="Your dashboard is ready"
              description="It's empty on purpose. A clean starting point with nothing to undo. Add your first route and component to begin."
              actions={
                <Text type="supporting" color="secondary">
                  Start in <Text type="code">inertia/pages/dashboard.tsx</Text>
                </Text>
              }
            />
          </Center>
        </LayoutContent>
      }
    />
  )
}

Dashboard.layout = [AppLayout]
