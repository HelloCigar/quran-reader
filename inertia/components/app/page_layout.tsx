import * as stylex from '@stylexjs/stylex'
import { type ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { ENTRANCE_DELAYS, entranceStyles } from '~/components/quran/entrance_styles'

/**
 * The inset every page shares (`LayoutContent padding`): 16px, the content
 * line of the top bar, the settings header and the reader's footer.
 */
export const PAGE_INSET = 4

/** The width a column of reading text is capped at. */
export const PAGE_WIDTH = 720

/** The width of a page's main column: a list, a dashboard, the bookmarks. */
const COLUMN_WIDTH = 880

/** The width of a page with a side-by-side layout, such as the settings. */
const WIDE_COLUMN_WIDTH = 960

const PHONE = '@media (max-width: 600px)'

/** Sizes the spacing scale has no stop for, built from its stops. */
const SPACE_56 = `calc(${spacingVars['--spacing-12']} + ${spacingVars['--spacing-2']})`
const SPACE_96 = `calc(2 * ${spacingVars['--spacing-12']})`
const SPACE_18 = `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`
const SPACE_22 = `calc(${spacingVars['--spacing-5']} + ${spacingVars['--spacing-0-5']})`

const styles = stylex.create({
  /**
   * The column's padding: 56px above, 96px below and 24px to each side, or
   * 12px to each side and 20px above on a phone, where the top bar already
   * sets the page off.
   */
  column: {
    boxSizing: 'border-box',
    width: '100%',
    marginInline: 'auto',
    paddingBlockStart: { default: SPACE_56, [PHONE]: spacingVars['--spacing-5'] },
    // The page scrolls on under the Recitation bar: its end clears the bar's band.
    paddingBlockEnd: `calc(${SPACE_96} + var(--recitation-clearance, 0px))`,
    paddingInline: {
      default: spacingVars['--spacing-6'],
      [PHONE]: spacingVars['--spacing-3'],
    },
  },
  /** `phoneTop="roomy"`: 24px below the top bar on a phone, not 20px. */
  topRoomy: {
    paddingBlockStart: { default: SPACE_56, [PHONE]: spacingVars['--spacing-6'] },
  },
  /** `phoneSides="roomy"`: 16px to each side on a phone, not 12px. */
  sidesRoomy: {
    paddingInline: {
      default: spacingVars['--spacing-6'],
      [PHONE]: spacingVars['--spacing-4'],
    },
  },
  columnDefault: { maxWidth: COLUMN_WIDTH },
  columnWide: { maxWidth: WIDE_COLUMN_WIDTH },
  /** The space between the header and the content: it is tighter on a phone. */
  gapDefault: {
    rowGap: { default: spacingVars['--spacing-9'], [PHONE]: SPACE_18 },
  },
  gapCompact: {
    rowGap: { default: spacingVars['--spacing-8'], [PHONE]: SPACE_18 },
  },
  gapRoomy: {
    rowGap: { default: spacingVars['--spacing-10'], [PHONE]: SPACE_22 },
  },
  header: {
    columnGap: spacingVars['--spacing-6'],
    rowGap: spacingVars['--spacing-4'],
  },
  /** The header sits 4px in from the column's edge, 8px on a phone. */
  headerEdge: {
    paddingInline: { default: spacingVars['--spacing-1'], [PHONE]: spacingVars['--spacing-2'] },
  },
  /** `phoneInset="row"` on an `edge` header: 12px in on a phone, in line with the rows. */
  headerEdgeRowOnPhone: {
    paddingInline: { default: spacingVars['--spacing-1'], [PHONE]: spacingVars['--spacing-3'] },
  },
  /** The header lines up with the text of a list row below it, which sits 20px (12px on a phone) in. */
  headerRow: {
    paddingInline: { default: spacingVars['--spacing-5'], [PHONE]: spacingVars['--spacing-3'] },
  },
  titles: {
    rowGap: { default: spacingVars['--spacing-1-5'], [PHONE]: spacingVars['--spacing-1'] },
  },
  /** The small capitals over the title, spaced a little apart. */
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    lineHeight: 'normal',
    color: colorVars['--color-text-secondary'],
  },
  /** The page's title: 44px on a screen, 32px on a phone, set tight in the heading face. */
  title: {
    fontSize: { default: spacingVars['--spacing-11'], [PHONE]: spacingVars['--spacing-8'] },
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
})

const GAPS = {
  /** The Surahs: 36px. */
  default: styles.gapDefault,
  /** The bookmarks and the settings: 32px. */
  compact: styles.gapCompact,
  /** The dashboard: 40px, 22px on a phone. */
  roomy: styles.gapRoomy,
}

/**
 * The frame of a single-column page inside the app layout: one column of 880px
 * (`size="wide"`: 960px), a header of an optional small-capitals `eyebrow`, the
 * page's `h1` with an optional description, and actions beside it, aligned to
 * the title's baseline, and the content beneath. The header fades up when the
 * page opens. It also sets the document title.
 */
export default function PageLayout({
  title,
  heading = title,
  eyebrow,
  description,
  actions,
  size = 'default',
  gap = 'default',
  inset = 'edge',
  phoneTop = 'default',
  phoneSides = 'default',
  phoneInset,
  children,
}: {
  /** The document title. */
  title: string
  /** The page's `h1`, when it differs from the title. */
  heading?: string
  /** A line of small capitals over the `h1`. */
  eyebrow?: string
  description?: string
  /** Buttons beside the heading, along its bottom; they wrap on a narrow screen. */
  actions?: ReactNode
  /** The width of the column. */
  size?: 'default' | 'wide'
  /** The space between the header and the content. */
  gap?: keyof typeof GAPS
  /**
   * How far the header sits in from the column: `edge` (4px), or `row`, in
   * line with the text of the list rows beneath it.
   */
  inset?: 'edge' | 'row'
  /** Phone only: the space below the top bar, 20px (`default`) or 24px (`roomy`). */
  phoneTop?: 'default' | 'roomy'
  /** Phone only: the column's padding to each side, 12px (`default`) or 16px (`roomy`). */
  phoneSides?: 'default' | 'roomy'
  /** Phone only: `row` puts an `edge` header 12px in, in line with the rows; otherwise `inset` sets it (`edge`: 8px). */
  phoneInset?: 'row'
  children: ReactNode
}) {
  return (
    <Layout
      height="auto"
      content={
        <LayoutContent padding={0}>
          <Head title={title} />
          <VStack
            xstyle={[
              styles.column,
              size === 'wide' ? styles.columnWide : styles.columnDefault,
              GAPS[gap],
              phoneTop === 'roomy' && styles.topRoomy,
              phoneSides === 'roomy' && styles.sidesRoomy,
            ]}
          >
            <HStack
              hAlign="between"
              vAlign="end"
              wrap="wrap"
              xstyle={[
                styles.header,
                inset === 'row'
                  ? styles.headerRow
                  : phoneInset === 'row'
                    ? styles.headerEdgeRowOnPhone
                    : styles.headerEdge,
                entranceStyles.fadeUp,
                ENTRANCE_DELAYS[0],
              ]}
            >
              <VStack xstyle={styles.titles}>
                {eyebrow && (
                  <Text type="supporting" weight="medium" as="p" xstyle={styles.eyebrow}>
                    {eyebrow}
                  </Text>
                )}
                <Heading level={1} weight="medium" xstyle={styles.title}>
                  {heading}
                </Heading>
                {description && (
                  <Text type="supporting" color="secondary">
                    {description}
                  </Text>
                )}
              </VStack>
              {actions && (
                <HStack gap={2} wrap="wrap">
                  {actions}
                </HStack>
              )}
            </HStack>
            {children}
          </VStack>
        </LayoutContent>
      }
    />
  )
}
