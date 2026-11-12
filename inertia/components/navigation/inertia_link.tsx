import { type ComponentProps, type ComponentType } from 'react'
import { Link } from '@adonisjs/inertia/react'

type AnchorProps = ComponentProps<'a'>

/**
 * Astryx hands its link component a resolved `href`, so only the href form of
 * the type-safe `Link` is used here. Type-safe route names stay at the call
 * site, through `urlFor('route.name')`.
 */
const HrefLink = Link as ComponentType<AnchorProps>

/**
 * The link component every Astryx link renders through (registered with
 * `LinkProvider` in `AppProviders`), so `<Link href>`, `<Button href>`,
 * `<TopNavItem href>` and friends navigate with Inertia instead of a full
 * page load.
 *
 * External URLs, new-tab links and downloads stay native anchors, since
 * Inertia can only visit routes of this app.
 */
export default function InertiaLink({
  to: _to,
  href = '',
  ...props
}: AnchorProps & { to?: unknown }) {
  const isExternal = /^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//')

  if (isExternal || props.target === '_blank' || props.download !== undefined) {
    return <a href={href} {...props} />
  }

  return <HrefLink href={href} {...props} />
}
