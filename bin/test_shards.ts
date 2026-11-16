/*
|--------------------------------------------------------------------------
| Sharded test runner
|--------------------------------------------------------------------------
|
| Runs the tests in parallel processes, one Japa shard each:
|
|   npm run test:shards                     4 shards, every suite
|   npm run test:shards -- --shards=6       6 shards
|   npm run test:shards -- browser          any other argument goes to Japa
|
| Each process gets its own HTTP port, Vite HMR port, SQLite file and Vite
| cache (through TEST_SHARD), so the shards never share state. Codegen runs
| once up front; `node ace test` would rewrite `.adonisjs` in every process.
|
| Each shard's Vite cache is built before its tests start. Vite otherwise
| builds it mid-run, and on Windows renaming the new cache into place fails
| with EPERM while the browser holds its files. A cache that is already
| current is left as is, so this takes a few seconds.
|
| A shard's output is printed when it finishes, so reporters never interleave.
|
*/

import { spawn } from 'node:child_process'
import { availableParallelism } from 'node:os'

const BASE_PORT = 3400
const BASE_HMR_PORT = 24700

const args = process.argv.slice(2)
const shardsArg = args.find((arg) => arg.startsWith('--shards='))
const japaArgs = args.filter((arg) => arg !== shardsArg)
const shards = shardsArg
  ? Number(shardsArg.split('=')[1])
  : Math.min(4, Math.max(1, Math.floor(availableParallelism() / 2)))

if (!Number.isInteger(shards) || shards < 1) {
  console.error(`Invalid --shards. Expected a positive integer, such as --shards=4`)
  process.exit(1)
}

function run(command: string[], env: NodeJS.ProcessEnv = {}): Promise<number> {
  return new Promise((resolve) => {
    spawn(process.execPath, command, { stdio: 'inherit', env: { ...process.env, ...env } }).on(
      'close',
      (code) => resolve(code ?? 1)
    )
  })
}

/**
 * Builds the shard's Vite dependency cache. One retry covers a rename that
 * antivirus or the file indexer still holds on Windows.
 */
async function buildViteCache(shard: number): Promise<number> {
  const optimize = () =>
    run(['node_modules/vite/bin/vite.js', 'optimize', '--logLevel', 'error'], {
      NODE_ENV: 'test',
      TEST_SHARD: String(shard),
    })
  return (await optimize()) === 0 ? 0 : optimize()
}

function runShard(
  shard: number
): Promise<{ shard: number; exitCode: number; output: string; seconds: number }> {
  const startedAt = performance.now()
  const child = spawn(
    process.execPath,
    [
      '--import=@poppinss/ts-exec',
      '--enable-source-maps',
      'bin/test.ts',
      ...japaArgs,
      `--shard=${shard}/${shards}`,
    ],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        FORCE_COLOR: 'true',
        TEST_SHARD: String(shard),
        PORT: String(BASE_PORT + shard),
        VITE_HMR_PORT: String(BASE_HMR_PORT + shard),
      },
    }
  )

  let output = ''
  child.stdout.on('data', (chunk) => (output += chunk))
  child.stderr.on('data', (chunk) => (output += chunk))

  return new Promise((resolve) => {
    child.on('close', (code) => {
      const seconds = Math.round((performance.now() - startedAt) / 1000)
      resolve({ shard, exitCode: code ?? 1, output, seconds })
    })
  })
}

if ((await run(['ace', 'codegen'])) !== 0) {
  process.exit(1)
}

const cacheBuilds = await Promise.all(
  Array.from({ length: shards }, (_, index) => buildViteCache(index + 1))
)
if (cacheBuilds.some((code) => code !== 0)) {
  console.error('Building the Vite cache of a shard failed')
  process.exit(1)
}

console.log(`\nRunning the tests in ${shards} shards\n`)

const results = await Promise.all(
  Array.from({ length: shards }, (_, index) =>
    runShard(index + 1).then((result) => {
      const status = result.exitCode === 0 ? 'passed' : 'FAILED'
      console.log(`\n━━ Shard ${result.shard}/${shards} ${status} in ${result.seconds}s ━━`)
      console.log(result.output)
      return result
    })
  )
)

const failed = results.filter((result) => result.exitCode !== 0).map((result) => result.shard)
console.log(
  failed.length
    ? `\nShards ${failed.map((shard) => `${shard}/${shards}`).join(', ')} failed`
    : `\nAll ${shards} shards passed`
)
process.exitCode = failed.length ? 1 : 0
