import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read env from .env.local manually
const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8')
const env = {}
envFile.split('\n').forEach((line) => {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) {
    env[key.trim()] = vals.join('=').trim()
  }
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const flowersDir = path.join(__dirname, '../public/flowers')
const files = fs.readdirSync(flowersDir).filter((f) => f.endsWith('.png') || f.endsWith('.jpg'))

console.log(`Uploading ${files.length} images...`)

let success = 0
let failed = 0
const failedFiles = []

for (const file of files) {
  const filePath = path.join(flowersDir, file)
  const fileBuffer = fs.readFileSync(filePath)
  const contentType = file.endsWith('.png') ? 'image/png' : 'image/jpeg'

  const { error } = await supabase.storage.from('flower-images').upload(`flowers/${file}`, fileBuffer, {
    contentType,
    upsert: true
  })

  if (error) {
    console.error(`FAILED: ${file}`, error.message)
    failed++
    failedFiles.push(file)
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
  console.log('Failed files:', failedFiles)
}

// Get base URL for images
const {
  data: { publicUrl }
} = supabase.storage.from('flower-images').getPublicUrl('flowers/test')

const baseUrl = publicUrl.replace('/test', '')
console.log('\nBase URL for images:')
console.log(baseUrl)
console.log('\nExample image URL:')
console.log(`${baseUrl}/${files[0]}`)
