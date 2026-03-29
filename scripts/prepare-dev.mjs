import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const deepClean = process.argv.includes('--deep')

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function removeIfExists(targetPath) {
  if (!fs.existsSync(targetPath)) return
  const label = path.relative(root, targetPath)
  try {
    fs.rmSync(targetPath, {
      recursive: true,
      force: true,
      maxRetries: 8,
      retryDelay: 150
    })
    process.stdout.write(`Removed ${label}\n`)
    return
  } catch (error) {
    process.stdout.write(`Initial cleanup failed for ${label}. Retrying...\n`)
    const maxAttempts = 4
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        sleep(250 * attempt)
        fs.rmSync(targetPath, {
          recursive: true,
          force: true,
          maxRetries: 8,
          retryDelay: 150
        })
        process.stdout.write(`Removed ${label} on retry ${attempt}\n`)
        return
      } catch {
        // keep retrying
      }
    }

    const message = error instanceof Error ? error.message : String(error)
    process.stdout.write(`Warning: could not remove ${label}: ${message}\n`)
    process.stdout.write('Continuing startup to avoid dev command failure.\n')
  }
}

removeIfExists(path.join(root, '.next'))

if (deepClean) {
  removeIfExists(path.join(root, 'node_modules', '.cache'))
}

process.stdout.write('Dev cache cleanup complete.\n')
