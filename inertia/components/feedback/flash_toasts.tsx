import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import {
  colorVars,
  durationVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { HStack } from '@astryxdesign/core/HStack'
import { VStack } from '@astryxdesign/core/VStack'
import { Icon } from '@astryxdesign/core/Icon'
import { IconButton } from '@astryxdesign/core/IconButton'
import { Text } from '@astryxdesign/core/Text'
import { Toast, type ToastProps } from '@astryxdesign/core/Toast'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
const SPRING = 'cubic-bezier(0.34, 1.3, 0.5, 1)'

/** How long a message stays: five seconds, which the line along its foot counts down. */
const LIFETIME = 5000

/** How long a message takes to go: it fades and sinks, then is removed. */
const LEAVING = 200

/** The card rises into place from just below and settles. */
const rise = stylex.keyframes({
  from: { opacity: 0, transform: `translateY(${spacingVars['--spacing-4']}) scale(0.96)` },
  to: { opacity: 1, transform: 'none' },
})

/** The line along the foot runs out, from the end it started at. */
const runOut = stylex.keyframes({
  from: { transform: 'scaleX(1)' },
  to: { transform: 'scaleX(0)' },
})

const styles = stylex.create({
  /**
   * Where messages appear: the middle of the screen's foot, above the
   * Recitation bar, which takes about 80px of it. It lets clicks through
   * except where a message is.
   */
  region: {
    position: 'fixed',
    insetInline: spacingVars['--spacing-0'],
    insetBlockEnd: `calc(${spacingVars['--spacing-12']} * 2)`,
    zIndex: 500,
    paddingInline: spacingVars['--spacing-4'],
    pointerEvents: 'none',
  },
  card: {
    pointerEvents: 'auto',
    animationName: { default: rise, [REDUCED_MOTION]: 'none' },
    animationDuration: '400ms',
    animationTimingFunction: SPRING,
    animationFillMode: 'backwards',
  },
  content: {
    width: '100%',
    columnGap: `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`,
  },
  /** The check and the cross are a step smaller than the icon sizes: 14px. */
  glyph: {
    width: `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`,
    height: `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`,
  },
  mark: {
    flexShrink: 0,
    width: `calc(${spacingVars['--spacing-5']} + ${spacingVars['--spacing-0-5']})`,
    height: `calc(${spacingVars['--spacing-5']} + ${spacingVars['--spacing-0-5']})`,
    borderRadius: radiusVars['--radius-full'],
  },
  success: {
    backgroundColor: colorVars['--color-success'],
    color: colorVars['--color-on-success'],
  },
  failure: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
    fontWeight: 700,
  },
  message: {
    flexGrow: 1,
    minWidth: 0,
    fontWeight: 500,
  },
  errorMessage: {
    color: colorVars['--color-on-error-muted'],
    lineHeight: 1.5,
    paddingBlock: spacingVars['--spacing-1'],
  },
  dismiss: {
    flexShrink: 0,
    width: spacingVars['--spacing-8'],
    height: spacingVars['--spacing-8'],
    borderRadius: radiusVars['--radius-full'],
  },
  life: {
    position: 'absolute',
    insetInline: spacingVars['--spacing-0'],
    insetBlockEnd: spacingVars['--spacing-0'],
    height: spacingVars['--spacing-0-5'],
    backgroundColor: colorVars['--color-success'],
    transformOrigin: 'left',
    animationName: { default: runOut, [REDUCED_MOTION]: 'none' },
    animationDuration: `${LIFETIME}ms`,
    animationTimingFunction: 'linear',
    animationFillMode: 'both',
    /* While the card is under the pointer its timer waits, and so does the line. */
    animationPlayState: { default: 'running', ':is(.astryx-toast:hover *)': 'paused' },
    transitionDuration: durationVars['--duration-fast'],
  },
})

/** What a message holds: its mark, its text, a button to dismiss it and, for one that fades, the line. */
const renderContent: NonNullable<ToastProps['renderContent']> = ({
  body,
  type,
  isAutoHide,
  dismiss,
}) => {
  const isError = type === 'error'

  return (
    <HStack gap={3} vAlign={isError ? 'start' : 'center'} xstyle={styles.content}>
      <VStack
        hAlign="center"
        vAlign="center"
        aria-hidden
        xstyle={[styles.mark, isError ? styles.failure : styles.success]}
      >
        {isError ? (
          <Text type="supporting" weight="bold" color="inherit">
            !
          </Text>
        ) : (
          <Icon icon={CheckIcon} xstyle={styles.glyph} />
        )}
      </VStack>
      <Text type="body" color="inherit" xstyle={[styles.message, isError && styles.errorMessage]}>
        {body}
      </Text>
      <IconButton
        label="Dismiss"
        variant="ghost"
        size="sm"
        icon={<Icon icon={XMarkIcon} xstyle={styles.glyph} />}
        onClick={dismiss}
        xstyle={styles.dismiss}
      />
      {isAutoHide && <VStack aria-hidden xstyle={styles.life} />}
    </HStack>
  )
}

type Message = { id: number; text: string; type: 'info' | 'error'; isLeaving: boolean }

/**
 * Shows the `success` and `error` flash messages from the server, one at a
 * time at the middle of the screen's foot, above the Recitation bar: a new
 * message replaces the one on show, and a success fades after five seconds
 * (an error stays until it is dismissed). Render it once in each layout.
 */
export default function FlashToasts() {
  const { flash } = usePage()
  const [message, setMessage] = useState<Message | null>(null)
  // `null` at first, so a flash that comes with the first page shows too.
  const [seenFlash, setSeenFlash] = useState<typeof flash | null>(null)

  // A new flash from the server replaces the message on show.
  if (flash !== seenFlash) {
    setSeenFlash(flash)
    const text = flash.error ?? flash.success
    if (text) {
      setMessage((shown) => ({
        id: (shown?.id ?? 0) + 1,
        text,
        type: flash.error ? 'error' : 'info',
        isLeaving: false,
      }))
    }
  }

  /** Fades the message out, then removes it, unless a new one has replaced it meanwhile. */
  function leave() {
    setMessage((shown) => shown && { ...shown, isLeaving: true })
    setTimeout(() => setMessage((shown) => (shown?.isLeaving ? null : shown)), LEAVING)
  }

  if (!message) return null

  return (
    <VStack hAlign="center" xstyle={styles.region}>
      <VStack xstyle={styles.card}>
        <Toast
          key={message.id}
          type={message.type}
          body={message.text}
          isAutoHide={message.type === 'info'}
          autoHideDuration={LIFETIME}
          isExiting={message.isLeaving}
          onDismiss={leave}
          renderContent={renderContent}
        />
      </VStack>
    </VStack>
  )
}
