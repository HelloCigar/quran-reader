import { Head } from '@inertiajs/react'
import { VStack } from '@astryxdesign/core/VStack'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Button } from '@astryxdesign/core/Button'
import { Link } from '@astryxdesign/core/Link'
import { urlFor } from '~/client'
import { useRouteForm } from '~/components/forms/use_route_form'
import AuthLayout from '~/components/auth/auth_layout'

export default function ForgotPassword() {
  const form = useRouteForm('password_resets.store', { email: '' }, { preserveScroll: true })

  return (
    <VStack gap={4} hAlign="stretch" width="100%">
      <Head title="Forgot password" />
      <VStack gap={1}>
        <Text type="display-1" as="h1">
          Forgot password
        </Text>
        <Text type="body" color="secondary" size="sm">
          Enter the email address you registered with, and we&rsquo;ll send you instructions to
          reset your password
        </Text>
      </VStack>

      <form onSubmit={form.submit}>
        <VStack gap={4} hAlign="stretch">
          <FormLayout>
            <TextInput
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              size="lg"
              {...form.field('email')}
            />
          </FormLayout>
          <Button
            type="submit"
            label={form.processing ? 'Sending…' : 'Send instructions'}
            variant="primary"
            size="lg"
            isLoading={form.processing}
          />
        </VStack>
      </form>

      <Text type="supporting" color="secondary">
        Remembered it?{' '}
        <Link href={urlFor('session.create')} type="supporting">
          Sign in
        </Link>
      </Text>
    </VStack>
  )
}

ForgotPassword.layout = [AuthLayout]
