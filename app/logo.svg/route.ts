import { promises as fs } from 'node:fs'
import path from 'node:path'

export async function GET() {
  const logoPath = path.join(process.cwd(), 'logo.svg')
  const svg = await fs.readFile(logoPath, 'utf8')

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}
