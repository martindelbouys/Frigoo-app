const API_BASE = import.meta.env.VITE_OFF_PRICES_API_BASE || 'https://prices.openfoodfacts.org/api/v1'

const PAGE_SIZE = 100
const MAX_PAGES = 10
const PAGE_TIMEOUT_MS = 5000
const CACHE_TTL_MS = 6 * 60 * 60 * 1000

// Map<`${mode}|${categoryTag}`, { rows, fetchedAt }>
const cache = new Map()

function normalize(str) {
  return (str || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim().replace(/\s+/g, ' ')
}

// Open Food Facts ne connaît que le nom de ville seul ("Lyon", "Marseille") : jamais d'arrondissement
// ni de quartier, même si l'app invite à taper "Ville ou quartier" et que les listes de démo utilisent
// des noms comme "Lyon 7ᵉ". On retire ce bruit avant de comparer, sinon 100% des relevés sont perdus.
function normalizeCity(str) {
  return normalize(str)
    .replace(/ᵉ/g, 'e')
    .replace(/\bcedex\b\s*\d*/g, '')
    .replace(/\barrondissement\b/g, '')
    .replace(/\b(\d{1,2})\s*(er|ere|eme|e)\b/g, '')
    .trim().replace(/\s+/g, ' ')
}

function levenshtein(a, b) {
  const m = a.length, n = b.length
  if (!m) return n
  if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const cur = [i]
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
    }
    prev = cur
  }
  return prev[n]
}

// Tolère une petite faute de frappe dans la ville tapée par l'utilisateur (ex. "Lyion"), sans appel
// réseau supplémentaire : on compare seulement aux villes déjà présentes dans les relevés récupérés.
// Seuil proportionnel à la longueur du nom pour limiter le risque de confondre deux villes différentes.
function cityMatches(typedCity, rowCity) {
  if (!typedCity || !rowCity) return false
  if (typedCity === rowCity) return true
  const maxLen = Math.max(typedCity.length, rowCity.length)
  const threshold = maxLen <= 5 ? 1 : maxLen <= 9 ? 2 : 3
  return levenshtein(typedCity, rowCity) <= threshold
}

function buildUrl(categoryTag, mode, page) {
  const params = new URLSearchParams({ currency: 'EUR', duplicate_of__isnull: 'true', size: String(PAGE_SIZE), page: String(page) })
  if (mode === 'PRODUCT') {
    params.set('type', 'PRODUCT')
    params.set('product__categories_tags__contains', categoryTag)
  } else {
    params.set('category_tag', categoryTag)
  }
  return `${API_BASE}/prices?${params.toString()}`
}

async function fetchPage(categoryTag, mode, page) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS)
  try {
    const res = await fetch(buildUrl(categoryTag, mode, page), { signal: controller.signal })
    if (!res.ok) return { items: [], pages: 0 }
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function fetchTaggedPrices(categoryTag, mode) {
  const cacheKey = `${mode}|${categoryTag}`
  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.fetchedAt < CACHE_TTL_MS) return hit.rows

  const first = await fetchPage(categoryTag, mode, 1)
  let rows = first.items || []
  const pages = Math.min(first.pages || 1, MAX_PAGES)
  // Les pages restantes sont indépendantes : les paralléliser plutôt que les attendre en séquence
  // ramène le pire cas (tags à fort volume, ex. en:cheeses ~7800 relevés) de ~6s à ~2s par produit —
  // ce délai bloquait tout l'affichage du panier avant la mise à jour incrémentale de useMarketPrices.
  if (pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) => fetchPage(categoryTag, mode, i + 2))
    )
    for (const next of rest) rows = rows.concat(next.items || [])
  }

  cache.set(cacheKey, { rows, fetchedAt: Date.now() })
  return rows
}

// Combine deux sources : le vrac (CATEGORY, sans code-barres, prix déjà au kg/L/pièce via `price_per`)
// et les produits emballés (PRODUCT, liés à un code-barres, poids/volume déclaré à normaliser nous-mêmes).
// Le vrac seul est très pauvre en France hors fruits/légumes ; le code-barres couvre l'essentiel du catalogue.
export async function fetchCategoryPrices(categoryTag) {
  const [categoryRows, productRows] = await Promise.all([
    fetchTaggedPrices(categoryTag, 'CATEGORY'),
    fetchTaggedPrices(categoryTag, 'PRODUCT'),
  ])
  return categoryRows.concat(productRows)
}

export function filterByStoreAndCity(rows, brandAliases, city) {
  const normAliases = (brandAliases || []).map(normalize)
  const normCity = normalizeCity(city)
  if (!normAliases.length || !normCity) return []
  return rows.filter(row => {
    const loc = row.location
    if (!loc || !loc.osm_brand || !loc.osm_address_city) return false
    return normAliases.includes(normalize(loc.osm_brand)) && cityMatches(normCity, normalizeCity(loc.osm_address_city))
  })
}

// Ramène un relevé à un prix par kg/L/pièce cohérent avec `unit` (unité choisie par produit dans
// PRODUCT_UNIT_MAP, pas déduite de l'API). Vrac (CATEGORY) : gardé seulement si son `price_per` déclaré
// correspond déjà à l'unité visée. Code-barres (PRODUCT) : le prix est celui du paquet entier — on le
// divise par le poids/volume déclaré (toujours en g ou ml chez OFF) pour "kg"/"L" ; pour "pièce" le prix
// du paquet tel que vendu est directement la bonne unité (OFF n'a pas de champ structuré pour le nombre
// d'unités dans un paquet, donc pas de conversion possible vers l'unité interne comme 1 rouleau).
function normalizedPrice(row, unit) {
  if (row.type === 'PRODUCT') {
    if (unit === 'piece') return row.price
    const product = row.product
    const qty = product && product.product_quantity
    const qtyUnit = product && product.product_quantity_unit
    if (!qty || !qtyUnit) return null
    if (unit === 'kg' && qtyUnit === 'g') return row.price / (qty / 1000)
    if (unit === 'L' && qtyUnit === 'ml') return row.price / (qty / 1000)
    return null
  }
  const per = row.price_per
  if (unit === 'kg' && per === 'KILOGRAM') return row.price
  if (unit === 'L' && per === 'LITER') return row.price
  if (unit === 'piece' && (per === 'UNIT' || !per)) return row.price
  return null
}

export function computeMedianPrice(prices) {
  const sorted = prices.filter(p => typeof p === 'number' && p > 0).sort((a, b) => a - b)
  const count = sorted.length
  if (count === 0) return { median: null, count: 0 }
  const mid = Math.floor(count / 2)
  const median = count % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  return { median, count }
}

export function reliabilityLevel(count) {
  if (count <= 0) return 'red'
  if (count <= 3) return 'yellow'
  return 'green'
}

export async function getMarketPrice({ categoryTag, unit, brandAliases, city }) {
  const rows = await fetchCategoryPrices(categoryTag)
  const matched = filterByStoreAndCity(rows, brandAliases, city)
  const prices = matched.map(row => normalizedPrice(row, unit)).filter(p => p != null)
  const { median, count } = computeMedianPrice(prices)
  return { price: median, count, reliability: reliabilityLevel(count) }
}
