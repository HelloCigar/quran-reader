import * as stylex from '@stylexjs/stylex'
import {
  borderVars,
  colorVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
const SPRING = 'cubic-bezier(0.34, 1.25, 0.5, 1)'

/** The page behind a dialog fades under its backdrop. */
const fadeIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

/** A form dialog rises into place and settles. */
const rise = stylex.keyframes({
  from: {
    opacity: 0,
    transform: `translateY(calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})) scale(0.96)`,
  },
  to: { opacity: 1, transform: 'none' },
})

/** A confirmation grows in a little past its size, then settles: it asks for attention. */
const pop = stylex.keyframes({
  '0%': { opacity: 0, transform: 'scale(0.9)' },
  '60%': { opacity: 1, transform: 'scale(1.02)' },
  '100%': { opacity: 1, transform: 'none' },
})

/**
 * The dialog panels of the bookmark prompts (the note, the removal): a white
 * 24px card over a softly blurred backdrop. The panel rises (`panel`) or
 * pops (`alert`) into place and the backdrop fades in; with Reduce Motion on
 * they appear at once.
 */
export const dialogStyles = stylex.create({
  panel: {
    borderRadius: `calc(${radiusVars['--radius-page']} + ${spacingVars['--spacing-1']})`,
    backgroundColor: colorVars['--color-background-card'],
    boxShadow: `0 calc(${spacingVars['--spacing-7']} + ${spacingVars['--spacing-0-5']}) calc(${spacingVars['--spacing-8']} * 2.2) calc(${spacingVars['--spacing-6']} * -1) ${colorVars['--color-overlay']}`,
    animationName: { default: rise, [REDUCED_MOTION]: 'none' },
    animationDuration: '350ms',
    animationTimingFunction: SPRING,
    '::backdrop': {
      backgroundColor: `color-mix(in srgb, ${colorVars['--color-overlay']} 84%, transparent)`,
      backdropFilter: `blur(calc(0.75 * ${spacingVars['--spacing-1']}))`,
      animationName: fadeIn,
      // An opacity fade only, short enough to stay under Reduce Motion (the
      // xstyle type takes no media query inside a pseudo-element).
      animationDuration: '200ms',
      animationTimingFunction: 'ease',
    },
  },
  alert: {
    animationName: { default: pop, [REDUCED_MOTION]: 'none' },
    animationDuration: '380ms',
  },
})

/**
 * The dialogs' buttons are pills a little taller than the rest of the app's:
 * 44px, with a firm 14px label. A secondary one is white on a hairline ring.
 */
export const dialogButtonStyles = stylex.create({
  pill: {
    height: spacingVars['--spacing-11'],
    paddingInline: `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`,
    borderRadius: radiusVars['--radius-full'],
    fontWeight: 600,
  },
  primary: {
    paddingInline: spacingVars['--spacing-5'],
  },
  secondary: {
    backgroundColor: colorVars['--color-background-card'],
    boxShadow: `0 0 0 ${borderVars['--border-width']} ${colorVars['--color-border-emphasized']}`,
  },
  /** Remove is a solid red pill, the one thing on the dialog that is not quiet. */
  destructive: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
  },
  taller: {
    height: `calc(${spacingVars['--spacing-11']} + ${spacingVars['--spacing-0-5']})`,
  },
})
