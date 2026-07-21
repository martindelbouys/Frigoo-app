import { CATS, CATALOG, EMOJI_MAP } from '../data'
import { OFF_CATEGORY_MAP, PRODUCT_UNIT_MAP } from '../data/offCategoryMap'

const UNIT_LABELS = { kg: '/kg', L: '/L', piece: '/pièce' }

export function catById(id) { return CATS.find(c => c.id === id) || CATS[11] }

export function catalogCat(name) {
  for (const id in CATALOG) {
    if (CATALOG[id].some(e => e[0].toLowerCase() === name.toLowerCase())) return id
  }
  return null
}

export function emojiOf(name) {
  if (EMOJI_MAP[name]) return EMOJI_MAP[name]
  const c = catalogCat(name)
  return c ? catById(c).emoji : '🛒'
}

export function priceOf(name) {
  for (const id in CATALOG) {
    const f = CATALOG[id].find(e => e[0].toLowerCase() === name.toLowerCase())
    if (f) return f[1]
  }
  return 1.50
}

export function offCategoryFor(name) {
  return OFF_CATEGORY_MAP[name] || null
}

// 'kg' | 'L' | 'piece' — retombe sur 'piece' pour les articles hors catalogue (ajoutés à la main).
export function unitFor(name) {
  return PRODUCT_UNIT_MAP[name] || 'piece'
}

export function unitLabel(name) {
  return UNIT_LABELS[unitFor(name)]
}
