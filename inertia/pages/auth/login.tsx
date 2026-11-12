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

export default function Login() {
  const form = useRouteForm('session.store', { email: '', password: '' })

  return (
    <VStack gap={4} hAlign="stretch" width="100%">
      <Head title="Sign in" />
      <VStack gap={1}>
        <Text type="display-1" as="h1">
          Welcome back
        </Text>
        <Text type="body" color="secondary" size="sm">
          Sign in to continue building.
        </Text>
      </VStack>

      <form onSubmit={form.submit}>
        <VStack gap={4} hAlign="stretch">
          <FormLayout>
            <TextInput
              label="Email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              size="lg"
              {...form.field('email')}
            />
            <TextInput
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              size="lg"
              {...form.field('password')}
            />
          </FormLayout>
          <Button
            type="submit"
            label="Sign in"
            variant="primary"
            size="lg"
            isLoading={form.processing}
          />
        </VStack>
      </form>

      <Text type="supporting" color="secondary">
        New here?{' '}
        <Link href={urlFor('new_account.create')} type="supporting">
          Create an account
        </Link>
      </Text>
    </VStack>
  )
}

Login.layout = [AuthLayout]
