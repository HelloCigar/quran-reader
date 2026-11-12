import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { Icon } from '@astryxdesign/core/Icon'
import { IconButton } from '@astryxdesign/core/IconButton'
import { useTheme } from '@astryxdesign/core/theme'
import { useThemePreference } from '~/components/theme/theme_preference'

/**
 * Switches between light and dark mode. Until the user picks one, the app
 * follows the operating system, and the button offers the opposite of the
 * mode currently in effect.
 */
export default function ThemeToggle() {
  const { mode } = useTheme()
  const { setPreference } = useThemePreference()
  const next = mode === 'dark' ? 'light' : 'dark'
  const label = `Switch to ${next} theme`

  return (
    <IconButton
      label={label}
      tooltip={label}
      variant="ghost"
      size="sm"
      icon={<Icon icon={next === 'dark' ? MoonIcon : SunIcon} />}
      onClick={() => setPreference(next)}
    />
  )
}
