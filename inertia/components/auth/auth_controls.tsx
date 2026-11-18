import * as stylex from '@stylexjs/stylex'
import { type ComponentProps } from 'react'
import {
  borderVars,
  colorVars,
  durationVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { Button } from '@astryxdesign/core/Button'
import { TextInput } from '@astryxdesign/core/TextInput'

/** Phone: the auth pages' phone treatment applies up to 600px wide. */
const PHONE = '@media (max-width: 600px)'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

/** The height of a field, 46px. */
const FIELD_HEIGHT = '2.875rem'
/** The corners of a field, 12px. */
const FIELD_RADIUS = '0.75rem'
/** The height of a field on a phone, 48px, with 16px text so iOS doesn't zoom in on focus. */
const FIELD_HEIGHT_PHONE = '3rem'
/** The height of a button, 48px. */
const BUTTON_HEIGHT = '3rem'
/** The height of a button on a phone, 52px. */
const BUTTON_HEIGHT_PHONE = '3.25rem'

/** A hairline ring in the text colour, the way the fields and the secondary button are outlined. */
const ring = (percent: number) =>
  `0 0 0 ${borderVars['--border-width']} color-mix(in srgb, ${colorVars['--color-text-primary']} ${percent}%, transparent)`

const styles = stylex.create({
  /** A field is a white, rounded box with a hairline ring that darkens on hover and turns accent on focus. */
  control: {
    minHeight: { default: FIELD_HEIGHT, [PHONE]: FIELD_HEIGHT_PHONE },
    height: { default: FIELD_HEIGHT, [PHONE]: FIELD_HEIGHT_PHONE },
    borderRadius: FIELD_RADIUS,
    borderWidth: 0,
    fontSize: { default: '0.9375rem', [PHONE]: '1rem' },
    // The input takes its size from this token, which a phone sets to 16px so iOS doesn't zoom in.
    '--text-body-size': { default: null, [PHONE]: '1rem' },
    backgroundColor: colorVars['--color-background-card'],
    boxShadow: {
      default: ring(10),
      ':hover': ring(22),
      ':focus-within': `0 0 0 2px ${colorVars['--color-accent']}`,
    },
    transitionProperty: { default: 'box-shadow, background-color', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-fast'],
  },
  /** A pill button: it dims up on hover and gives a little under a press. */
  button: {
    height: { default: BUTTON_HEIGHT, [PHONE]: BUTTON_HEIGHT_PHONE },
    minHeight: { default: BUTTON_HEIGHT, [PHONE]: BUTTON_HEIGHT_PHONE },
    fontSize: { default: null, [PHONE]: '1rem' },
    fontWeight: { default: null, [PHONE]: 600 },
    borderRadius: radiusVars['--radius-full'],
    paddingInline: '1.375rem',
    transform: {
      default: 'scale(1)',
      ':active': { default: 'scale(0.97)', [REDUCED_MOTION]: 'scale(1)' },
    },
    transitionProperty: { default: 'transform, filter', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-fast'],
    filter: { default: 'none', ':hover': 'brightness(1.06)' },
  },
  /** A field and its label stand 6px apart on a phone. */
  container: {
    rowGap: { default: null, [PHONE]: spacingVars['--spacing-1-5'] },
    // The label's line is the font's own, 17px, not the theme's 20px.
    '--text-label-leading': { default: null, [PHONE]: 'normal' },
  },
  /** The secondary pill is white with a ring, like a field. */
  buttonSecondary: {
    backgroundColor: colorVars['--color-background-card'],
    boxShadow: ring(12),
  },
})

/** A text field in the sign-in style: 46px tall, white, with rounded corners. */
export function AuthTextInput(props: ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      size="lg"
      containerXstyle={styles.container}
      controlXstyle={styles.control}
      {...props}
    />
  )
}

/** A button in the sign-in style: a 48px pill, primary (green) or secondary (white). */
export function AuthButton({
  variant = 'primary',
  ...props
}: Omit<ComponentProps<typeof Button>, 'size' | 'xstyle'> & {
  variant?: 'primary' | 'secondary'
}) {
  return (
    <Button
      size="lg"
      variant={variant}
      xstyle={[styles.button, variant === 'secondary' && styles.buttonSecondary]}
      {...props}
    />
  )
}
