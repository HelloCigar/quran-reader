import * as stylex from '@stylexjs/stylex'
import { type ReactNode, use } from 'react'
import { createPortal } from 'react-dom'
import { CheckIcon } from '@heroicons/react/24/outline'
import {
  borderVars,
  colorVars,
  fontWeightVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Icon } from '@astryxdesign/core/Icon'
import { entranceStyles } from '~/components/quran/entrance_styles'
import { useRecitation } from '~/components/quran/recitation'
import { SaveBarHost } from '~/components/settings/save_bar_host'
import { SettingsButton } from '~/components/settings/settings_controls'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
/** The page's phone breakpoint, the one `PageLayout` uses. */
const PHONE = '@media (max-width: 600px)'

/** The space between the parts of a section: 24px, 20px on a phone. */
const SECTION_GAP = { default: spacingVars['--spacing-6'], [PHONE]: spacingVars['--spacing-5'] }
/** The Recitation bar's band under the page: 4px, its 64px card, then 14px. */
const RECITATION_BAND = `calc(${spacingVars['--spacing-1']} + calc(4 * ${spacingVars['--spacing-4']}) + ${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`

const saved = stylex.keyframes({
  '0%': { opacity: 0, transform: `translateY(${spacingVars['--spacing-2']}) scale(0.96)` },
  '12%, 82%': { opacity: 1, transform: 'none' },
  '100%': { opacity: 0, transform: `translateY(calc(-1 * ${spacingVars['--spacing-1']}))` },
})

const styles = stylex.create({
  /** The parts of a section: the heading, the fields, the passkeys box. */
  section: { rowGap: SECTION_GAP },
  /** The fields of a form. */
  fields: { rowGap: SECTION_GAP },
  /** The section's title: 24px, in the heading face; 21px on a phone. */
  title: {
    fontSize: { default: spacingVars['--spacing-6'], [PHONE]: '1.3125rem' },
    fontWeight: fontWeightVars['--font-weight-medium'],
    lineHeight: 'normal',
  },
  /** The line of 14px under it. */
  description: { fontSize: '0.875rem', lineHeight: 'normal' },
  /**
   * The "Saved" note: it fades up when a save lands, stays a moment and fades
   * out, over the 2 seconds Inertia counts as `recentlySuccessful`.
   */
  saved: {
    color: colorVars['--color-text-accent'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    animationName: { default: saved, [REDUCED_MOTION]: 'none' },
    animationDuration: '2s',
    animationTimingFunction: 'ease',
    animationFillMode: 'both',
  },
  /** The note and the pill of a screen: on a phone they are in the bar instead. */
  inline: { display: { default: 'flex', [PHONE]: 'none' } },
  /**
   * The Save changes bar of a phone, fixed to the foot of the screen: 14px
   * above the button, 16px to each side and 22px below it, on the page's
   * colour, blurred, with a hairline on top. It takes the full width of the
   * screen, as the mockup does, so it is a child of the layout and not of the
   * panel.
   */
  bar: {
    display: { default: 'none', [PHONE]: 'flex' },
    position: 'fixed',
    insetInline: 0,
    insetBlockEnd: 0,
    zIndex: 20,
    boxSizing: 'border-box',
    paddingBlockStart: `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`,
    paddingBlockEnd: `calc(${spacingVars['--spacing-5']} + ${spacingVars['--spacing-0-5']})`,
    paddingInline: spacingVars['--spacing-4'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-background-body']} 92%, transparent)`,
    backdropFilter: `blur(calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']}))`,
    borderBlockStartWidth: borderVars['--border-width'],
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: `color-mix(in srgb, ${colorVars['--color-text-primary']} 6%, transparent)`,
  },
  /** With a Recitation on, its bar is the footer of the page: the Save changes bar sits above it. */
  barAboveRecitation: { insetBlockEnd: RECITATION_BAND },
})

/**
 * One section of the settings panel: its heading and description over the
 * fields. The section fades up when the reader opens it.
 */
export function SettingsSection({
  heading,
  description,
  children,
}: {
  heading: string
  description: string
  children: ReactNode
}) {
  return (
    <VStack hAlign="stretch" xstyle={[styles.section, entranceStyles.fadeUp]}>
      <VStack gap={1}>
        <Heading level={2} xstyle={styles.title}>
          {heading}
        </Heading>
        <Text type="supporting" color="secondary" xstyle={styles.description}>
          {description}
        </Text>
      </VStack>
      {children}
    </VStack>
  )
}

/** The fields of a form, one over the other: 24px apart, 20px on a phone. */
export function SettingsFields({ children }: { children: ReactNode }) {
  return (
    <VStack hAlign="stretch" xstyle={styles.fields}>
      {children}
    </VStack>
  )
}

/** The note that a save has just landed. */
function SavedNote() {
  return (
    <HStack gap={1.5} vAlign="center" role="status" xstyle={styles.saved}>
      <Icon icon={CheckIcon} size="sm" />
      <Text type="supporting" weight="medium" color="inherit">
        Saved
      </Text>
    </HStack>
  )
}

/**
 * The foot of a section: the green Save changes pill on the right and, when
 * a save has just landed, a "Saved" note beside it.
 *
 * On a phone the pill is a bar fixed to the foot of the screen, with the
 * note to the left of a full-width pill; it renders in `SettingsLayout`'s
 * `SaveBarHost`, above the Recitation bar when one is on. Either way the pill
 * submits the form by its id, so it can sit outside it.
 *
 * `form` is the id of the form it submits.
 */
export function SettingsSaveBar({
  form,
  processing,
  saved: isSaved,
}: {
  form: string
  processing: boolean
  saved: boolean
}) {
  const host = use(SaveBarHost)
  const { recited } = useRecitation()
  const label = processing ? 'Saving…' : 'Save changes'

  return (
    <>
      <HStack gap={3} hAlign="end" vAlign="center" xstyle={styles.inline}>
        {isSaved && <SavedNote />}
        <SettingsButton type="submit" form={form} label={label} isLoading={processing} />
      </HStack>
      {host &&
        createPortal(
          <HStack
            gap={3}
            vAlign="center"
            xstyle={[styles.bar, recited !== null && styles.barAboveRecitation]}
          >
            {isSaved && <SavedNote />}
            <SettingsButton
              tone="bar"
              type="submit"
              form={form}
              label={label}
              isLoading={processing}
            />
          </HStack>,
          host
        )}
    </>
  )
}
