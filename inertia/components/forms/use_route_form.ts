import { type FormEvent } from 'react'
import { useForm } from '@inertiajs/react'
import type { VisitOptions } from '@inertiajs/core'
import { registry } from '@generated/registry'
import type { Registry } from '@generated/registry/schema'
import { urlFor } from '~/client'

/** Every named route; a GET route's form sends its fields as the query string. */
type FormRoute = keyof Registry

/**
 * What a route's validator accepts: the query string of a GET route, the
 * request body of any other.
 */
type RouteBody<Name extends FormRoute> = Registry[Name]['methods'][number] extends 'GET' | 'HEAD'
  ? Registry[Name]['types']['query']
  : Registry[Name]['types']['body']

/**
 * The visit options, and the params of a route whose URL has some
 * (`/bookmarks/:id`).
 */
type RouteFormOptions<Name extends FormRoute> = VisitOptions & {
  routeParams?: Registry[Name]['types']['params']
}

/** Text inputs hold strings; the server's validator coerces them. */
type FormValues = Record<string, string>

/**
 * Inertia's `useForm`, typed and submitted by AdonisJS route name.
 *
 * The form data is typed from the route's validator, `submit` sends it to the
 * route's URL (built with `options.routeParams` when it has params) and HTTP
 * method (a GET route gets it as the query string) with the visit `options`, and `field(name)` returns the props an Astryx
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
export function useRouteForm<Name extends FormRoute>(
  route: Name,
  initial: RouteBody<Name>,
  { routeParams, ...options }: RouteFormOptions<Name> = {}
) {
  const form = useForm<FormValues>(initial as FormValues)
  const errors = form.errors as Partial<Record<string, string>>
  const method = registry.routes[route].methods[0].toLowerCase() as
    | 'get'
    | 'post'
    | 'put'
    | 'patch'
    | 'delete'

  function submit(event?: FormEvent) {
    event?.preventDefault()
    const url = urlFor(route as Parameters<typeof urlFor>[0], routeParams as never)
    form.submit(method, url, options)
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
