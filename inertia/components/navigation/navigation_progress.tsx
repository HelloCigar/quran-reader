import * as stylex from '@stylexjs/stylex'
import { useRef, useState } from 'react'
import { ProgressBar } from '@astryxdesign/core/ProgressBar'
import { useNavigationEvent } from '~/components/navigation/navigation_events'

/** Visits that finish faster than this never show the bar. */
const SHOW_AFTER_MS = 250

const styles = stylex.create({
  bar: {
    position: 'fixed',
    insetInline: 0,
    insetBlockStart: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
})

/**
 * An indeterminate Astryx `ProgressBar` pinned to the top of the viewport
 * while an Inertia visit is in flight. A load in the background (a block of
 * Ayahs, the Recitation) is not a visit, and never shows it. Replaces Inertia's built-in progress
 * bar (`progress: false` in `app.tsx`).
 */
export default function NavigationProgress() {
  const [isVisible, setIsVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useNavigationEvent('start', (event) => {
    if (event.detail.visit.async) return
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setIsVisible(true), SHOW_AFTER_MS)
  })

  useNavigationEvent('finish', (event) => {
    if (event.detail.visit.async) return
    clearTimeout(timer.current)
    setIsVisible(false)
  })

  if (!isVisible) return null

  return <ProgressBar label="Loading page" isLabelHidden isIndeterminate xstyle={styles.bar} />
}
