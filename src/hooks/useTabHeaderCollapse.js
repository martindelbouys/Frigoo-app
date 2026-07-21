import { useRef, useCallback, useLayoutEffect } from 'react'

// Replie le header d'un onglet (Recettes/Dépenses/Réglages) au scroll du contenu.
// Même logique que useBrandCollapse, avec sa propre classe/variable CSS pour ne
// pas interférer avec le header "frigoo" de l'écran Liste.
export function useTabHeaderCollapse() {
  const headerRef    = useRef(null)
  const scrollRaf     = useRef(null)
  const collapsedRef  = useRef(false)

  const measure = useCallback(() => {
    const el = headerRef.current
    if (!el) return
    el.style.setProperty('--tab-h', el.scrollHeight + 'px')
  }, [])

  const applyCollapsed = useCallback((next) => {
    const el = headerRef.current
    if (!el || collapsedRef.current === next) return
    collapsedRef.current = next
    el.classList.toggle('tab-collapsed', next)
  }, [])

  const evaluate = useCallback((scrollTop) => {
    const el = headerRef.current
    if (!el) return
    const h = el.scrollHeight || 90
    const collapseAt = h * 0.3
    const expandAt   = h * 0.08
    if (!collapsedRef.current && scrollTop > collapseAt) applyCollapsed(true)
    else if (collapsedRef.current && scrollTop < expandAt) applyCollapsed(false)
  }, [applyCollapsed])

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
