function normalizeFlowerKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

const SUPABASE_FLOWERS_BASE = 'https://db.districtflowers.com/storage/v1/object/public/flower-images/flowers'

function buildFlowerImageMap(): Record<string, string> {
  const files = [
    '100-rose-bouquet.png',
    '50-rose-bouquet.png',
    'achilia-painted-red.png',
    'achilia-whiteachilia-white.png',
    'achilia-yellow.png',
    'alstroemerias-aurora.png',
    'alstroemerias-elegance.png',
    'alstroemerias-morado.png',
    'alstroemerias-rumba.png',
    'alstroemerias-zembla.png',
    'amaranthus-cascade.png',
    'amaranthus-green.png',
    'amaranthus-orange.png',
    'amaranthus-plume.png',
    'ammi-majus-visnaga.png',
    'anigozanthos-orange.png',
    'anigozanthos-red.png',
    'anigozanthos-yellow.png',
    'anthurium-champagne.png',
    'anthurium-farao.png',
    'anthurium-grand-slam.png',
    'anthurium-rambla.png',
    'anthurium-showtime.png',
    'anthurium-sun-eye.png',
    'asparagus-dens-meyers.png',
    'asparagus-umbellatus.png',
    'asparagus-virgatus.png',
    'astilbe-erika.png',
    'astilbe-paul-gaarder.png',
    'astilbe-washington.png',
    'astrantia-major-billion-star.png',
    'bouvardia-sensation.png',
    'brunia-silver-bunch.png',
    'bunny-tail-grass.png',
    'calla-colombe.png',
    'calla-crystal-blush.png',
    'calla-gold-medal.png',
    'calla-mario.png',
    'calla-morning-sun.png',
    'calla-odessa.png',
    'calla-paco.png',
    'calla-picasso.png',
    'calla-pink-jewel.png',
    'calla-romance.png',
    'calla-rudolph.png',
    'campanulla-purple.png',
    'campanulla-white.png',
    'chrysanthemum-belicia.png',
    'chrysanthemum-bonita.png',
    'chrysanthemum-deligreen.png',
    'chrysanthemum-dutchmaster.png',
    'chrysanthemum-easy-gold.png',
    'chrysanthemum-g-blake.png',
    'chrysanthemum-kennedy.png',
    'chrysanthemum-lamira-purple.png',
    'chrysanthemum-lamira-red.png',
    'chrysanthemum-lamira.png',
    'chrysanthemum-lion-king.png',
    'chrysanthemum-patrese-white.png',
    'chrysanthemum-petrushka.png',
    'chrysanthemum-pina-colada.png',
    'chrysanthemum-podolsk-double-pink.png',
    'chrysanthemum-podolsk-purple.png',
    'chrysanthemum-podolsk-yellow.png',
    'chrysanthemum-purpeta-red.png',
    'chrysanthemum-quin.png',
    'chrysanthemum-red-bone.png',
    'chrysanthemum-rossi-cream.png',
    'chrysanthemum-rossi-salmon.png',
    'chrysanthemum-rossi-splendid.png',
    'chrysanthemum-rossi-white.png',
    'chrysanthemum-rubble.png',
    'chrysanthemum-santini-madiba-tanga.png',
    'chrysanthemum-santini-rainbow.png',
    'chrysanthemum-santini-tyolo-mix.png',
    'chrysanthemum-santini-yellow.png',
    'chrysanthemum-santini.png',
    'chrysanthemum-single-alibaba.png',
    'chrysanthemum-single-boris-becker.png',
    'chrysanthemum-single-momoko.png',
    'chrysanthemum-single-silent.png',
    'chrysanthemum-sun-up.png',
    'chrysanthemum-superstar.png',
    'chrysanthemum-viceroy.png',
    'chrysanthemum-zembla-lime.png',
    'chrysanthemum-zembla-white.png',
    'chrysanthemum-zembla-yellow.png',
    'craspedia-yellow.png',
    'cymbidium-auckland.png',
    'cymbidium-bremo.png',
    'cymbidium-mini-belinda.png',
    'cymbidium-mini-camelford.png',
    'cymbidium-mini-george-harr.png',
    'cymbidium-mini-pink-parfait.png',
    'cymbidium-red-dream.png',
    'cymbidium-rijsenhout.png',
    'cymbidium-t-kings-peak.png',
    'delphinium-blue-mist.png',
    'delphinium-deep.png',
    'delphinium-elatum.png',
    'eryngium-green.png',
    'eucalyptus-baby-blue-holland.png',
    'eucalyptus-baby-blue-kenya.png',
    'eustoma-double-arena.png',
    'eustoma-double-rosita-blue.png',
    'eustoma-double-rosita-pink.png',
    'eustoma-double-rosita-purple.png',
    'eustoma-double-rosita-white.png',
    'eustoma-single-claire.png',
    'freesia-double-volante.png',
    'gerbera-bonanza.png',
    'gerbera-delmonte.png',
    'gerbera-dreamer.png',
    'gerbera-lobby.png',
    'gerbera-mini-albino.png',
    'gerbera-mini-alex-noor.png',
    'gerbera-mini-cafe.png',
    'gerbera-mini-dixon.png',
    'gerbera-mini-espresso.png',
    'gerbera-mini-kirstey.png',
    'gerbera-mini-maserati.png',
    'gerbera-mini-tompouca.png',
    'gerbera-mini-tweety.png',
    'gerbera-moreno.png',
    'gerbera-nemo.png',
    'gerbera-phoenix.png',
    'gerbera-pomponi-orange.png',
    'gerbera-pomponi-pink.png',
    'gerbera-pomponi-red-black.png',
    'gerbera-pomponi-red-gradient.png',
    'gerbera-pomponi-red-yellow.png',
    'gerbera-pomponi-white.png',
    'gerbera-pomponi-yellow.png',
    'gerbera-white-house.png',
    'gladiolus-cantate.png',
    'gladiolus-chinon.png',
    'gladiolus-piet-mohlen.png',
    'gypsophillas-white.png',
    'hydrangea-bianca.png',
    'hydrangea-deep-blue.png',
    'hydrangea-diamond-extra.png',
    'hydrangea-diamond-select.png',
    'hydrangea-dream-pink.png',
    'hydrangea-esmerald.png',
    'hydrangea-light-blue.png',
    'hydrangea-white-extra.png',
    'hydrangea-white-premium.png',
    'hydrangea-white.png',
    'hypericum-green.png',
    'hypericum-red.png',
    'hypericum-white.png',
    'ilex-verticlilata.png',
    'ires-blue-magic.png',
    'ires-casablanca.png',
    'ires-hot-pink.png',
    'japanese-carnation.png',
    'jatropha-firecracker.png',
    'kal-pink-meadow.png',
    'kal-red-meadow.png',
    'kal-white-meadow.png',
    'kal-yellow-meadow.png',
    'lavandula-bs.png',
    'leucadendron-goldstrike.png',
    'leucadendron-senorita.png',
    'leucanthemum-bnch-max.png',
    'leucospermum-succession-orange.png',
    'leucospermum-succession-yellow.png',
    'lilium-la-pink.png',
    'lilium-oriental-dalian.png',
    'lilium-oriental-frontera.png',
    'lilium-oriental-santander.png',
    'lilium-oriental-zambesi.png',
    'lilium-tisento.png',
    'limonium-pink.png',
    'limonium-purple.png',
    'limonium-white.png',
    'limonium-yellow.png',
    'mathiolas-pink.png',
    'mathiolas-white.png',
    'mathiolas-yellow.png',
    'mixed-crystal-blush.png',
    'paeonia-duchesse-de-nemour.png',
    'paeonia-gardenia.png',
    'paeonia-red-charm.png',
    'phalaenopsis-buffalo.png',
    'phalaenopsis-manila.png',
    'phalaenopsis-montreux.png',
    'phalaenopsis-sensation.png',
    'pittosporum-ilan.png',
    'pittosporum-nigra.png',
    'protea-brenda.png',
    'ranunculus-elegance-orange.png',
    'ranunculus-elegance-pink.png',
    'ranunculus-elegance-red.png',
    'ranunculus-elegance-white.png',
    'ranunculus-elegance-yellow.png',
    'roses-artcaffe.png',
    'roses-celeb.png',
    'roses-confidential.png',
    'roses-deep-purple.png',
    'roses-ever-red.png',
    'roses-gold-finch.png',
    'roses-good-time.png',
    'roses-helene.png',
    'roses-hermosa.png',
    'roses-jumilia.png',
    'roses-madam-red.png',
    'roses-mandala.png',
    'roses-mayfair.png',
    'roses-new-orleans.png',
    'roses-nightingale.png',
    'roses-ocean-song.png',
    'roses-one-4-coco.png',
    'roses-proud.png',
    'roses-revival.png',
    'roses-sandstorm.png',
    'roses-snow-storm.png',
    'roses-tacazzi.png',
    'roses-targareyn.png',
    'roses-water-game.png',
    'ruscus-color-treated-golden.png',
    'ruscus-color-treated-silver.png',
    'ruscus-italian.png',
    'salix-pussy-willow-red.png',
    'salix-pussy-willow-white.png',
    'single-rose.png',
    'skimmia-confusa-kew.png',
    'skimmia-japonica-rubella.png',
    'solidago-yellow.png',
    'spray-garden-roses-bala.png',
    'spray-garden-roses-bombastic.png',
    'spray-garden-roses-candy-flow.png',
    'spray-garden-roses-cheyenne.png',
    'spray-garden-roses-finders-lane.png',
    'spray-garden-roses-giselle.png',
    'spray-garden-roses-golden-trendsetter.png',
    'spray-garden-roses-good-mood.png',
    'spray-garden-roses-imagine.png',
    'spray-garden-roses-innocent.png',
    'spray-garden-roses-juietta.png',
    'spray-garden-roses-julietta-pretty.png',
    'spray-garden-roses-la-mandarina.png',
    'spray-garden-roses-lady-bombastic.png',
    'spray-garden-roses-lady-ella.png',
    'spray-garden-roses-midnight-magic.png',
    'spray-garden-roses-mineola.png',
    'spray-garden-roses-party-trendsetter.png',
    'spray-garden-roses-pavlova.png',
    'spray-garden-roses-pink-o-hara.png',
    'spray-garden-roses-princess-charlene.png',
    'spray-garden-roses-princess-fairy-kiss.png',
    'spray-garden-roses-princess-miko.png',
    'spray-garden-roses-rainy-days.png',
    'spray-garden-roses-royal-trendsetter.png',
    'spray-garden-roses-toulouse-lautrec.png',
    'spray-garden-roses-white-o-hara.png',
    'spray-garden-roses-yes-i-do.png',
    'spray-garden-roses-yoga-trendsetter.png',
    'spray-roses-babe-orange.png',
    'spray-roses-debi-lilly.png',
    'spray-roses-dinara.png',
    'spray-roses-eileen.png',
    'spray-roses-firework.png',
    'spray-roses-marisa.png',
    'spray-roses-mirable.png',
    'spray-roses-odilia.png',
    'spray-roses-quincy.png',
    'spray-roses-reflex.png',
    'spray-roses-royal-porceline.png',
    'spray-roses-salinero.png',
    'spray-roses-silver-shadow.png',
    'spray-roses-snow-flake.png',
    'statice-pink.png',
    'statice-purple.png',
    'statice-white.png',
    'statice-yellow.png',
    'sunflower-yellow.png',
    'tulip-aafke.png',
    'tulip-ardour.png',
    'tulip-circuit.png',
    'tulip-dynasty.png',
    'tulip-escape.png',
    'tulip-jumbo-pink.png',
    'tulip-lobke.png',
    'tulip-mixed-bunch.png',
    'tulip-pink-ardour.png',
    'tulip-pulitzer.png',
    'tulip-rem.png',
    'tulip-ronaldo.png',
    'tulip-royal-virgin.png',
    'tulip-strong-gold.png',
    'tulip-white-dream.png',
    'ustoma-double-arosa.png',
    'veronica-blue.png',
    'veronica-pink.png',
    'waxflower-blondie.png',
    'waxflower-jupiter-gram.png',
    'waxflower-jupiter-purple.png',
    'waxflower-jupiter-white.png',
  ]

  const map: Record<string, string> = {}
  for (const file of files) {
    const key = normalizeFlowerKey(file.replace(/\.(png|jpg)$/i, ''))
    map[key] = `${SUPABASE_FLOWERS_BASE}/${encodeURIComponent(file)}`
  }
  return map
}

