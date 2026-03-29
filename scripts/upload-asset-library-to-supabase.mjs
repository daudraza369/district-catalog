import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8')
const env = {}
for (const line of envFile.split('\n')) {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) {
    env[key.trim()] = vals.join('=').trim()
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const rootDir = path.join(__dirname, '..')
const assetDirEntry = fs
  .readdirSync(rootDir, { withFileTypes: true })
  .find((entry) => entry.isDirectory() && entry.name.includes('1015 x 1350px Asset Library'))

if (!assetDirEntry) {
  throw new Error('Asset library folder not found')
}

const assetDir = path.join(rootDir, assetDirEntry.name)
const files = fs.readdirSync(assetDir).filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file))

const used = new Map()

function toOutputName(file) {
  const ext = path.extname(file).toLowerCase()
  const base = path
    .basename(file, path.extname(file))
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')

  let out = `${base}${ext}`
  if (used.has(out)) {
    const n = used.get(out) + 1
    used.set(out, n)
    out = `${base}-${n}${ext}`
  } else {
    used.set(out, 1)
  }
  return out
}

console.log(`Uploading ${files.length} original assets from: ${assetDir}`)

let success = 0
let failed = 0
const failedFiles = []

for (const file of files) {
  const out = toOutputName(file)
  const fullPath = path.join(assetDir, file)
  const contentType = out.endsWith('.png') ? 'image/png' : out.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
  const buffer = fs.readFileSync(fullPath)

  const { error } = await supabase.storage.from('flower-images').upload(`flowers/${out}`, buffer, {
    contentType,
    upsert: true
  })

  if (error) {
    failed++
    failedFiles.push({ file, out, message: error.message })
    console.error(`FAILED: ${file} -> ${out}`, error.message)
  } else {
    success++
    if (success % 20 === 0) {
      console.log(`Progress: ${success}/${files.length}`)
    }
  }
}

console.log('\nDone!')
console.log(`Success: ${success}`)
console.log(`Failed: ${failed}`)
if (failedFiles.length > 0) {
  console.log('Failed files:', JSON.stringify(failedFiles, null, 2))
}

