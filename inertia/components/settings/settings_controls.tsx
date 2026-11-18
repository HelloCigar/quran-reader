import * as stylex from '@stylexjs/stylex'
import { type ComponentProps } from 'react'
import {
  borderVars,
  colorVars,
  durationVars,
  focusVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { VStack } from '@astryxdesign/core/VStack'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import { TextInput } from '@astryxdesign/core/TextInput'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
/** The page's phone breakpoint, the one `PageLayout` uses. */
const PHONE = '@media (max-width: 600px)'
/** A little overshoot, so a button settles under the pointer instead of stopping dead. */
const SPRING = 'cubic-bezier(0.34, 1.5, 0.5, 1)'

/** The height of a field and of the Save changes pill, 44px; a field is 48px on a phone. */
const FIELD_HEIGHT = spacingVars['--spacing-11']
const PHONE_FIELD_HEIGHT = spacingVars['--spacing-12']
/** The Save changes bar's pill on a phone, 52px. */
const BAR_BUTTON_HEIGHT = `calc(${spacingVars['--spacing-12']} + ${spacingVars['--spacing-1']})`
/** The corners of a field, 12px. */
const FIELD_RADIUS = spacingVars['--spacing-3']
/** The side padding of a field, 14px. */
const FIELD_INSET = `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`
/** The side padding of the Save changes pill, 22px. */
const SAVE_INSET = `calc(${spacingVars['--spacing-5']} + ${spacingVars['--spacing-0-5']})`
/** The height of the pill that adds a passkey, 40px; 44px on a phone. */
const SMALL_HEIGHT = { default: spacingVars['--spacing-10'], [PHONE]: FIELD_HEIGHT }

/** A hairline ring in the text colour, the way the fields and the white pill are outlined. */
const ring = (percent: number) =>
  `0 0 0 ${borderVars['--border-width']} color-mix(in srgb, ${colorVars['--color-text-primary']} ${percent}%, transparent)`

const styles = stylex.create({
  /** A field is a tinted, rounded box with a hairline ring that darkens on hover and turns accent on focus. */
  control: {
    minHeight: { default: FIELD_HEIGHT, [PHONE]: PHONE_FIELD_HEIGHT },
    height: { default: FIELD_HEIGHT, [PHONE]: PHONE_FIELD_HEIGHT },
    paddingInline: FIELD_INSET,
    borderRadius: FIELD_RADIUS,
    borderWidth: 0,
    fontSize: { default: '0.9375rem', [PHONE]: '1rem' },
    backgroundColor: {
      default: colorVars['--color-background-body'],
      ':focus-within': colorVars['--color-background-card'],
    },
    boxShadow: {
      default: ring(10),
      ':hover': ring(22),
      ':focus-within': `0 0 0 ${focusVars['--focus-outline-width']} ${colorVars['--color-accent']}`,
    },
    transitionProperty: { default: 'box-shadow, background-color', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-fast'],
  },
  /** A pill button: it dims up on hover and gives a little under a press. */
  button: {
    height: FIELD_HEIGHT,
    minHeight: FIELD_HEIGHT,
    paddingInline: SAVE_INSET,
    borderRadius: radiusVars['--radius-full'],
    fontSize: '0.875rem',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    transform: {
      default: 'scale(1)',
      ':active': { default: 'scale(0.96)', [REDUCED_MOTION]: 'scale(1)' },
    },
    transitionProperty: { default: 'transform, filter', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: SPRING,
    filter: { default: 'none', ':hover': 'brightness(1.08)' },
  },
  /** The small white pill of the passkeys box. */
  buttonWhite: {
    height: SMALL_HEIGHT,
    minHeight: SMALL_HEIGHT,
    paddingInline: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-background-card'],
    color: colorVars['--color-text-primary'],
    boxShadow: ring(10),
  },
  /** The Save changes pill of a phone's bar: it takes the room the note leaves, 52px tall, 16px. */
  buttonBar: {
    flexGrow: 1,
    height: BAR_BUTTON_HEIGHT,
    minHeight: BAR_BUTTON_HEIGHT,
    fontSize: '1rem',
  },
  helper: { fontSize: '0.8125rem', lineHeight: 'normal' },
  /** The space between a field and its help: 8px, 6px on a phone. */
  withHelper: {
    rowGap: { default: spacingVars['--spacing-2'], [PHONE]: spacingVars['--spacing-1-5'] },
  },
})

/** A text field of the settings: 44px, tinted, with rounded corners. */
export function SettingsTextInput({
  helper,
  ...props
}: ComponentProps<typeof TextInput> & {
  /** A line of 13px help under the field. */
  helper?: string
}) {
  const field = <TextInput controlXstyle={styles.control} {...props} />
  if (!helper) return field

  return (
    <VStack hAlign="stretch" xstyle={styles.withHelper}>
      {field}
      <Text type="supporting" color="secondary" xstyle={styles.helper}>
        {helper}
      </Text>
    </VStack>
  )
}

/**
 * A pill button of the settings: green for the one that saves, white for the
 * action in the passkeys box.
 */
export function SettingsButton({
  tone = 'green',
  ...props
}: Omit<ComponentProps<typeof Button>, 'variant' | 'size' | 'xstyle'> & {
  /** `bar` is the green pill of the Save changes bar on a phone. */
  tone?: 'green' | 'white' | 'bar'
}) {
  return (
    <Button
      variant={tone === 'white' ? 'secondary' : 'primary'}
      xstyle={[
        styles.button,
        tone === 'white' && styles.buttonWhite,
        tone === 'bar' && styles.buttonBar,
      ]}
      {...props}
    />
  )
}
