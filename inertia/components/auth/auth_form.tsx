import * as stylex from '@stylexjs/stylex'
import { type ComponentProps, type ReactNode } from 'react'
import { type StyleXStyles } from '@stylexjs/stylex'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { VStack } from '@astryxdesign/core/VStack'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { entranceStyles, ENTRANCE_DELAYS } from '~/components/quran/entrance_styles'

/** Phone: the auth pages' phone treatment applies up to 600px wide. */
const PHONE = '@media (max-width: 600px)'

const styles = stylex.create({
  /** On a phone the form fills the rest of the screen, so its buttons can rest at the bottom. */
  form: {
    flexGrow: { default: null, [PHONE]: 1 },
    rowGap: { default: spacingVars['--spacing-5'], [PHONE]: spacingVars['--spacing-4'] },
  },
  /** The fields stand 16px apart on a phone. */
  fields: {
    rowGap: { default: null, [PHONE]: spacingVars['--spacing-4'] },
  },
  /** The buttons are pushed to the bottom of a phone's screen, and stand 12px apart there. */
  actions: {
    marginBlockStart: { default: null, [PHONE]: 'auto' },
    rowGap: { default: spacingVars['--spacing-5'], [PHONE]: spacingVars['--spacing-3'] },
    // The small text between the buttons, such as the "or", is 13px on a phone, on the font's own line.
    '--text-supporting-size': { default: null, [PHONE]: '0.8125rem' },
    '--text-supporting-leading': { default: null, [PHONE]: 'normal' },
  },
})

/**
 * The form of an auth page: its fields, then its buttons. On a phone the form
 * fills the screen under the heading and the buttons sit at its bottom (or
 * right below the fields, when these run past the screen).
 */
export default function AuthForm({
  onSubmit,
  actions,
  fieldsXstyle,
  children,
}: {
  onSubmit: ComponentProps<typeof VStack>['onSubmit']
  /** The submit button and whatever goes with it, such as another way to sign in. */
  actions: ReactNode
  /** Sets the fields apart differently than the default. */
  fieldsXstyle?: StyleXStyles
  /** The fields. */
  children: ReactNode
}) {
  return (
    <VStack as="form" onSubmit={onSubmit} hAlign="stretch" xstyle={styles.form}>
      <FormLayout xstyle={[styles.fields, fieldsXstyle, entranceStyles.fadeUp, ENTRANCE_DELAYS[2]]}>
        {children}
      </FormLayout>
      <VStack hAlign="stretch" xstyle={[styles.actions, entranceStyles.fadeUp, ENTRANCE_DELAYS[4]]}>
        {actions}
      </VStack>
    </VStack>
  )
}
