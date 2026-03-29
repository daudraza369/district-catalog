function normalizeFlowerKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function buildFlowerImageMap(): Record<string, string> {
  const map: Record<string, string> = {}
  if (typeof window !== 'undefined') {
    return map
  }

  try {
    const fs = eval('require')('fs') as typeof import('fs')
    const path = eval('require')('path') as typeof import('path')
    const flowersDir = path.join(process.cwd(), 'public/flowers')
    const files = fs.readdirSync(flowersDir)

    for (const file of files) {
      if (!file.endsWith('.png') && !file.endsWith('.jpg')) continue
      const nameWithoutExt = file.replace(/\.(png|jpg)$/i, '')
      const key = normalizeFlowerKey(nameWithoutExt)
      map[key] = `/flowers/${file}`
    }
  } catch {
    // folder not found, return empty map
  }

  return map
}

export const FLOWER_IMAGE_MAP: Record<string, string> = buildFlowerImageMap()

const MANUAL_OVERRIDES: Record<string, string> = {
  'achillea white': '/flowers/achilia-whiteachilia-white.png',
  'achillea painted': '/flowers/achilia-painted-red.png',
  'achillea yellow': '/flowers/achilia-yellow.png',
  'campanula purple': '/flowers/campanulla-purple.png',
  'campanula white': '/flowers/campanulla-white.png',
  'roses mandala': '/flowers/roses-mandala.png',
  'chrysanthemum lamira': '/flowers/chrysanthemum-lamira.png',
  'hydrangea bianca': '/flowers/hydrangea-bianca.png',
  'tulip lobke': '/flowers/tulip-lobke.png',
  'spray garden roses bombastic': '/flowers/spray-garden-roses-bombastic.png',
  'lilium oriental frontera': '/flowers/lilium-oriental-frontera.png'
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from(
    { length: m + 1 },
    (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

export function getFlowerImagePath(flowerName: string, variety?: string): string | null {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

  const keys = Object.keys(FLOWER_IMAGE_MAP)

  const overrideKey = normalize(`${flowerName}${variety ? ` ${variety}` : ''}`)
  if (MANUAL_OVERRIDES[overrideKey]) return MANUAL_OVERRIDES[overrideKey]

  if (variety) {
    const fullKey = normalize(`${flowerName} ${variety}`)
    if (FLOWER_IMAGE_MAP[fullKey]) return FLOWER_IMAGE_MAP[fullKey]
  }

  if (variety) {
    const nName = normalize(flowerName)
    const nVariety = normalize(variety)
    const match = keys.find((k) => k.includes(nName) && k.includes(nVariety))
    if (match) return FLOWER_IMAGE_MAP[match]
  }

  if (variety) {
    const target = normalize(`${flowerName} ${variety}`)
    let bestKey = ''
    let bestDist = Infinity
    for (const key of keys) {
      const dist = levenshtein(target, key)
      if (dist < bestDist && dist <= 4) {
        bestDist = dist
        bestKey = key
      }
    }
    if (bestKey) return FLOWER_IMAGE_MAP[bestKey]
  }

  const nName = normalize(flowerName)
  let bestKey = ''
  let bestDist = Infinity
  for (const key of keys) {
    const keyStart = key
      .split(' ')
      .slice(0, nName.split(' ').length)
      .join(' ')
    const dist = levenshtein(nName, keyStart)
    if (dist < bestDist && dist <= 3) {
      bestDist = dist
      bestKey = key
    }
  }
  if (bestKey) return FLOWER_IMAGE_MAP[bestKey]

  return null
}
