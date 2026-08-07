import { useRef, useCallback, useLayoutEffect } from 'react'

// Replie (fondu + réduction) la mascotte d'un onglet (Recettes/Dépenses/
// Réglages) au scroll — le titre de l'onglet est un élément séparé, jamais
// affecté. La mascotte est positionnée en absolute dans un conteneur 0×0
// (ne prend jamais de place dans la mise en page), donc pas besoin de
// mesurer/replier une hauteur de boîte : juste suivre le scroll en continu
// via --collapse (0 → 1) sur une distance raisonnable (hauteur naturelle de
// la mascotte).
export function useTabHeaderCollapse() {
  const headerRef = useRef(null)
  const scrollRaf  = useRef(null)
  const RANGE = 96 // hauteur des mascottes (cf. screens/*.jsx)

  const evaluate = useCallback((scrollTop) => {
    const el = headerRef.current
    if (!el) return
    const progress = Math.min(1, Math.max(0, scrollTop / RANGE))
    el.style.setProperty('--collapse', progress)
  }, [])

  const onScroll = useCallback((e) => {
    const t = e.target.scrollTop
    if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current)
    scrollRaf.current = requestAnimationFrame(() => evaluate(t))
  }, [evaluate])

  useLayoutEffect(() => { evaluate(0) }, [evaluate])

  return { headerRef, onScroll }
}
