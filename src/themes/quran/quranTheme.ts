import { defineTheme } from '@astryxdesign/core/theme'
import { neutralTheme } from '@astryxdesign/theme-neutral'
import { palette, white } from './tokens/quran.palette.js'

/**
 * Quran Reader theme: deep green on warm sand, Fraunces headings, and Amiri
 * for the Arabic. Built on Neutral, so everything not set here (component
 * overrides, icons, the coarse-pointer type adaptation) is inherited.
 *
 * Every color is a stop of the committed palette (`tokens/quran.palette.ts`,
 * regenerated from `palette.config.json`), never a literal.
 */
const {
  neutral: sand,
  emerald,
  red,
  orange,
  yellow,
  green,
  teal,
  cyan,
  blue,
  purple,
  pink,
} = palette

/** A neutral-derived override Neutral's own components write with gray stops. */
const liftedSecondaryText = `light-dark(${sand.light[30]}, ${sand.dark[80]})`

export const quranTheme = defineTheme({
  name: 'quran',
  extends: neutralTheme,

  // Child typography replaces Neutral's entirely, so all of it is restated.
  typography: {
    scale: { base: 14, ratio: 1.2 },
    body: {
      family: 'Figtree Variable',
      fallbacks:
        'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      family: 'Fraunces Variable',
      fallbacks: 'Fraunces, Georgia, "Times New Roman", serif',
      weights: { 3: 'bold', 4: 'bold' },
    },
    code: {
      family: 'ui-monospace',
      fallbacks: '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
  },

  // Calmer than Neutral's {125, 300, 700}: about 1.2x slower throughout.
  motion: { fast: 150, medium: 360, slow: 840, ratio: 0.75, character: 'standard' },

  tokens: {
    // ---------------------------------------------------------------- Surfaces
    // Pages read on warm paper; cards and popovers sit on it in white.
    '--color-background-surface': [sand.light[95], sand.dark[15]],
    '--color-background-body': [sand.light[95], sand.dark[10]],
    '--color-background-card': [sand.light[100], sand.dark[10]],
    '--color-background-popover': [sand.light[100], sand.dark[10]],
    '--color-background-muted': [sand.light[90], sand.dark[10]],

    // ------------------------------------------------------------------ Accent
    '--color-accent': [emerald.light[45], emerald.dark[65]],
    '--color-accent-muted': [emerald.light[85], emerald.dark[30]],
    '--color-text-accent': [emerald.light[40], emerald.dark[75]],
    '--color-icon-accent': [emerald.light[40], emerald.dark[75]],
    '--color-on-accent': [sand.light[100], sand.dark[5]],
    '--color-neutral': [`${sand.light[0]}0F`, `${sand.dark[100]}1A`],

    // ---------------------------------------------------------------- Overlays
    '--color-overlay': [`${sand.light[5]}80`, `${sand.dark[0]}CC`],
    '--color-overlay-hover': [`${sand.light[5]}0D`, `${sand.dark[100]}0D`],
    '--color-overlay-pressed': [`${sand.light[5]}1A`, `${sand.dark[100]}1A`],

    // -------------------------------------------------------------------- Text
    '--color-text-primary': [sand.light[5], sand.dark[100]],
    '--color-text-secondary': [sand.light[30], sand.dark[65]],
    '--color-text-disabled': [sand.light[60], sand.dark[35]],
    '--color-on-dark': sand.light[100],
    '--color-on-light': sand.light[5],
    '--color-on-success': [sand.light[100], sand.dark[5]],
    '--color-on-error': [sand.light[100], sand.dark[5]],
    '--color-on-warning': sand.light[5],
    '--color-on-info': [sand.light[100], sand.dark[5]],

    // ------------------------------------------------------------------- Icons
    '--color-icon-primary': [sand.light[5], sand.dark[100]],
    '--color-icon-secondary': [sand.light[45], sand.dark[65]],
    '--color-icon-disabled': [sand.light[60], sand.dark[35]],

    // ------------------------------------------------------------------ Status
    // Info uses teal so it never competes with the green accent.
    '--color-info': [teal.light[45], teal.dark[65]],
    '--color-info-muted': [teal.light[85], `${teal.dark[75]}3D`],
    '--color-success': [green.light[45], green.dark[65]],
    '--color-success-muted': [green.dark[85], `${green.light[75]}3D`],
    '--color-warning': yellow.light[80],
    '--color-warning-muted': [yellow.dark[90], `${yellow.light[75]}3D`],
    '--color-error': [red.light[45], red.dark[65]],
    '--color-error-muted': [red.light[85], `${red.dark[75]}3D`],

    '--color-text-info': [teal.light[40], teal.dark[80]],
    '--color-text-success': [green.light[45], green.light[75]],
    '--color-text-warning': [yellow.light[45], yellow.light[80]],
    '--color-text-error': [red.light[45], red.dark[80]],

    '--color-on-info-muted': [teal.light[25], teal.dark[80]],
    '--color-on-success-muted': [green.light[25], green.light[75]],
    '--color-on-warning-muted': [yellow.light[25], yellow.light[80]],
    '--color-on-error-muted': [red.light[25], red.dark[80]],

    // ------------------------------------------- Borders (a step quieter than Neutral)
    '--color-border': [`${sand.light[0]}0F`, `${sand.dark[100]}14`],
    '--color-border-emphasized': [sand.light[90], sand.dark[30]],
    '--color-track': [sand.light[90], sand.dark[30]],
    '--color-skeleton': [sand.light[95], sand.dark[30]],

    // ----------------------------------------------------------------- Effects
    '--color-shadow': [`${sand.light[10]}1A`, `${sand.dark[0]}4D`],
    '--color-tint-hover': [sand.light[0], sand.dark[100]],

    // Warm drops on sand; dark mode keeps Neutral's white rim inset.
    '--shadow-low':
      `0 2px 4px light-dark(${sand.light[10]}0D, ${sand.dark[0]}40), ` +
      `0 4px 8px light-dark(${sand.light[10]}1A, ${sand.dark[0]}66), ` +
      `inset 0 0 0 1px light-dark(transparent, ${white}14)`,
    '--shadow-med':
      `0 2px 4px light-dark(${sand.light[10]}0D, ${sand.dark[0]}59), ` +
      `0 4px 12px light-dark(${sand.light[10]}1A, ${sand.dark[0]}80), ` +
      `inset 0 0 0 1px light-dark(transparent, ${white}1F)`,
    '--shadow-high':
      `0 4px 6px light-dark(${sand.light[10]}1A, ${sand.dark[0]}80), ` +
      `0 12px 24px light-dark(${sand.light[10]}26, ${sand.dark[0]}B3), ` +
      `inset 0 0 0 1px light-dark(transparent, ${white}26)`,
    '--shadow-inset-hover': `inset 0px 0px 0px 2px ${emerald.light[50]}4D`,
    '--shadow-inset-selected': `inset 0px 0px 0px 2px ${emerald.light[50]}80`,

    // ------------------------------------------------- Color families (Badge, Token, …)
    '--color-background-red': [red.light[85], red.dark[25]],
    '--color-border-red': [red.light[80], red.light[65]],
    '--color-icon-red': [red.light[25], red.dark[75]],
    '--color-text-red': [red.light[25], red.dark[80]],

    '--color-background-orange': [orange.light[85], orange.dark[25]],
    '--color-border-orange': [orange.light[85], orange.dark[65]],
    '--color-icon-orange': [orange.light[25], orange.light[75]],
    '--color-text-orange': [orange.light[25], orange.dark[80]],

    '--color-background-yellow': [yellow.dark[90], yellow.dark[25]],
    '--color-border-yellow': [yellow.dark[80], yellow.light[65]],
    '--color-icon-yellow': [yellow.light[25], yellow.light[75]],
    '--color-text-yellow': [yellow.light[25], yellow.light[80]],

    '--color-background-green': [green.dark[85], green.dark[25]],
    '--color-border-green': [green.dark[80], green.light[65]],
    '--color-icon-green': [green.light[25], green.light[75]],
    '--color-text-green': [green.light[25], green.light[75]],

    '--color-background-teal': [teal.light[85], teal.dark[25]],
    '--color-border-teal': [teal.light[80], teal.dark[65]],
    '--color-icon-teal': [teal.light[25], teal.dark[75]],
    '--color-text-teal': [teal.light[25], teal.light[80]],

    '--color-background-cyan': [cyan.dark[85], cyan.dark[25]],
    '--color-border-cyan': [cyan.dark[80], cyan.dark[65]],
    '--color-icon-cyan': [cyan.light[25], cyan.dark[75]],
    '--color-text-cyan': [cyan.light[25], cyan.dark[80]],

    '--color-background-blue': [blue.light[85], blue.dark[25]],
    '--color-border-blue': [blue.light[80], blue.dark[65]],
    '--color-icon-blue': [blue.light[25], blue.dark[75]],
    '--color-text-blue': [blue.light[25], blue.dark[80]],

    '--color-background-purple': [purple.light[90], purple.dark[25]],
    '--color-border-purple': [purple.light[85], purple.light[70]],
    '--color-icon-purple': [purple.light[25], purple.light[75]],
    '--color-text-purple': [purple.light[25], purple.dark[80]],

    '--color-background-pink': [pink.light[85], pink.dark[25]],
    '--color-border-pink': [pink.light[85], pink.light[70]],
    '--color-icon-pink': [pink.light[25], pink.dark[75]],
    '--color-text-pink': [pink.light[25], pink.dark[80]],

    '--color-background-gray': [sand.light[90], sand.dark[20]],
    '--color-border-gray': [sand.light[85], sand.dark[15]],
    '--color-icon-gray': [sand.light[30], sand.dark[65]],
    '--color-text-gray': [sand.light[10], sand.dark[85]],

    // ------------------------------------------------------- Shapes: soft, bookish
    // Neutral sets these as explicit tokens, which beat a `radius` scale config.
    '--radius-inner': '0.25rem',
    '--radius-element': '0.5rem',
    '--radius-container': '0.625rem',
    '--radius-page': '1.25rem',

    // ------------------------------------------------- Controls: easier to hit
    '--size-element-sm': '2rem',
    '--size-element-md': '2.25rem',
    '--size-element-lg': '2.5rem',
  },

  components: {
    // Ayahs, bismillah and surah names: Amiri with room for the diacritics.
    'text': {
      'type:arabic': {
        fontFamily: "Amiri, 'Noto Naskh Arabic', 'Times New Roman', serif",
        fontSize: 'var(--font-size-2xl)',
        lineHeight: '2.2',
        fontWeight: 'var(--font-weight-normal)',
      },
    },

    // Neutral lifts secondary text on these fills with its gray stops; use sand.
    'item': { selected: { '--color-text-secondary': liftedSecondaryText } },
    'tree-list-item': { selected: { '--color-text-secondary': liftedSecondaryText } },
    'file-input': { 'mode:dropzone': { '--color-text-secondary': liftedSecondaryText } },
    'citation': { 'variant:number': { '--color-text-secondary': liftedSecondaryText } },
    'segmented-control-item': { base: { '--color-text-secondary': liftedSecondaryText } },
  },
})
