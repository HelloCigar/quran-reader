/**
 * Writes the scope of each @adonisplus/flow rule into .oxlintrc.json.
 *
 * `astGrep()` returns ESLint flat config blocks: the first holds the plugin
 * (loaded by lint/flow_rules.js), the rest scope one rule each with `files`
 * and `ignores`. Each scoped block becomes one oxlint override, with its
 * `ignores` as `excludeFiles`, so the scopes come from the package and never
 * drift from a hand-made copy.
 *
 * The overrides are written ahead of time rather than built in vite.config.ts:
 * loading @adonisjs/eslint-ast-grep while Vite+ reads its config makes the
 * plugin match some files against another file's syntax tree.
 *
 *   node lint/sync_flow_overrides.js           rewrite the flow overrides
 *   node lint/sync_flow_overrides.js --check   exit 1 when they are stale
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { isDeepStrictEqual } from 'node:util'
import { astGrep } from '@adonisjs/eslint-ast-grep'

const root = import.meta.dirname + '/..'
const configUrl = new URL('../.oxlintrc.json', import.meta.url)

const [, ...scopedBlocks] = astGrep('@adonisplus/flow/rules', { root })
const flowOverrides = scopedBlocks.map(({ files, ignores, rules }) => ({
  files,
  ...(ignores?.length && { excludeFiles: ignores }),
  rules: Object.fromEntries(
    Object.entries(rules).map(([rule, level]) => [rule.replace(/^ast-grep\//, 'flow/'), level])
  ),
}))

const isFlowOverride = (override) =>
  Object.keys(override.rules ?? {}).every((rule) => rule.startsWith('flow/'))

const config = JSON.parse(readFileSync(configUrl, 'utf8'))
const current = config.overrides.filter(isFlowOverride)

if (isDeepStrictEqual(current, flowOverrides)) {
  process.exit(0)
}

if (process.argv.includes('--check')) {
  console.error(
    'The flow rule overrides in .oxlintrc.json are out of date. Run `npm run lint:flow` to regenerate them.'
  )
  process.exit(1)
}

config.overrides = [...config.overrides.filter((o) => !isFlowOverride(o)), ...flowOverrides]
writeFileSync(configUrl, JSON.stringify(config, null, 2) + '\n')
execSync('npx vp fmt .oxlintrc.json', { cwd: root, stdio: 'ignore' })
console.log('Updated the flow rule overrides in .oxlintrc.json.')
