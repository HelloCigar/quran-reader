import * as stylex from '@stylexjs/stylex'
import { durationVars, easeVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

const fadeUp = stylex.keyframes({
  from: { opacity: 0, transform: `translateY(${spacingVars['--spacing-3']})` },
  to: { opacity: 1, transform: 'none' },
})

/**
 * The entrance of the reading page's content: it fades up once, when it
 * mounts. Only opacity and transform change, so nothing around it moves, and
 * the fill is `backwards`: once the entrance ends, the element is as if it had
 * never been animated. With Reduce Motion on, nothing animates.
 *
 * Put it on what is inside an Ayah, never on the Ayah's own `#ayah-<number>`
 * element: the page measures that element to scroll to an Ayah and to tell
 * which Ayahs are in view.
 */
export const entranceStyles = stylex.create({
  fadeUp: {
    animationName: { default: fadeUp, [REDUCED_MOTION]: 'none' },
    animationDuration: durationVars['--duration-medium-max'],
    animationTimingFunction: easeVars['--ease-entrance'],
    animationFillMode: 'backwards',
  },
})

const delays = stylex.create({
  order0: { animationDelay: '60ms' },
  order1: { animationDelay: '120ms' },
  order2: { animationDelay: '180ms' },
  order3: { animationDelay: '240ms' },
  order4: { animationDelay: '300ms' },
  order5: { animationDelay: '360ms' },
  order6: { animationDelay: '420ms' },
  order7: { animationDelay: '480ms' },
})

/**
 * The delay of each item of a staggered entrance, by its order: the first
 * screenful of Ayahs follows the Surah's heading in, one after the other.
 * `ENTRANCE_DELAYS.length` is how many items a stagger has; an item past it
 * has no entrance.
 */
export const ENTRANCE_DELAYS = [
  delays.order0,
  delays.order1,
  delays.order2,
  delays.order3,
  delays.order4,
  delays.order5,
  delays.order6,
  delays.order7,
]
