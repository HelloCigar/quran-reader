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
import type { InertiaProps } from '~/types'

type PageProps = InertiaProps<{ bookmark: { surah: number; ayah: number } | null }>

export default function Login({ bookmark }: PageProps) {
  const form = useRouteForm('session.store', { email: '', password: '' })
  // The carried bookmark isn't a text field, so it's added to the submitted data.
  form.transform((data) => (bookmark ? { ...data, bookmark } : data))

  return (
    <VStack gap={4} hAlign="stretch" width="100%">
      <Head title="Sign in" />
      <VStack gap={1}>
        <Text type="display-1" as="h1">
          Welcome back
        </Text>
        <Text type="body" color="secondary" size="sm">
          {bookmark
            ? `Sign in to bookmark ${bookmark.surah}:${bookmark.ayah}`
            : 'Sign in to see your bookmarks.'}
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
        <Link href={urlFor('new_account.create', [], { qs: { bookmark } })} type="supporting">
          Create an account
        </Link>
      </Text>
    </VStack>
  )
}

Login.layout = [AuthLayout]
