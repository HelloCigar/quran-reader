import { type Ref } from 'react'
import { PauseIcon, PlayIcon } from '@heroicons/react/20/solid'
import { LayoutFooter } from '@astryxdesign/core/Layout'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { Text } from '@astryxdesign/core/Text'

/**
 * The bar pinned to the bottom of a Surah: Play/Pause for the Recitation and
 * the Ayah Reference of the Recited Word.
 */
export default function RecitationPlayer({
  surahNumber,
  isPlaying,
  isLoading,
  recitedAyah,
  onPlay,
  onPause,
  footerRef,
}: {
  surahNumber: number
  isPlaying: boolean
  isLoading: boolean
  recitedAyah: number | null
  onPlay: () => void
  onPause: () => void
  footerRef: Ref<HTMLDivElement>
}) {
  return (
    <LayoutFooter ref={footerRef} label="Recitation" hasDivider>
      <HStack gap={3} vAlign="center">
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
        {recitedAyah !== null && (
          <Text type="supporting" color="secondary" data-testid="recited-ayah">
            {`${surahNumber}:${recitedAyah}`}
          </Text>
        )}
      </HStack>
    </LayoutFooter>
  )
}
