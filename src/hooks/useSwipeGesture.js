import { useRef, useCallback } from 'react'

// Geste swipe sur une ligne d'article : droite = supprimer, gauche = envoyer au frigo.
// N'a aucune dépendance Firestore — reçoit les actions à déclencher en fin de geste.
export function useSwipeGesture({ remove, gotIt, flash }) {
  const swRef = useRef(null)

  const showBg = (el, dx) => {
    const p = el.parentElement; if (!p) return
    if (p.children[0]) p.children[0].style.visibility = dx > 3 ? 'visible' : 'hidden'
    if (p.children[1]) p.children[1].style.visibility = dx < -3 ? 'visible' : 'hidden'
  }

  const onDocMove = useCallback((e) => {
    const sw = swRef.current; if (!sw) return
    const dx = e.clientX - sw.startX
    sw.el.style.transform = `translateX(${Math.max(-130, Math.min(130, dx))}px)`
    showBg(sw.el, dx)
  }, [])

  const commitSwipe = useCallback((dx) => {
    const sw = swRef.current; if (!sw) return
    const { id, listId, el } = sw
    swRef.current = null
    const hideBgs = () => showBg(el, 0)
    if (Math.abs(dx) < 8) { el.style.transition='transform 0.22s ease'; el.style.transform='translateX(0)'; hideBgs(); return }
    el.style.transition = 'transform 0.26s cubic-bezier(0.25,1,0.5,1)'
    const collapse = (action) => setTimeout(() => {
      const w = el.parentElement
      if (w) { w.style.height=w.offsetHeight+'px'; void w.offsetHeight; w.style.transition='height 0.18s ease, opacity 0.14s ease'; w.style.height='0'; w.style.opacity='0' }
      setTimeout(action, 190)
    }, 240)
    if (dx > 72) { el.style.transform='translateX(110%)'; flash('Article supprimé 🗑️'); collapse(() => remove(id, listId)) }
    else if (dx < -72) { el.style.transform='translateX(-110%)'; collapse(() => gotIt(id, listId)) }
    else { el.style.transition='transform 0.22s ease'; el.style.transform='translateX(0)'; hideBgs() }
  }, [flash, remove, gotIt])

  const onDocUp = useCallback((e) => {
    document.removeEventListener('mousemove', onDocMove)
    document.removeEventListener('mouseup', onDocUp)
    const sw = swRef.current
    commitSwipe(sw ? e.clientX - sw.startX : 0)
  }, [onDocMove, commitSwipe])

  const startSwipe = useCallback((id, listId, e) => {
    if (e.target?.closest('button')) return
    const el = e.currentTarget
    const t = e.touches ? e.touches[0] : e
    swRef.current = { id, listId, startX:t.clientX, startY:t.clientY, el, dir:null }
    el.style.transition = 'none'
    if (!e.touches) { document.addEventListener('mousemove', onDocMove); document.addEventListener('mouseup', onDocUp) }
  }, [onDocMove, onDocUp])

  const moveTouchSwipe = useCallback((e) => {
    const sw = swRef.current; if (!sw) return
    const t = e.touches[0]; const dx = t.clientX - sw.startX; const dy = t.clientY - sw.startY
    if (!sw.dir) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        sw.dir = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v'
        if (sw.dir === 'v') { sw.el.style.transform='translateX(0)'; showBg(sw.el, 0); swRef.current=null }
      }
      return
    }
    if (sw.dir === 'h') {
      // Empêche un swipe horizontal sur l'article de remonter jusqu'au pager
      // d'onglets (scroll-snap) et d'être interprété comme un changement d'onglet.
      e.stopPropagation()
      sw.el.style.transform=`translateX(${Math.max(-130, Math.min(130, dx))}px)`; showBg(sw.el, dx)
    }
  }, [])

  const endTouchSwipe = useCallback((e) => {
    const sw = swRef.current; if (!sw) return
    commitSwipe(e.changedTouches[0].clientX - sw.startX)
  }, [commitSwipe])

  return { startSwipe, moveTouchSwipe, endTouchSwipe }
}
