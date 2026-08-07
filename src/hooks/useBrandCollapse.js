import { useRef, useCallback, useLayoutEffect } from 'react'

// Replie le logo "frigoo" (élément décoratif, pas le sélecteur de liste) au
// scroll de la liste — même principe que le carrousel de la référence fournie
// par l'utilisateur : le titre/contrôle utile reste fixe, seul le visuel
// décoratif au-dessus se réduit progressivement.
// - Suit le doigt en continu via --collapse (0 → 1), recalculé à chaque frame
//   de scroll (rAF), appliqué SANS transition CSS pour ne pas décaler le
//   rendu par rapport au geste.
// - Repli complet une fois la hauteur du logo scrollée (1px scrollé = 1px de
//   repli), pour une distance de transition perceptible plutôt qu'un
//   claquement compressé dans un seuil trop court.
// - `resyncDeps` permet de re-mesurer/revalider quand le contenu change (ex:
//   suppression d'articles), pour ne pas rester bloqué si le navigateur a
//   ajusté le scrollTop sans déclencher d'événement `scroll`.
export function useBrandCollapse(resyncDeps = []) {
  const brandRef  = useRef(null)
  const scrollRef = useRef(null)
  const scrollRaf = useRef(null)
  const heightRef = useRef(120)

  const measure = useCallback(() => {
    const el = brandRef.current
    if (!el) return
    const prevMaxHeight = el.style.maxHeight
    el.style.maxHeight = 'none'
    heightRef.current = el.scrollHeight || 120
    el.style.maxHeight = prevMaxHeight
    el.style.setProperty('--brand-h', heightRef.current + 'px')
  }, [])

  const evaluate = useCallback((scrollTop) => {
    const el = brandRef.current
    if (!el) return
    const collapseRange = heightRef.current
    const progress = collapseRange > 0 ? Math.min(1, Math.max(0, scrollTop / collapseRange)) : 0
    el.style.setProperty('--collapse', progress)
  }, [])

  const onListScroll = useCallback((e) => {
    const t = e.target.scrollTop
    if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current)
    scrollRaf.current = requestAnimationFrame(() => evaluate(t))
  }, [evaluate])

  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  useLayoutEffect(() => {
    measure()
    evaluate(scrollRef.current?.scrollTop ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resyncDeps)

  return { brandRef, scrollRef, onListScroll }
}
