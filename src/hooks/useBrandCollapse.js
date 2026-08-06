import { useRef, useCallback, useLayoutEffect } from 'react'

// Replie le header "frigoo" au scroll de la liste.
// - Mesure la vraie hauteur "ouverte" du header (hors influence du repli en
//   cours) et l'expose en variable CSS --brand-h.
// - Le repli suit le doigt en continu via --collapse (0 → 1), recalculé à
//   chaque frame de scroll (rAF) et appliqué SANS transition CSS : pas de
//   seuil ni d'animation qui se déclenche après coup, donc pas de décalage
//   entre le geste et ce qui se passe à l'écran. Repli complet atteint
//   exactement quand on a scrollé la hauteur du header (1px scrollé = 1px de
//   repli) — un ratio plus serré (ex: repli complet à 30% de la hauteur)
//   comprime toute la transition dans une distance de scroll minuscule,
//   ce qui la rend imperceptible (elle a l'air de se couper plutôt que de
//   s'estomper).
// - `resyncDeps` permet de re-mesurer et de revalider l'état contre le
//   scrollTop courant quand le contenu de la liste change (ex: suppression
//   d'articles), pour éviter qu'il reste bloqué si le navigateur a ajusté
//   le scrollTop sans déclencher d'événement `scroll`.
export function useBrandCollapse(resyncDeps = []) {
  const brandRef  = useRef(null)
  const scrollRef = useRef(null)
  const scrollRaf = useRef(null)
  const heightRef = useRef(220)

  const measure = useCallback(() => {
    const el = brandRef.current
    if (!el) return
    const prevMaxHeight = el.style.maxHeight
    el.style.maxHeight = 'none' // mesure la hauteur réelle, pas la valeur repliée en cours
    heightRef.current = el.scrollHeight || 220
    el.style.maxHeight = prevMaxHeight
    el.style.setProperty('--brand-h', heightRef.current + 'px')
  }, [])

  const evaluate = useCallback((scrollTop) => {
    const el = brandRef.current
    if (!el) return
    const collapseRange = heightRef.current // repli complet une fois la hauteur du header scrollée
    const progress = collapseRange > 0 ? Math.min(1, Math.max(0, scrollTop / collapseRange)) : 0
    el.style.setProperty('--collapse', progress)
  }, [])

  const onListScroll = useCallback((e) => {
    const t = e.target.scrollTop
    if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current)
    scrollRaf.current = requestAnimationFrame(() => evaluate(t))
  }, [evaluate])

  // Mesure au montage + à chaque resize (rotation, clavier, etc.)
  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  // Re-synchronise quand le contenu de la liste change
  useLayoutEffect(() => {
    measure()
    evaluate(scrollRef.current?.scrollTop ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resyncDeps)

  return { brandRef, scrollRef, onListScroll }
}
