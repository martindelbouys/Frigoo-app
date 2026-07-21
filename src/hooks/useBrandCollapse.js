import { useRef, useCallback, useLayoutEffect } from 'react'

// Replie le header "frigoo" au scroll de la liste.
// - Mesure la vraie hauteur du header (scrollHeight) et l'expose en variable
//   CSS --brand-h, utilisée comme valeur "ouverte" de max-height à la place
//   d'un chiffre fixe déconnecté du contenu réel — la transition CSS colle
//   ainsi au mouvement visible au lieu d'avoir un temps mort puis un claquement.
// - Le seuil de repli/déploiement est calculé en proportion de cette hauteur
//   mesurée (pas une valeur fixe en dur), avec une hystérésis entre le seuil
//   de repli et celui de ré-ouverture pour éviter le flapping près du seuil.
// - `resyncDeps` permet de re-mesurer et de revalider l'état contre le
//   scrollTop courant quand le contenu de la liste change (ex: suppression
//   d'articles), pour éviter qu'il reste bloqué si le navigateur a ajusté
//   le scrollTop sans déclencher d'événement `scroll`.
export function useBrandCollapse(resyncDeps = []) {
  const brandRef    = useRef(null)
  const scrollRef   = useRef(null)
  const scrollRaf    = useRef(null)
  const collapsedRef = useRef(false)

  const measure = useCallback(() => {
    const el = brandRef.current
    if (!el) return
    el.style.setProperty('--brand-h', el.scrollHeight + 'px')
  }, [])

  const applyCollapsed = useCallback((next) => {
    const el = brandRef.current
    if (!el || collapsedRef.current === next) return
    collapsedRef.current = next
    el.classList.toggle('brand-collapsed', next)
  }, [])

  const evaluate = useCallback((scrollTop) => {
    const el = brandRef.current
    if (!el) return
    const h = el.scrollHeight || 220
    const collapseAt = h * 0.3  // repli une fois ~30% de la hauteur du header scrollée
    const expandAt   = h * 0.08 // ré-ouverture seulement en dessous de ~8% (hystérésis)
    if (!collapsedRef.current && scrollTop > collapseAt) applyCollapsed(true)
    else if (collapsedRef.current && scrollTop < expandAt) applyCollapsed(false)
  }, [applyCollapsed])

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
