import { type ReactNode, type Ref } from 'react'
import { PauseIcon, PlayIcon } from '@heroicons/react/20/solid'
import { LayoutFooter } from '@astryxdesign/core/Layout'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { Text } from '@astryxdesign/core/Text'

/**
 * The bar pinned to the bottom of a Surah: `startContent` (the sidebar
 * toggle), Play/Pause for the Recitation and the Ayah Reference of the
 * Recited Word.
 */
export default function RecitationPlayer({
  isPlaying,
  isLoading,
  recitedReference,
  onPlay,
  onPause,
  footerRef,
  startContent,
}: {
  isPlaying: boolean
  isLoading: boolean
  /** The Ayah Reference of the Recited Word, e.g. `110:2`. */
  recitedReference: string | null
  onPlay: () => void
  onPause: () => void
  footerRef: Ref<HTMLDivElement>
  startContent?: ReactNode
}) {
  return (
    <LayoutFooter ref={footerRef} label="Recitation" hasDivider>
      <HStack gap={3} vAlign="center">
        {startContent}
        {isPlaying ? (
          <Button
            label="Pause Recitation"
            variant="primary"
            icon={<Icon icon={PauseIcon} />}
            onClick={onPause}
          />
        ) : (
          <Button
            label="Play Recitation"
            variant="primary"
            icon={<Icon icon={PlayIcon} />}
            isLoading={isLoading}
            onClick={onPlay}
          />
        )}
        {recitedReference !== null && (
          <Text type="supporting" color="secondary" data-testid="recited-ayah">
            {recitedReference}
          </Text>
        )}
      </HStack>
    </LayoutFooter>
  )
}
