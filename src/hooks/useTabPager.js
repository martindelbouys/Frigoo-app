import { useRef, useCallback, useLayoutEffect } from 'react'

const TABS = ['liste', 'cuisine', 'depenses', 'params']

// Pager scroll-snap horizontal entre les 4 onglets. Synchronise `tab` avec la
// position de scroll dans les deux sens :
// - goToTab (tap sur la bottom nav) scrolle en douceur vers la bonne page
// - onPagerScroll (swipe manuel) déduit l'onglet le plus proche du scroll
//   et met à jour `tab` en conséquence
export function useTabPager(tab, setTab) {
  const pagerRef  = useRef(null)
  const scrollRaf = useRef(null)

  // Le scroll qu'on déclenche nous-mêmes (goToTab, resync) ne doit pas être
  // réinterprété par onPagerScroll comme un swipe utilisateur.
  const programmaticRef = useRef(false)
  const programmaticTimeout = useRef(null)

  const scrollToTab = useCallback((next, smooth) => {
    const el = pagerRef.current
    const idx = TABS.indexOf(next)
    if (!el || idx === -1) return
    programmaticRef.current = true
    if (programmaticTimeout.current) clearTimeout(programmaticTimeout.current)
    programmaticTimeout.current = setTimeout(() => { programmaticRef.current = false }, 450)
    el.scrollTo({ left: idx * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  const goToTab = useCallback((next) => {
    scrollToTab(next, true)
    setTab(next)
  }, [setTab, scrollToTab])

  const onPagerScroll = useCallback((e) => {
    if (programmaticRef.current) return
    const el = e.currentTarget
    if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current)
    scrollRaf.current = requestAnimationFrame(() => {
      const width = el.clientWidth || 1
      const idx = Math.round(el.scrollLeft / width)
      const next = TABS[Math.max(0, Math.min(TABS.length - 1, idx))]
      if (next && next !== tab) setTab(next)
    })
  }, [tab, setTab])

  // Filet de sécurité : si `tab` change sans passer par goToTab (ex: retour
  // automatique sur la liste après ajout d'une recette), on resynchronise le
  // scroll instantanément — sans relancer une animation par-dessus une
  // éventuelle transition déjà en cours.
  useLayoutEffect(() => {
    if (programmaticRef.current) return
    scrollToTab(tab, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  return { pagerRef, onPagerScroll, goToTab }
}