export const FLOWER_IMAGE_MAP: Record<string, string> = buildFlowerImageMap()

const MANUAL_OVERRIDES: Record<string, string> = {
  'achillea white': `${SUPABASE_FLOWERS_BASE}/${encodeURIComponent('achilia-whiteachilia-white.png')}`,
  'achillea painted': `${SUPABASE_FLOWERS_BASE}/${encodeURIComponent('achilia-painted-red.png')}`,
  'achillea yellow': `${SUPABASE_FLOWERS_BASE}/${encodeURIComponent('achilia-yellow.png')}`,
  'campanula purple': `${SUPABASE_FLOWERS_BASE}/${encodeURIComponent('campanulla-purple.png')}`,
  'campanula white': `${SUPABASE_FLOWERS_BASE}/${encodeURIComponent('campanulla-white.png')}`,
  'roses mandala': `${SUPABASE_FLOWERS_BASE}/${encodeURIComponent('roses-mandala.png')}`,
  'chrysanthemum lamira': `${SUPABASE_FLOWERS_BASE}/${encodeURIComponent('chrysanthemum-lamira.png')}`,
  'hydrangea bianca': `${SUPABASE_FLOWERS_BASE}/${encodeURIComponent('hydrangea-bianca.png')}`,
  'tulip lobke': `${SUPABASE_FLOWERS_BASE}/${encodeURIComponent('tulip-lobke.png')}`,
  'spray garden roses bombastic': `${SUPABASE_FLOWERS_BASE}/${encodeURIComponent('spray-garden-roses-bombastic.png')}`,
  'lilium oriental frontera': `${SUPABASE_FLOWERS_BASE}/${encodeURIComponent('lilium-oriental-frontera.png')}`
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
