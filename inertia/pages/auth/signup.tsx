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

export default function Signup() {
  const form = useRouteForm('new_account.store', {
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })

  return (
    <VStack gap={4} hAlign="stretch" width="100%">
      <Head title="Create account" />
      <VStack gap={1}>
        <Text type="display-1" as="h1">
          Create your account
        </Text>
        <Text type="body" color="secondary" size="sm">
          Start building with the starter kit.
        </Text>
      </VStack>

      <form onSubmit={form.submit}>
        <VStack gap={4} hAlign="stretch">
          <FormLayout>
            <TextInput
              label="Full name"
              autoComplete="name"
              placeholder="Ada Lovelace"
              size="lg"
              {...form.field('fullName')}
            />
            <TextInput
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              size="lg"
              {...form.field('email')}
            />
            <TextInput
              label="Password"
              type="password"
              autoComplete="new-password"
              size="lg"
              {...form.field('password')}
            />
            <TextInput
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              size="lg"
              {...form.field('passwordConfirmation')}
            />
          </FormLayout>
          <Button
            type="submit"
            label="Create account"
            variant="primary"
            size="lg"
            isLoading={form.processing}
          />
        </VStack>
      </form>

      <Text type="supporting" color="secondary">
        Already have an account?{' '}
        <Link href={urlFor('session.create')} type="supporting">
          Sign in
        </Link>
      </Text>
    </VStack>
  )
}

Signup.layout = [AuthLayout]
