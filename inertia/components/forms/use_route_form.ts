import { type FormEvent } from 'react'
import { useForm } from '@inertiajs/react'
import { registry } from '@generated/registry'
import type { Registry } from '@generated/registry/schema'
import { urlFor } from '~/client'

/** Routes that accept a request body (everything except GET/HEAD routes). */
type FormRoute = {
  [Name in keyof Registry]: Registry[Name]['methods'][number] extends 'GET' | 'HEAD' ? never : Name
}[keyof Registry]

/** The request body a route's validator accepts. */
type RouteBody<Name extends FormRoute> = Registry[Name]['types']['body']

/** Text inputs hold strings; the server's validator coerces them. */
type FormValues = Record<string, string>

/**
 * Inertia's `useForm`, typed and submitted by AdonisJS route name.
 *
 * The form data is typed from the route's validator, `submit` sends it to the
 * route's URL and HTTP method, and `field(name)` returns the props an Astryx
 * text input needs: its value, change handler, form name and the server's
 * validation error for that field.
 *
 * ```tsx
 * const form = useRouteForm('session.store', { email: '', password: '' })
 *
 * <form onSubmit={form.submit}>
 *   <FormLayout>
 *     <TextInput label="Email" type="email" {...form.field('email')} />
 *   </FormLayout>
 *   <Button type="submit" label="Sign in" isLoading={form.processing} />
 * </form>
 * ```
 */
export function useRouteForm<Name extends FormRoute>(route: Name, initial: RouteBody<Name>) {
  const form = useForm<FormValues>(initial as FormValues)
  const errors = form.errors as Partial<Record<string, string>>
  const method = registry.routes[route].methods[0].toLowerCase() as
    | 'post'
    | 'put'
    | 'patch'
    | 'delete'

  function submit(event?: FormEvent) {
    event?.preventDefault()
    form.submit(method, urlFor(route as Parameters<typeof urlFor>[0]))
  }

  function field(name: keyof RouteBody<Name> & string) {
    const error = errors[name]
    return {
      htmlName: name,
      value: String(form.data[name] ?? ''),
      onChange: (value: string) => {
        form.setData((data) => ({ ...data, [name]: value }))
        if (error) form.clearErrors(name as never)
      },
      status: error ? { type: 'error' as const, message: error } : undefined,
    }
  }

  return { ...form, submit, field }
}
