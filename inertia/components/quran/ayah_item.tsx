import { ListItem } from '@astryxdesign/core/List'
import { VStack } from '@astryxdesign/core/VStack'
import { Text } from '@astryxdesign/core/Text'
import type { Data } from '@generated/data'

/**
 * One ayah: its reference ("2:255"), the Arabic exactly as given, reading right
 * to left, and the English translation beneath it.
 */
export default function AyahItem({ ayah }: { ayah: Data.Ayah }) {
  return (
    <ListItem
      label={
        <Text type="supporting" color="secondary">
          {ayah.reference}
        </Text>
      }
      description={
        <VStack gap={3}>
          <VStack dir="rtl">
            <Text type="large" size="2xl" color="primary">
              {ayah.arabic}
            </Text>
          </VStack>
          <Text type="body" color="primary">
            {ayah.english}
          </Text>
        </VStack>
      }
    />
  )
}
