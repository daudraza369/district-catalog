import fs from 'node:fs'
import path from 'node:path'

const src = 'D:\\District Catalog\\DF — 1015 x 1350px Asset Library (Grey Background)'
const dst = 'D:\\District Catalog\\public\\flowers'

if (!fs.existsSync(dst)) {
  fs.mkdirSync(dst, { recursive: true })
}

const files = fs.readdirSync(src).filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file))
const used = new Map()

for (const file of files) {
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

  fs.copyFileSync(path.join(src, file), path.join(dst, out))
}

console.log(`copied:${files.length}`)
