import { usePage } from '@inertiajs/react'
import { type ComponentType, type SVGProps } from 'react'
import { urlFor } from '~/client'

export type NavRoute = Parameters<typeof urlFor>[0]

export type NavItem = {
  label: string
  route: NavRoute
  /** A Heroicons (or any SVG) component, rendered through Astryx's `Icon`. */
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}

/**
 * Resolves nav items to their URL and whether they match the current page.
 * By default nested URLs count as a match, so a "Settings" item stays active
 * on "/settings/security". Pass `exact` to only match the route itself.
 */
export function useNavItems(items: NavItem[], { exact = false } = {}) {
  const { url } = usePage()
  const path = url.split('?')[0]

  return items.map((item) => {
    const href = urlFor(item.route)
    const isActive = exact ? path === href : path === href || path.startsWith(`${href}/`)
    return { ...item, href, isActive }
  })
}
