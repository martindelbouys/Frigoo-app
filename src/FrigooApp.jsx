import { useState, useRef, useCallback, useEffect } from 'react'
import {
  doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  collection, query, where, onSnapshot, orderBy,
  writeBatch, serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { CATS, CATALOG, EMOJI_MAP, STORES, INITIAL_RECIPES } from './data'
import ListeScreen from './screens/ListeScreen'
import CuisineScreen from './screens/CuisineScreen'
import DepensesScreen from './screens/DepensesScreen'
import ParametresScreen from './screens/ParametresScreen'
import PanierOverlay from './overlays/PanierOverlay'
import FrigoOverlay from './overlays/FrigoOverlay'
import RecipeOverlay from './overlays/RecipeOverlay'
import AddSheetOverlay from './overlays/AddSheetOverlay'
import ListsManagerOverlay from './overlays/ListsManagerOverlay'
import StorePickerOverlay from './overlays/StorePickerOverlay'
import NewRecipeOverlay from './overlays/NewRecipeOverlay'
import ClearConfirmOverlay from './overlays/ClearConfirmOverlay'

// ── static helpers ────────────────────────────────────────────────────────────
export function catById(id) { return CATS.find(c => c.id === id) || CATS[11] }
export function fmt(n) { return n.toFixed(2).replace('.', ',') + ' €' }
export function tileStyle(size, fs, color) {
  return { width:size, height:size, flexShrink:0, borderRadius:Math.round(size*0.29), display:'flex', alignItems:'center', justifyContent:'center', fontSize:fs, background:color }
}
export function emojiOf(name) {
  if (EMOJI_MAP[name]) return EMOJI_MAP[name]
  const c = catalogCat(name)
  return c ? catById(c).emoji : '🛒'
}
export function catalogCat(name) {
  for (const id in CATALOG) {
    if (CATALOG[id].some(e => e[0].toLowerCase() === name.toLowerCase())) return id
  }
  return null
}
export function priceOf(name) {
  for (const id in CATALOG) {
    const f = CATALOG[id].find(e => e[0].toLowerCase() === name.toLowerCase())
    if (f) return f[1]
  }
  return 1.50
}
function accColor(id) {
  const seed = typeof id === 'string' ? id.charCodeAt(0)*17+id.length*31 : id
  const pal = [{bg:'#E7F7EC',fg:'#1F9D55'},{bg:'#FFF4DA',fg:'#B8860B'},{bg:'#FCEBEA',fg:'#D64535'}]
  return pal[Math.abs((seed*2654435761)>>>0) % 3]
}

// ── component ─────────────────────────────────────────────────────────────────
export default function FrigooApp({ uid, userEmail, onSignOut }) {
  // ── UI state ────────────────────────────────────────────────────────────────
  const [tab, setTab]           = useState('liste')
  const [overlay, setOverlay]   = useState(null)
  const [sheetCat, setSheetCat] = useState('fl')
  const [sheetText, setSheetText] = useState('')
  const [recipeId, setRecipeId] = useState(null)
  const [recipeAsk, setRecipeAsk] = useState(null)
  const [pendingRecipeId, setPendingRecipeId] = useState(null)
  const [mgrStore, setMgrStore] = useState('Carrefour')
  const [mgrCity, setMgrCity]   = useState('')
  const [mgrCode, setMgrCode]   = useState('')
  const [mgrName, setMgrName]   = useState('')
  const [nrName, setNrName]     = useState('')
  const [nrIng, setNrIng]       = useState([])
  const [nrText, setNrText]     = useState('')
  const [expReason, setExpReason] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [storeCity, setStoreCity] = useState(undefined)
  const [toast, setToast]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  // ── Firebase-synced state ───────────────────────────────────────────────────
  const [budget, setBudget]             = useState(250)
  const [showPricesLocal, setShowPricesLocal] = useState(true)
  const [activeListId, setActiveListId] = useState(null)
  const [lists, setLists]               = useState([])
  const [articles, setArticles]         = useState([])
  const [recipes, setRecipes]           = useState([])
  const [expenses, setExpenses]         = useState([])

  const toastRef  = useRef(null)
  const brandRef  = useRef(null)
  const bandMax   = useRef(0)
  const swRef     = useRef(null)
  const listIdsRef = useRef([]) // track active list subscriptions

  // ── Refs for Firestore paths ────────────────────────────────────────────────
  const userRef     = () => doc(db, 'users', uid)
  const recipesRef  = () => collection(db, 'users', uid, 'recipes')
  const expensesRef = () => collection(db, 'users', uid, 'expenses')
  const itemsRef    = (listId) => collection(db, 'lists', listId, 'items')

  // ── Bootstrap: ensure user doc + default list ──────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function boot() {
      const uSnap = await getDoc(userRef())
      let data = uSnap.exists() ? uSnap.data() : null

      if (!data) {
        // New user → create user doc
        await setDoc(userRef(), { budget:250, showPrices:true, activeListId:null, createdAt:serverTimestamp() })
        data = { budget:250, showPrices:true, activeListId:null }
      }

      // Check if user has any list
      const q = query(collection(db, 'lists'), where('members', 'array-contains', uid))
      const { docs } = await getDocs(q)

      if (docs.length === 0) {
        // Create default list with seed items
        const listRef = await addDoc(collection(db, 'lists'), {
          name:'Ma liste', emoji:'🙂', members:[uid], store:'Carrefour', city:'', createdAt:serverTimestamp(),
        })
        const lid = listRef.id
        const batch = writeBatch(db)
        const seeds = [
          { name:'Pâtes', cat:'fec', price:0.95, qty:2, place:'liste', checked:false },
          { name:'Bananes', cat:'fl', price:1.20, qty:1, place:'liste', checked:false },
          { name:'Lait', cat:'lait', price:0.89, qty:2, place:'liste', checked:false },
        ]
        seeds.forEach(s => batch.set(doc(itemsRef(lid)), { ...s, createdAt:serverTimestamp() }))
        await batch.commit()
        await updateDoc(userRef(), { activeListId:lid })
      } else if (!data.activeListId) {
        await updateDoc(userRef(), { activeListId:docs[0].id })
      }

      // Seed default recipes if none
      const { docs: rDocs } = await getDocs(collection(db, 'users', uid, 'recipes'))
      if (rDocs.length === 0) {
        const batch = writeBatch(db)
        INITIAL_RECIPES.forEach(r => batch.set(doc(recipesRef()), { emoji:r.emoji, name:r.name, ing:r.ing, createdAt:serverTimestamp() }))
        await batch.commit()
      }

      if (!cancelled) setLoading(false)
    }
    boot().catch(e => { console.error('boot error:', e); if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [uid])

  // ── Real-time listeners ────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return

    const unsubs = []

    // User profile
    unsubs.push(onSnapshot(userRef(), snap => {
      if (!snap.exists()) return
      const d = snap.data()
      if (d.budget !== undefined) setBudget(d.budget)
      if (d.showPrices !== undefined) setShowPricesLocal(d.showPrices)
      if (d.activeListId) setActiveListId(d.activeListId)
    }))

    // Lists
    const listsQ = query(collection(db, 'lists'), where('members', 'array-contains', uid))
    unsubs.push(onSnapshot(listsQ, snap => {
      setLists(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    }))

    // Recipes
    unsubs.push(onSnapshot(query(recipesRef(), orderBy('createdAt', 'asc')), snap => {
      setRecipes(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    }))

    // Expenses
    unsubs.push(onSnapshot(query(expensesRef(), orderBy('createdAt', 'desc')), snap => {
      setExpenses(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    }))

    return () => unsubs.forEach(u => u())
  }, [uid, loading])

  // ── Items listeners (one per list) ─────────────────────────────────────────
  useEffect(() => {
    if (lists.length === 0) return
    const currentIds = lists.map(l => l.id).sort().join(',')
    if (currentIds === listIdsRef.current.join(',')) return
    listIdsRef.current = lists.map(l => l.id).sort()

    const unsubs = lists.map(list =>
      onSnapshot(itemsRef(list.id), snap => {
        const items = snap.docs.map(d => ({ id:d.id, ...d.data(), listId:list.id }))
        setArticles(prev => [...prev.filter(a => a.listId !== list.id), ...items])
      })
    )
    return () => unsubs.forEach(u => u())
  }, [lists.map(l => l.id).sort().join(',')])

  // ── Toast ──────────────────────────────────────────────────────────────────
  const flash = useCallback((msg) => {
    setToast(msg)
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(null), 2300)
  }, [])

  // ── Computed ───────────────────────────────────────────────────────────────
  const storeFactor = (lid = activeListId) => {
    const l = lists.find(l => l.id === lid)
    const s = STORES.find(s => s.name === (l && l.store))
    return s ? s.factor : 1
  }

  const active   = lists.find(l => l.id === activeListId) || { name:'Ma liste', emoji:'🙂', members:[uid], store:'Carrefour', city:'' }
  const mine     = articles.filter(a => a.listId === activeListId)
  const inList   = mine.filter(a => a.place === 'liste')
  const inFridge = mine.filter(a => a.place === 'frigo')
  const factor   = storeFactor()

  // ── Article actions ────────────────────────────────────────────────────────
  const addToList = async (name, cat, price) => {
    const lid = activeListId
    const ex = articles.find(a => a.listId === lid && a.name.toLowerCase() === name.toLowerCase())
    if (ex) {
      await updateDoc(doc(db, 'lists', lid, 'items', ex.id), { qty: ex.qty + 1, place:'liste' })
      flash(name+' déjà là — quantité +1')
    } else {
      await addDoc(itemsRef(lid), { name, cat, price:price!=null?price:priceOf(name), qty:1, place:'liste', checked:false, createdAt:serverTimestamp() })
      flash(name+' ajouté ✓')
    }
  }

  const setQty = async (id, listId, d) => {
    const item = articles.find(a => a.id === id)
    if (!item) return
    const q = item.qty + d
    if (q <= 0) await deleteDoc(doc(db, 'lists', listId, 'items', id))
    else await updateDoc(doc(db, 'lists', listId, 'items', id), { qty:q })
  }

  const remove = async (id, listId) => {
    await deleteDoc(doc(db, 'lists', listId, 'items', id))
  }

  const gotIt = async (id, listId) => {
    const item = articles.find(a => a.id === id)
    await updateDoc(doc(db, 'lists', listId, 'items', id), { place:'frigo', checked:false })
    flash('🐧 '+(item?.name||'')+' → direction le frigo')
  }

  const rebuy = async (id, listId) => {
    await updateDoc(doc(db, 'lists', listId, 'items', id), { place:'liste' })
    flash('Remis dans la liste ✓')
  }

  const toggleCheck = async (id, listId) => {
    const item = articles.find(a => a.id === id)
    if (!item) return
    await updateDoc(doc(db, 'lists', listId, 'items', id), { checked:!item.checked })
  }

  const doClear = async () => {
    const lid = activeListId
    const batch = writeBatch(db)
    inList.forEach(a => batch.delete(doc(db, 'lists', lid, 'items', a.id)))
    await batch.commit()
    setOverlay(null)
    flash('Liste vidée 🧹 (frigo conservé)')
  }

  // ── Recipe actions ─────────────────────────────────────────────────────────
  const deleteRecipe = async (id) => {
    const r = recipes.find(x => x.id === id)
    await deleteDoc(doc(db, 'users', uid, 'recipes', id))
    setOverlay(null); setRecipeId(null)
    flash('Recette « '+(r?.name||'')+' » supprimée 🗑️')
  }

  const askAddRecipe = (id) => { setRecipeAsk('confirm'); setPendingRecipeId(id) }
  const cancelAsk = () => { setRecipeAsk(null); setPendingRecipeId(null) }

  const commitRecipe = async (includeDup) => {
    const r = recipes.find(x => x.id === pendingRecipeId)
    if (!r) { setRecipeAsk(null); return }
    const lid = activeListId
    const listActive = lists.find(l => l.id === lid)
    const batch = writeBatch(db)
    let added = 0
    r.ing.forEach(([name, cat]) => {
      const ex = articles.find(a => a.listId === lid && a.name.toLowerCase() === name.toLowerCase())
      if (ex) {
        if (includeDup) { batch.update(doc(db, 'lists', lid, 'items', ex.id), { qty:ex.qty+1, place:'liste' }); added++ }
      } else {
        batch.set(doc(itemsRef(lid)), { name, cat, price:priceOf(name), qty:1, place:'liste', checked:false, createdAt:serverTimestamp() }); added++
      }
    })
    await batch.commit()
    setRecipeAsk(null); setPendingRecipeId(null); setRecipeId(null); setOverlay(null); setTab('liste')
    if (added === 0) flash('Tout est déjà dans « '+(listActive?.name||'')+' »')
    else flash(added+' ingrédient'+(added>1?'s':'')+' ajouté'+(added>1?'s':'')+' à « '+(listActive?.name||'')+' »')
  }

  const confirmAddStep1 = () => {
    const r = recipes.find(x => x.id === pendingRecipeId)
    if (!r) { setRecipeAsk(null); return }
    const hasDup = r.ing.some(([name]) => inList.some(a => a.name.toLowerCase() === name.toLowerCase()))
    if (hasDup) setRecipeAsk('dup')
    else commitRecipe(true)
  }

  // ── List actions ───────────────────────────────────────────────────────────
  const leaveList = async (id) => {
    if (lists.length <= 1) { flash('Tu dois garder au moins une liste'); return }
    const lst = lists.find(l => l.id === id)
    const l = lists.find(l => l.id === id)
    const newMembers = (l?.members || []).filter(m => m !== uid)
    if (newMembers.length === 0) {
      // Delete the list entirely
      const items = articles.filter(a => a.listId === id)
      const batch = writeBatch(db)
      items.forEach(a => batch.delete(doc(db, 'lists', id, 'items', a.id)))
      batch.delete(doc(db, 'lists', id))
      await batch.commit()
    } else {
      await updateDoc(doc(db, 'lists', id), { members:newMembers })
    }
    if (activeListId === id) {
      const nextList = lists.find(l => l.id !== id)
      if (nextList) await updateDoc(userRef(), { activeListId:nextList.id })
    }
    flash('Tu as quitté « '+(lst?.name||'')+' »')
  }

  const createNamedList = async () => {
    const n = mgrName.trim()
    if (!n) { flash('Donne un nom à ta liste'); return }
    const ref = await addDoc(collection(db, 'lists'), {
      name:n, emoji:'📝', members:[uid], store:mgrStore||'Carrefour', city:(mgrCity||'').trim(), createdAt:serverTimestamp(),
    })
    await updateDoc(userRef(), { activeListId:ref.id })
    setMgrName(''); setMgrCity('')
    flash('Liste « '+n+' » créée ✓')
  }

  const joinByCode = () => {
    flash('🐧 Rejoindre par code — bientôt disponible')
  }

  const switchList = async (id) => {
    await updateDoc(userRef(), { activeListId:id })
    flash('Liste active : '+(lists.find(l=>l.id===id)?.name||''))
  }

  // ── Swipe gesture ──────────────────────────────────────────────────────────
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
  }, [flash])

  const onDocUp = useCallback((e) => {
    document.removeEventListener('mousemove', onDocMove)
    document.removeEventListener('mouseup', onDocUp)
    const sw = swRef.current
    commitSwipe(sw ? e.clientX - sw.startX : 0)
  }, [onDocMove, commitSwipe])

  const startSwipe = (id, listId, e) => {
    if (e.target?.closest('button')) return
    const el = e.currentTarget
    const t = e.touches ? e.touches[0] : e
    swRef.current = { id, listId, startX:t.clientX, startY:t.clientY, el, dir:null }
    el.style.transition = 'none'
    if (!e.touches) { document.addEventListener('mousemove', onDocMove); document.addEventListener('mouseup', onDocUp) }
  }

  const moveTouchSwipe = (e) => {
    const sw = swRef.current; if (!sw) return
    const t = e.touches[0]; const dx = t.clientX - sw.startX; const dy = t.clientY - sw.startY
    if (!sw.dir) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        sw.dir = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v'
        if (sw.dir === 'v') { sw.el.style.transform='translateX(0)'; showBg(sw.el, 0); swRef.current=null }
      }
      return
    }
    if (sw.dir === 'h') { sw.el.style.transform=`translateX(${Math.max(-130, Math.min(130, dx))}px)`; showBg(sw.el, dx) }
  }

  const endTouchSwipe = (e) => {
    const sw = swRef.current; if (!sw) return
    commitSwipe(e.changedTouches[0].clientX - sw.startX)
  }

  // ── Brand scroll ───────────────────────────────────────────────────────────
  const onListScroll = (e) => {
    const el = brandRef.current; if (!el) return
    if (!bandMax.current) bandMax.current = el.offsetHeight
    const max = bandMax.current || 130; const minH = 46; const fadeDist = 190
    const t = e.target.scrollTop; const p = Math.max(0, Math.min(1, t / fadeDist))
    el.style.height = (max - (max - minH) * p) + 'px'
    const g = Math.round(244 + 11 * p); const b2 = Math.round(241 + 14 * p)
    el.style.background = 'rgb(255,'+g+','+b2+')'
    const inner = el.firstElementChild
    if (inner) inner.style.opacity = String(Math.max(0, 1 - p * 1.35))
  }

  // ── Item decoration ────────────────────────────────────────────────────────
  const decoItem = (a) => ({
    id:a.id, name:a.name, emoji:emojiOf(a.name), qty:a.qty, checked:!!a.checked,
    tileStyle:tileStyle(34, 19, catById(a.cat).color),
    hasPrice:showPricesLocal,
    priceLabel:showPricesLocal ? (fmt(a.price*factor)+(a.qty>1?' / u':'')) : '',
    priceBadgeStyle:{ display:'inline-block', padding:'2px 8px', borderRadius:8, fontSize:11.5, fontWeight:800, lineHeight:1.35, background:accColor(a.id).bg, color:accColor(a.id).fg },
    qtyLabel:a.qty>1?('×'+a.qty):'',
    nameStyle:{ flex:1, fontSize:15, fontWeight:700, textDecoration:a.checked?'line-through':'none', color:a.checked?'#B7B7B7':'#15110F' },
    checkStyle:{ width:27, height:27, flexShrink:0, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:a.checked?'#E8472A':'#fff', border:a.checked?'2px solid #E8472A':'2px solid #DBDBDB' },
    onInc:()=>setQty(a.id, a.listId, 1),
    onDec:()=>setQty(a.id, a.listId, -1),
    onToggle:()=>toggleCheck(a.id, a.listId),
    onRebuy:()=>rebuy(a.id, a.listId),
    onSwipeStart:(e)=>startSwipe(a.id, a.listId, e),
    onTouchMove:moveTouchSwipe,
    onTouchEnd:endTouchSwipe,
  })

  const groupBy = (arr) => {
    const m = {}
    arr.forEach(a => { (m[a.cat] = m[a.cat] || []).push(a) })
    return CATS.filter(c => m[c.id]).map(c => ({ key:c.id, emoji:c.emoji, name:c.name, items:m[c.id].map(decoItem) }))
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  const q = search.trim().toLowerCase(); const searching = q.length > 0
  let searchResults = []
  if (searching) {
    const seen = new Set()
    for (const id in CATALOG) {
      for (const [name, price] of CATALOG[id]) {
        if (name.toLowerCase().includes(q) && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase())
          searchResults.push({ name, emoji:emojiOf(name), priceLabel:showPricesLocal?fmt(price*factor):'', tileStyle:tileStyle(38,20,catById(id).color), onAdd:()=>addToList(name,id,price) })
        }
      }
    }
    searchResults = searchResults.slice(0, 14)
  }

  const categories = CATS.map(c => ({ emoji:c.emoji, shortName:c.short, tileStyle:tileStyle(26,15,c.color), onOpen:()=>{ setSheetCat(c.id); setSheetText(''); setOverlay('addSheet') } }))
  const picked = inList.filter(a => a.checked).length
  const listTotal = inList.reduce((t, a) => t+a.price*a.qty, 0) * factor

  // ── Recipes ────────────────────────────────────────────────────────────────
  const recipesList = recipes.map(r => ({
    emoji:r.emoji, name:r.name, ingLabel:r.ing.length+' ingrédients',
    onOpen:()=>{ setRecipeId(r.id); setOverlay('recipe') },
    onAddAll:()=>askAddRecipe(r.id),
  }))
  const curR = recipes.find(r => r.id === recipeId)
  const pendR = recipes.find(r => r.id === pendingRecipeId)
  const recipeIngredients = curR ? curR.ing.map(([name, cat]) => ({ name, emoji:emojiOf(name), tileStyle:tileStyle(34,18,catById(cat).color), inList:inList.some(a=>a.name.toLowerCase()===name.toLowerCase()) })) : []

  // ── Lists manager ──────────────────────────────────────────────────────────
  const itemsCount = (id) => articles.filter(a => a.listId === id && a.place === 'liste').length
  const myLists = lists.map(l => ({
    emoji:l.emoji, name:l.name,
    membersLabel:(l.members?.length===1?'Toi seul':((l.members?.length||1)+' membres'))+(l.store?('  ·  📍 '+l.store):''),
    itemsLabel:itemsCount(l.id)+' articles',
    active:l.id===activeListId,
    cardStyle:{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px', borderRadius:16, background:'#fff', cursor:'pointer', border:l.id===activeListId?'2px solid #E8472A':'1px solid #F0F0F0', boxShadow:l.id===activeListId?'0 4px 14px rgba(232,71,42,.12)':'none' },
    canLeave:lists.length>1,
    onSelect:()=>switchList(l.id),
    onLeave:()=>leaveList(l.id),
  }))

  // ── Expenses ───────────────────────────────────────────────────────────────
  const spent = expenses.reduce((t, e) => t+e.amount, 0)
  const remaining = budget - spent
  const pct = Math.max(0, Math.min(100, Math.round((spent/budget)*100)))

  const addExpense = async () => {
    const r = expReason.trim(); const a = parseFloat((expAmount||'').replace(',','.'))
    if (!r || !(a > 0)) { flash('Indique un motif et un montant'); return }
    const d = new Date(); const mois = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.']
    await addDoc(expensesRef(), { reason:r, emoji:emojiOf(r)||'🛒', amount:a, dateLabel:d.getDate()+' '+mois[d.getMonth()], createdAt:serverTimestamp() })
    setExpReason(''); setExpAmount('')
    flash('Dépense ajoutée ✓')
  }

  const removeExpense = async (id) => {
    await deleteDoc(doc(db, 'users', uid, 'expenses', id))
  }

  // ── Add sheet ──────────────────────────────────────────────────────────────
  const scat = catById(sheetCat)
  const sheetItems = (CATALOG[sheetCat]||[]).map(([name, price]) => {
    const inIt = inList.some(a => a.name.toLowerCase() === name.toLowerCase())
    return { name, emoji:emojiOf(name), priceLabel:showPricesLocal?fmt(price*factor):'', inList:inIt, notInList:!inIt, nameStyle:{ flex:1, fontSize:15, fontWeight:700, color:inIt?'#A7A7A7':'#15110F' }, onAdd:()=>addToList(name,sheetCat,price) }
  })

  // ── New recipe ─────────────────────────────────────────────────────────────
  const nrIngredients = nrIng.map((ing, idx) => ({ name:ing.name, emoji:emojiOf(ing.name), onRemove:()=>setNrIng(s=>s.filter((_,i)=>i!==idx)) }))

  const saveNewRecipe = async () => {
    const nm = nrName.trim()
    if (!nm || !nrIng.length) { flash('Ajoute un nom et un ingrédient'); return }
    await addDoc(recipesRef(), { emoji:'🍽️', name:nm, ing:nrIng.map(i=>[i.name,i.cat]), createdAt:serverTimestamp() })
    setOverlay(null); setNrName(''); setNrIng([]); setNrText('')
    flash('Recette enregistrée ✓')
  }

  // ── Store picker ───────────────────────────────────────────────────────────
  const activeStoreCity = storeCity !== undefined ? storeCity : (active.city || '')
  const storeOptions = STORES.map(st => ({
    name:st.name, emoji:st.emoji, tag:st.tag, active:st.name===active.store,
    priceLevel:st.factor<0.92?'prix bas':(st.factor>1.1?'prix élevés':'prix moyens'),
    cardStyle:{ display:'flex', alignItems:'center', gap:12, padding:'11px 13px', borderRadius:15, border:st.name===active.store?'2px solid #E8472A':'1px solid #F0F0F0', background:st.name===active.store?'#FFF7F5':'#fff', cursor:'pointer' },
    onPick:async()=>{
      const city=(activeStoreCity||'').trim()
      await updateDoc(doc(db,'lists',activeListId), { store:st.name, city:city||active.city||'' })
      setOverlay(null); flash('Magasin : '+st.name+' — prix mis à jour')
    },
  }))

  // ── Tab styles ─────────────────────────────────────────────────────────────
  const tabStyle = (on) => ({ flex:1, border:'none', background:'transparent', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, color:on?'#E8472A':'#A6A6A6', padding:'6px 0' })

  // ── Budget / prefs mutations ───────────────────────────────────────────────
  const budgetUp   = async () => { const n=budget+10; setBudget(n); await updateDoc(userRef(), { budget:n }) }
  const budgetDown = async () => { const n=Math.max(10,budget-10); setBudget(n); await updateDoc(userRef(), { budget:n }) }
  const togglePrices = async () => { const n=!showPricesLocal; setShowPricesLocal(n); await updateDoc(userRef(), { showPrices:n }) }

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100svh', background:'#F6F6F7', fontFamily:"'Fredoka',sans-serif", fontSize:48, fontWeight:600, color:'#E8472A' }}>
      frigoo
    </div>
  )

  // ── Shared props ───────────────────────────────────────────────────────────
  const p = {
    tab, setTab, overlay, setOverlay, flash, search, setSearch,
    activeListId, activeListName:active.name, activeListEmoji:active.emoji,
    activeMembersLabel:(active.members||[]).join(', '),
    fridgeCount:inFridge.length, cartCount:inList.length,
    searching, notSearching:!searching, searchResults,
    onAddCustom:()=>{ const n=search.trim(); if(n){ addToList(n,'foyer',1.50); setSearch('') } },
    categories, listGroups:groupBy(inList), listEmpty:inList.length===0, listNotEmpty:inList.length>0, listTotalLabel:fmt(listTotal),
    panierGroups:groupBy(inList), panierEmpty:inList.length===0, panierNotEmpty:inList.length>0,
    panierPickedLabel:picked+'/'+inList.length+' pris',
    panierBarPct:inList.length?Math.round(picked/inList.length*100):0,
    fridgeItems:inFridge.map(decoItem), fridgeEmpty:inFridge.length===0, fridgeNotEmpty:inFridge.length>0,
    recipes:recipesList, curR,
    recipeEmoji:curR?.emoji||'', recipeName:curR?.name||'', recipeIngLabel:curR?(curR.ing.length+' ingrédients'):'', recipeIngredients,
    addCurrentRecipe:()=>{ if(curR) askAddRecipe(curR.id) },
    deleteCurrentRecipe:()=>{ if(curR) deleteRecipe(curR.id) },
    showRecipeConfirm:recipeAsk==='confirm', showRecipeDup:recipeAsk==='dup', pendRecipeName:pendR?.name||'',
    confirmAddStep1, addRecipeWithDup:()=>commitRecipe(true), addRecipeNoDup:()=>commitRecipe(false), cancelAsk,
    myLists,
    budget, spent, remaining, pct,
    remainingLabel:fmt(remaining), budgetLabel:fmt(budget), spentLabel:fmt(spent),
    budgetUp, budgetDown,
    expReason, setExpReason, expAmount, setExpAmount, addExpense,
    expensesEmpty:expenses.length===0, expensesNotEmpty:expenses.length>0,
    expenses:expenses.map(x=>({ emoji:x.emoji, reason:x.reason, dateLabel:x.dateLabel, amountLabel:'− '+fmt(x.amount), onRemove:()=>removeExpense(x.id) })),
    sheetEmoji:scat.emoji, sheetCatName:scat.name, sheetTileStyle:tileStyle(42,22,scat.color), sheetItems,
    sheetText, setSheetText,
    onSheetAdd:()=>{ const n=sheetText.trim(); if(n){ addToList(n,sheetCat,priceOf(n)); setSheetText('') } },
    nrName, setNrName, nrText, setNrText,
    nrIngredients, nrHasIng:nrIng.length>0,
    onNrAddIng:()=>{ const n=nrText.trim(); if(n){ setNrIng(s=>[...s,{name:n,cat:(catalogCat(n)||'foyer')}]); setNrText('') } },
    saveNewRecipe,
    activeStoreLabel:(active.store||'Aucun magasin')+(active.city?(' · '+active.city):''),
    storeCity:activeStoreCity, setStoreCity,
    useGeoloc:()=>{ setStoreCity('Villeurbanne'); flash('📍 Position détectée : Villeurbanne') },
    storeOptions, storeNames:STORES.map(s=>s.name), mgrStore, setMgrStore,
    mgrCode, setMgrCode, joinByCode,
    mgrName, setMgrName, mgrCity, setMgrCity, createNamedList,
    brandRef, onListScroll,
    showPrices:showPricesLocal, pricesToggleOn:showPricesLocal, togglePrices,
    comingSoon:()=>flash('Bientôt disponible 🐧'),
    pickPhoto:()=>flash('📷 Photo — bientôt disponible'),
    isFab:false,
    tListe:tabStyle(tab==='liste'), tCuisine:tabStyle(tab==='cuisine'),
    tDepenses:tabStyle(tab==='depenses'), tParams:tabStyle(tab==='params'),
    goListe:()=>{ setTab('liste'); setOverlay(null) },
    goCuisine:()=>{ setTab('cuisine'); setOverlay(null) },
    goDepenses:()=>{ setTab('depenses'); setOverlay(null) },
    goParams:()=>{ setTab('params'); setOverlay(null) },
    openPanier:()=>setOverlay('panier'),
    openFridge:()=>setOverlay('frigo'),
    openListsMgr:()=>{ setOverlay('listsMgr'); setMgrCode(''); setMgrName(''); setMgrStore('Carrefour'); setMgrCity('') },
    openStorePicker:()=>{ setOverlay('storePicker'); setStoreCity(active.city||'') },
    openAddDefault:()=>{ setSheetCat('fl'); setSheetText(''); setOverlay('addSheet') },
    openNewRecipe:()=>{ setOverlay('newRecipe'); setNrName(''); setNrIng([]); setNrText('') },
    closeOverlay:()=>setOverlay(null),
    askClear:()=>setOverlay('clear'),
    confirmClear:()=>doClear(),
    // Paramètres extra
    userEmail, onSignOut,
    toast,
  }

  return (
    <div style={{ maxWidth:430, margin:'0 auto', height:'100svh', display:'flex', flexDirection:'column', overflow:'hidden', background:'#F6F6F7', fontFamily:"'Plus Jakarta Sans', -apple-system, system-ui, sans-serif", WebkitFontSmoothing:'antialiased', color:'#15110F', position:'relative' }}>
      <div style={{ flex:1, minHeight:0, position:'relative' }}>
        {tab==='liste'    && <ListeScreen     {...p} />}
        {tab==='cuisine'  && <CuisineScreen   {...p} />}
        {tab==='depenses' && <DepensesScreen  {...p} />}
        {tab==='params'   && <ParametresScreen {...p} />}

        {overlay==='panier'      && <PanierOverlay        {...p} />}
        {overlay==='frigo'       && <FrigoOverlay         {...p} />}
        {overlay==='recipe'      && <RecipeOverlay        {...p} />}
        {overlay==='addSheet'    && <AddSheetOverlay      {...p} />}
        {overlay==='listsMgr'    && <ListsManagerOverlay  {...p} />}
        {overlay==='storePicker' && <StorePickerOverlay   {...p} />}
        {overlay==='newRecipe'   && <NewRecipeOverlay     {...p} />}
        {overlay==='clear'       && <ClearConfirmOverlay  {...p} />}
      </div>

      {/* Bottom nav — safe-bottom ajoute env(safe-area-inset-bottom) pour le home indicator iPhone */}
      <div className="safe-bottom" style={{ flexShrink:0, display:'flex', background:'#fff', borderTop:'1px solid #EFEFEF', paddingTop:9, paddingLeft:6, paddingRight:6 }}>
        <TabBtn style={p.tListe}    onClick={p.goListe}    icon={<IconListe    active={tab==='liste'} />}    label="Liste" />
        <TabBtn style={p.tCuisine}  onClick={p.goCuisine}  icon={<IconCuisine  active={tab==='cuisine'} />}  label="Recettes" />
        <TabBtn style={p.tDepenses} onClick={p.goDepenses} icon={<IconDepenses active={tab==='depenses'} />} label="Dépenses" />
        <TabBtn style={p.tParams}   onClick={p.goParams}   icon={<IconParams   active={tab==='params'} />}   label="Réglages" />
      </div>

      {toast && (
        <div style={{ position:'absolute', bottom:'calc(80px + env(safe-area-inset-bottom, 0px))', left:'50%', transform:'translateX(-50%)', background:'#15110F', color:'#fff', padding:'10px 18px', borderRadius:14, fontSize:14, fontWeight:700, whiteSpace:'nowrap', zIndex:200, animation:'fgToast .2s ease forwards', pointerEvents:'none' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

function TabBtn({ style, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={style}>
      {icon}
      <span style={{ fontSize:10.5, fontWeight:800 }}>{label}</span>
    </button>
  )
}

function IconListe({ active }) {
  const c = active ? '#E8472A' : '#A6A6A6'
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active?2.5:2.1} strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1.3"/><circle cx="4.5" cy="12" r="1.3"/><circle cx="4.5" cy="18" r="1.3"/></svg>
}
function IconCuisine({ active }) {
  const c = active ? '#E8472A' : '#A6A6A6'
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active?2.5:2.1} strokeLinecap="round" strokeLinejoin="round"><path d="M5 14h14l-1.2 6.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 14z"/><path d="M12 14a5 5 0 0 0 5-5 5 5 0 0 0-10 0 5 5 0 0 0 5 5z"/><line x1="12" y1="2.5" x2="12" y2="4"/></svg>
}
function IconDepenses({ active }) {
  const c = active ? '#E8472A' : '#A6A6A6'
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active?2.5:2.1} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.3" fill={c} stroke="none"/></svg>
}
function IconParams({ active }) {
  const c = active ? '#E8472A' : '#A6A6A6'
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active?2.5:2.1} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L16.2 3H11.8l-.4 2.5a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.5h4.4l.4-2.5a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5A7 7 0 0 0 19 12z"/></svg>
}
