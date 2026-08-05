import { CATS, CATALOG, EMOJI_MAP } from '../data'

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
