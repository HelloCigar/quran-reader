import { Head } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import AuthLayout from '~/components/auth/auth_layout'
import type { InertiaProps } from '~/types'

export default function Activate({ user }: InertiaProps) {
  return (
    <VStack gap={4} hAlign="stretch" width="100%">
      <Head title="Verify your account" />
      <VStack gap={2}>
        <Heading level={1} type="display-2" textWrap="balance">
          Verify your account
        </Heading>
        <Text type="body" color="secondary" size="sm">
          Check <Text weight="bold">{user?.unverifiedEmail}</Text> inbox for instructions from us on
          how to verify your account.
        </Text>
      </VStack>

      <Form options={{ preserveScroll: true }} route="email_verifications.store">
        {({ processing }) => (
          <VStack hAlign="stretch">
            <Button
              type="submit"
              label={processing ? 'Sending…' : 'Resend activation link'}
              variant="primary"
              size="lg"
              isLoading={processing}
            />
          </VStack>
        )}
      </Form>

      <Form route="session.destroy">
        {({ processing }) => (
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary">
              Wrong account?
            </Text>
            <Button
              type="submit"
              label="Log out"
              variant="ghost"
              size="sm"
              isLoading={processing}
            />
          </HStack>
        )}
      </Form>
    </VStack>
  )
}

Activate.layout = [AuthLayout]
