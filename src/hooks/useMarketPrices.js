import { useEffect, useState } from 'react'
import { offCategoryFor, unitFor } from '../lib/catalog'
import { OFF_BRAND_ALIASES } from '../data/offCategoryMap'
import { getMarketPrice } from '../services/openFoodPrices'

const CONCURRENCY = 3

async function runQueue(tasks, limit) {
  let i = 0
  async function worker() {
    while (i < tasks.length) {
      const idx = i++
      await tasks[idx]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
}

// Estimation de prix réels (médiane Open Food Facts Prices) pour les articles de la liste
// qui ont un mapping OFF_CATEGORY_MAP, à l'enseigne/ville de la liste active.
// Retourne { [nomArticle]: {price, count, reliability} }, ne fait aucun appel réseau si hors-ligne
// ou si l'enseigne/ville n'est pas définie, et laisse silencieusement de côté les articles non mappés.
// Chaque article met à jour marketPrices dès que sa propre recherche aboutit (pas d'attente du panier
// entier) : un tag lent ou à fort volume ne doit pas garder tous les autres articles en gris.
export function useMarketPrices({ items, storeName, city }) {
  const [marketPrices, setMarketPrices] = useState({})
  const [loading, setLoading] = useState(false)

  const names = items.map(a => a.name)
  const namesKey = [...new Set(names)].sort().join('|')

  useEffect(() => {
    if (!storeName || !city || typeof navigator !== 'undefined' && navigator.onLine === false) {
      setMarketPrices({})
      return
    }
    const brandAliases = OFF_BRAND_ALIASES[storeName]
    if (!brandAliases) { setMarketPrices({}); return }

    const uniqueNames = [...new Set(names)].filter(n => offCategoryFor(n))
    if (!uniqueNames.length) { setMarketPrices({}); return }

    let cancelled = false
    setMarketPrices({})
    setLoading(true)
    const tasks = uniqueNames.map(name => async () => {
      try {
        const result = await getMarketPrice({ categoryTag: offCategoryFor(name), unit: unitFor(name), brandAliases, city })
        if (!cancelled) setMarketPrices(prev => ({ ...prev, [name]: result }))
      } catch {
        // laisse l'article en gris (aucune entrée) plutôt que de bloquer les autres
      }
    })

    runQueue(tasks, CONCURRENCY).then(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeName, city, namesKey])

  return { marketPrices, loading }
}
