import { useRef, useCallback, useLayoutEffect } from 'react'

// Replie le header d'un onglet (Recettes/Dépenses/Réglages) au scroll du
// contenu. Même logique que useBrandCollapse (repli continu suivant le doigt
// via --collapse, sans transition CSS ni seuil), avec sa propre classe/
// variable CSS pour ne pas interférer avec le header "frigoo" de l'écran Liste.
export function useTabHeaderCollapse() {
  const headerRef = useRef(null)
  const scrollRaf  = useRef(null)
  const heightRef  = useRef(90)

  const measure = useCallback(() => {
    const el = headerRef.current
    if (!el) return
    const prevMaxHeight = el.style.maxHeight
    el.style.maxHeight = 'none'
    heightRef.current = el.scrollHeight || 90
    el.style.maxHeight = prevMaxHeight
    el.style.setProperty('--tab-h', heightRef.current + 'px')
  }, [])

  const evaluate = useCallback((scrollTop) => {
    const el = headerRef.current
    if (!el) return
    const collapseRange = heightRef.current * 0.3
    const progress = collapseRange > 0 ? Math.min(1, Math.max(0, scrollTop / collapseRange)) : 0
    el.style.setProperty('--collapse', progress)
  }, [])

  const onScroll = useCallback((e) => {
    const t = e.target.scrollTop
    if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current)
    scrollRaf.current = requestAnimationFrame(() => evaluate(t))
  }, [evaluate])

  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  return { headerRef, onScroll }
}
