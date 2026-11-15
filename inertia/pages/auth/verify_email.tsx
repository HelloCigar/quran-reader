import { Head } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import { VStack } from '@astryxdesign/core/VStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import AuthLayout from '~/components/auth/auth_layout'
import type { InertiaProps } from '~/types'

type PageProps = InertiaProps<{ token: string }>

export default function VerifyEmail({ token }: PageProps) {
  return (
    <VStack gap={4} hAlign="stretch" width="100%">
      <Head title="Verify your email" />
      <VStack gap={2}>
        <Heading level={1} type="display-2" textWrap="balance">
          Verify your email
        </Heading>
        <Text type="body" color="secondary" size="sm">
          Click the button below to confirm your email address.
        </Text>
      </VStack>

      <Form
        options={{ preserveScroll: true }}
        route="email_verifications.update"
        routeParams={[token]}
      >
        {({ processing }) => (
          <VStack hAlign="stretch">
            <Button
              type="submit"
              label={processing ? 'Verifying…' : 'Verify my email'}
              variant="primary"
              size="lg"
              isLoading={processing}
            />
          </VStack>
        )}
      </Form>
    </VStack>
  )
}

VerifyEmail.layout = [AuthLayout]
