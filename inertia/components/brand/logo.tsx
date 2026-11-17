import { type SVGProps } from 'react'
import * as stylex from '@stylexjs/stylex'
import { typographyVars } from '@astryxdesign/core/theme/tokens.stylex'
import { Icon } from '@astryxdesign/core/Icon'
import { TopNavHeading } from '@astryxdesign/core/TopNav'
import { urlFor } from '~/client'

/**
 * The Quran Reader mark: an eight-pointed star (two overlapping squares) with
 * an open center. Pass it to Astryx's `Icon` (or any `icon` slot) so it takes
 * its size and color from the design system. `public/favicon.svg` draws the
 * same shape.
 */
export function QuranMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.1 14.9 5H19v4.1l2.9 2.9-2.9 2.9V19h-4.1L12 21.9 9.1 19H5v-4.1L2.1 12 5 9.1V5h4.1L12 2.1zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
        fill="currentColor"
      />
    </svg>
  )
}

const styles = stylex.create({
  /** The name is set in the heading font, like the titles of the pages. */
  heading: {
    fontFamily: typographyVars['--font-family-heading'],
  },
})

/**
 * The product heading for the top navigation bar: the Quran Reader mark, bare
 * in the accent colour, and the name in the heading font, linking home.
 */
export default function Logo() {
  return (
    <TopNavHeading
      heading="Quran Reader"
      headingHref={urlFor('home')}
      logo={<Icon icon={QuranMark} color="accent" size="lg" />}
      xstyle={styles.heading}
    />
  )
}
