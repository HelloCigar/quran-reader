/**
 * Loads the @adonisplus/flow ast-grep rules as an oxlint JS plugin.
 *
 * `astGrep()` returns ESLint flat config blocks; oxlint only needs the plugin
 * from the first block. Each rule's `files`/`ignores` scope is mirrored in the
 * "flow/*" overrides in .oxlintrc.json (all 8 rules).
 */
import { astGrep } from '@adonisjs/eslint-ast-grep'

const [{ plugins }] = astGrep('@adonisplus/flow/rules', { root: import.meta.dirname + '/..' })
const plugin = plugins['ast-grep']

export default { ...plugin, meta: { ...plugin.meta, name: 'flow' } }
