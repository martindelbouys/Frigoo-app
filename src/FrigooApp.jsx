import { useState, useRef, useCallback } from 'react'
import {
  doc, addDoc, updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, storage } from './firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { CATS, CATALOG } from './data'
import { fmt, tileStyle } from './lib/format'
import { catById, catalogCat, emojiOf, priceOf } from './lib/catalog'
import { useSwipeGesture } from './hooks/useSwipeGesture'
import { recipesRef } from './firestore/paths'
import { useFrigooData } from './hooks/useFrigooData'
import { useListItems } from './hooks/useListItems'
import { useRecipeActions } from './hooks/useRecipeActions'
import { useListManagement } from './hooks/useListManagement'
import { useExpenses } from './hooks/useExpenses'
import { useBrandCollapse } from './hooks/useBrandCollapse'
import { useTabPager } from './hooks/useTabPager'
import ListeScreen from './screens/ListeScreen'
import CuisineScreen from './screens/CuisineScreen'
import DepensesScreen from './screens/DepensesScreen'
import ParametresScreen from './screens/ParametresScreen'
import PanierOverlay from './overlays/PanierOverlay'
import FrigoOverlay from './overlays/FrigoOverlay'
import RecipeOverlay from './overlays/RecipeOverlay'
import AddSheetOverlay from './overlays/AddSheetOverlay'
import ListsManagerOverlay from './overlays/ListsManagerOverlay'
import NewRecipeOverlay from './overlays/NewRecipeOverlay'
import ClearConfirmOverlay from './overlays/ClearConfirmOverlay'
import EditListOverlay from './overlays/EditListOverlay'
import EditRecipeOverlay from './overlays/EditRecipeOverlay'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'

// ── component ─────────────────────────────────────────────────────────────────
export default function FrigooApp({ uid, userEmail, onSignOut }) {
  // ── UI state ────────────────────────────────────────────────────────────────
  const [tab, setTab]           = useState('liste')
  const [overlay, setOverlay]   = useState(null)
  const [sheetCat, setSheetCat] = useState('fl')
  const [sheetText, setSheetText] = useState('')
  const [listDropOpen, setListDropOpen] = useState(false)
  const [editListId, setEditListId]   = useState(null)
  const [editRecipeId, setEditRecipeId] = useState(null)
  const [nrName, setNrName]     = useState('')
  const [nrIng, setNrIng]       = useState([])
  const [nrText, setNrText]     = useState('')
  const [nrEmoji, setNrEmoji]   = useState('🍽️')
  const [toast, setToast]       = useState(null)
  const [search, setSearch]     = useState('')

  const toastRef  = useRef(null)

  // ── Toast ──────────────────────────────────────────────────────────────────
  const flash = useCallback((msg) => {
    setToast(msg)
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(null), 2300)
  }, [])

  // ── Données Firestore (bootstrap + listeners + mutations du doc user) ──────
  const {
    loading, budget, activeListId, userName, userPhoto,
    lists, articles, recipes, expenses, invitations,
    budgetUp, budgetDown, saveDisplayName, uploadPhoto,
  } = useFrigooData(uid, userEmail, flash)

  // ── Computed ───────────────────────────────────────────────────────────────
  const active   = lists.find(l => l.id === activeListId) || lists[0] || { name:'Ma liste', emoji:'🙂', members:[uid] }
  const mine     = articles.filter(a => a.listId === activeListId)
  const inList   = mine.filter(a => a.place === 'liste')
  const inFridge = mine.filter(a => a.place === 'frigo')

  // ── Article actions ────────────────────────────────────────────────────────
  const { addToList, setQty, remove, gotIt, rebuy, clearFridge, toggleCheck, doClear } = useListItems({
    activeListId, articles, flash, onListCleared:()=>setOverlay(null),
  })

  // ── Recipe actions ─────────────────────────────────────────────────────────
  const {
    recipeId, setRecipeId, recipeAsk, pendingRecipeId,
    deleteRecipe, askAddRecipe, cancelAsk, commitRecipe, confirmAddStep1,
  } = useRecipeActions({ uid, recipes, activeListId, lists, articles, inList, flash, setOverlay, setTab })

  // ── List actions ───────────────────────────────────────────────────────────
  const {
    mgrName, setMgrName, mgrEmoji, setMgrEmoji,
    mgrInviteEmails, setMgrInviteEmails, mgrInviteText, setMgrInviteText,
    leaveList, createNamedList, addInviteToList, removeInviteFromList, addMgrInvite,
    switchList, updateList, uploadListPhoto, acceptInvite, declineInvite,
  } = useListManagement({ uid, userEmail, lists, invitations, articles, activeListId, flash, setOverlay })

  // ── Swipe gesture ──────────────────────────────────────────────────────────
  const { startSwipe, moveTouchSwipe, endTouchSwipe } = useSwipeGesture({ remove, gotIt, flash })

  // ── Brand scroll ───────────────────────────────────────────────────────────
  const { brandRef, scrollRef, onListScroll } = useBrandCollapse([inList.length, activeListId])

  // ── Pager d'onglets (swipe horizontal) ──────────────────────────────────────
  const { pagerRef, onPagerScroll, goToTab } = useTabPager(tab, setTab)

  // ── Item decoration ────────────────────────────────────────────────────────
  const decoItem = (a) => {
    return {
      id:a.id, name:a.name, emoji:emojiOf(a.name), qty:a.qty, checked:!!a.checked,
      tileStyle:tileStyle(34, 19, catById(a.cat).color),
      qtyLabel:a.qty>1?('×'+a.qty):'',
      nameStyle:{ flex:1, fontSize:15, fontWeight:700, textDecoration:a.checked?'line-through':'none', color:a.checked?'#B7B7B7':'#15110F' },
      checkStyle:{ width:27, height:27, flexShrink:0, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:a.checked?'#E8472A':'#fff', border:a.checked?'2px solid #E8472A':'2px solid #DBDBDB' },
      onInc:()=>setQty(a.id, a.listId, 1),
      onDec:()=>setQty(a.id, a.listId, -1),
      onToggle:()=>toggleCheck(a.id, a.listId),
      onRebuy:()=>rebuy(a.id, a.listId),
      onRemove:()=>remove(a.id, a.listId),
      onSwipeStart:(e)=>startSwipe(a.id, a.listId, e),
      onTouchMove:moveTouchSwipe,
      onTouchEnd:endTouchSwipe,
    }
  }

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
          searchResults.push({ name, emoji:emojiOf(name), tileStyle:tileStyle(38,20,catById(id).color), onAdd:()=>addToList(name,id,price) })
        }
      }
    }
    searchResults = searchResults.slice(0, 14)
  }

  const categories = CATS.map(c => ({ emoji:c.emoji, shortName:c.short, tileStyle:tileStyle(26,15,c.color), onOpen:()=>{ setSheetCat(c.id); setSheetText(''); setOverlay('addSheet') } }))
  const picked = inList.filter(a => a.checked).length

  // ── Recipes ────────────────────────────────────────────────────────────────
  const recipesList = recipes.map(r => ({
    emoji:r.emoji, name:r.name, ingLabel:r.ing.length+' ingrédients', photoURL:r.photoURL||null,
    onOpen:()=>{ setRecipeId(r.id); setOverlay('recipe') },
    onAddAll:()=>askAddRecipe(r.id),
  }))
  const curR = recipes.find(r => r.id === recipeId)
  const pendR = recipes.find(r => r.id === pendingRecipeId)
  const recipeIngredients = curR ? curR.ing.map(({name, cat}) => ({ name, emoji:emojiOf(name), tileStyle:tileStyle(34,18,catById(cat||'foyer').color), inList:inList.some(a=>a.name.toLowerCase()===name.toLowerCase()) })) : []

  // ── Lists manager ──────────────────────────────────────────────────────────
  const itemsCount = (id) => articles.filter(a => a.listId === id && a.place === 'liste').length
  const myLists = lists.map(l => ({
    id:l.id, emoji:l.emoji||'📝', name:l.name, photoURL:l.photoURL||null,
    pendingInvites:l.pendingInvites||[],
    subLabel:(l.members?.length===1?'Toi seul':((l.members?.length||1)+' membres'))
      +(' · '+itemsCount(l.id)+' article'+(itemsCount(l.id)!==1?'s':'')),
    active:l.id===activeListId,
    cardStyle:{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px', borderRadius:16, background:'#fff', cursor:'pointer', border:l.id===activeListId?'2px solid #E8472A':'1px solid #F0F0F0', boxShadow:l.id===activeListId?'0 4px 14px rgba(232,71,42,.12)':'none' },
    canLeave:lists.length>1,
    onSelect:()=>switchList(l.id),
    onLeave:()=>leaveList(l.id),
  }))

  // ── Expenses ───────────────────────────────────────────────────────────────
  const {
    expReason, setExpReason, expAmount, setExpAmount,
    filteredExpenses, spent, remaining, pct, isCurrentMonth, expMonthLabel,
    prevMonth, nextMonth, addExpense, removeExpense,
  } = useExpenses({ uid, expenses, budget, flash })

  // ── Add sheet ──────────────────────────────────────────────────────────────
  const scat = catById(sheetCat)
  const sheetItems = (CATALOG[sheetCat]||[]).map(([name, price]) => {
    const inIt = inList.some(a => a.name.toLowerCase() === name.toLowerCase())
    return { name, emoji:emojiOf(name), inList:inIt, notInList:!inIt, nameStyle:{ flex:1, fontSize:15, fontWeight:700, color:inIt?'#A7A7A7':'#15110F' }, onAdd:()=>addToList(name,sheetCat,price) }
  })

  // ── New recipe ─────────────────────────────────────────────────────────────
  const nrIngredients = nrIng.map((ing, idx) => ({ name:ing.name, emoji:emojiOf(ing.name), onRemove:()=>setNrIng(s=>s.filter((_,i)=>i!==idx)) }))
  const nrSuggestions = nrText.trim().length >= 2
    ? Object.entries(CATALOG).flatMap(([cat, items]) =>
        items.filter(([n]) => n.toLowerCase().includes(nrText.trim().toLowerCase())).map(([n]) => ({ name:n, cat, emoji:emojiOf(n) }))
      ).slice(0, 6)
    : []

  const saveNewRecipe = async () => {
    const nm = nrName.trim()
    if (!nm) { flash('Donne un nom à la recette'); return }
    if (!nrIng.length) { flash('Ajoute au moins un ingrédient'); return }
    try {
      await addDoc(recipesRef(uid), { emoji:nrEmoji, name:nm, ing:nrIng.map(i=>({name:i.name,cat:i.cat})), createdAt:serverTimestamp() })
      setOverlay(null); setNrName(''); setNrIng([]); setNrText(''); setNrEmoji('🍽️')
      flash('Recette enregistrée ✓')
    } catch(e) { flash('Erreur : '+e.code); console.error(e) }
  }

  const uploadRecipePhoto = async (recipeId, file) => {
    if (!file) return
    try {
      const sRef = storageRef(storage, `users/${uid}/recipes/${recipeId}/photo`)
      await uploadBytes(sRef, file)
      const url = await getDownloadURL(sRef)
      await updateDoc(doc(db, 'users', uid, 'recipes', recipeId), { photoURL: url })
    } catch(e) { flash('Erreur photo : '+e.code); console.error(e) }
  }

  const updateRecipe = async (id, data) => {
    try {
      await updateDoc(doc(db, 'users', uid, 'recipes', id), data)
      setOverlay(null); flash('Recette modifiée ✓')
    } catch(e) { flash('Erreur : '+e.code); console.error(e) }
  }

  // tabStyle supprimé — la nav utilise la classe CSS .fg-nav

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'#F2F2F2', fontFamily:"'Fredoka',sans-serif", fontSize:48, fontWeight:600, color:'#E8472A' }}>
      frigoo
    </div>
  )

  // ── Shared props ───────────────────────────────────────────────────────────
  const p = {
    tab, setTab, overlay, setOverlay, flash, search, setSearch,
    activeListId, activeListName:active.name, activeListEmoji:active.emoji,
    activeMembersLabel:(active.members||[]).length<=1?'Toi seul':((active.members||[]).length+' membres'),
    fridgeCount:inFridge.length, cartCount:inList.length,
    searching, notSearching:!searching, searchResults,
    onAddCustom:()=>{ const n=search.trim(); if(n){ addToList(n,'foyer',1.50); setSearch('') } },
    categories, listGroups:groupBy(inList), listEmpty:inList.length===0, listNotEmpty:inList.length>0,
    panierGroups:groupBy(inList), panierEmpty:inList.length===0, panierNotEmpty:inList.length>0,
    panierPickedLabel:picked+'/'+inList.length+' pris',
    panierBarPct:inList.length?Math.round(picked/inList.length*100):0,
    fridgeItems:inFridge.map(decoItem), fridgeEmpty:inFridge.length===0, fridgeNotEmpty:inFridge.length>0, clearFridge,
    recipes:recipesList, curR,
    recipeEmoji:curR?.emoji||'', recipeName:curR?.name||'', recipeIngLabel:curR?(curR.ing.length+' ingrédients'):'', recipeIngredients, recipePhotoURL:curR?.photoURL||null,
    addCurrentRecipe:()=>{ if(curR) askAddRecipe(curR.id) },
    deleteCurrentRecipe:()=>{ if(curR) deleteRecipe(curR.id) },
    openEditRecipe:()=>{ if(curR) { setEditRecipeId(curR.id); setNrText(''); setOverlay('editRecipe') } },
    editRecipe: recipes.find(r => r.id === editRecipeId) || null,
    uploadRecipePhoto, updateRecipe,
    showRecipeConfirm:recipeAsk==='confirm', showRecipeDup:recipeAsk==='dup', pendRecipeName:pendR?.name||'',
    confirmAddStep1, addRecipeWithDup:()=>commitRecipe(true), addRecipeNoDup:()=>commitRecipe(false), cancelAsk,
    myLists,
    invitations: invitations.map(i => ({
      id: i.id, name: i.name, emoji: i.emoji || '📝',
      onAccept: () => acceptInvite(i.id), onDecline: () => declineInvite(i.id),
    })),
    budget, spent, remaining, pct,
    remainingLabel:fmt(remaining), budgetLabel:fmt(budget), spentLabel:fmt(spent),
    budgetUp, budgetDown,
    expReason, setExpReason, expAmount, setExpAmount, addExpense,
    expensesEmpty:filteredExpenses.length===0, expensesNotEmpty:filteredExpenses.length>0,
    expenses:filteredExpenses.map(x=>({ emoji:x.emoji, reason:x.reason, dateLabel:x.dateLabel, amountLabel:'− '+fmt(x.amount), onRemove:()=>removeExpense(x.id) })),
    expMonthLabel,
    prevMonth, nextMonth, isCurrentMonth,
    sheetEmoji:scat.emoji, sheetCatName:scat.name, sheetTileStyle:tileStyle(42,22,scat.color), sheetItems,
    sheetText, setSheetText,
    onSheetAdd:()=>{ const n=sheetText.trim(); if(n){ addToList(n,sheetCat,priceOf(n)); setSheetText('') } },
    nrName, setNrName, nrText, setNrText, nrEmoji, setNrEmoji,
    nrIngredients, nrHasIng:nrIng.length>0,
    onNrAddIng:()=>{ const n=nrText.trim(); if(n){ setNrIng(s=>[...s,{name:n,cat:(catalogCat(n)||'foyer')}]); setNrText('') } },
    nrSuggestions,
    onNrPickSugg:(s)=>{ setNrIng(prev=>[...prev,{name:s.name,cat:s.cat}]); setNrText('') },
    saveNewRecipe,
    mgrName, setMgrName, mgrEmoji, setMgrEmoji,
    mgrInviteEmails, setMgrInviteEmails, mgrInviteText, setMgrInviteText, addMgrInvite,
    createNamedList,
    addInviteToList, removeInviteFromList,
    openListsMgr:()=>{ setOverlay('listsMgr'); setMgrName(''); setMgrEmoji('📝'); setMgrInviteEmails([]); setMgrInviteText('') },
    brandRef, scrollRef, onListScroll,
    comingSoon:()=>flash('Bientôt disponible 🐧'),
    userName, userPhoto, saveDisplayName, uploadPhoto,
    editList: lists.find(l => l.id === editListId) || null,
    openEditList:(id)=>{ setEditListId(id); setOverlay('editList') },
    updateList, uploadListPhoto,
    isFab:false,
    goListe:()=>{ goToTab('liste'); setOverlay(null) },
    goCuisine:()=>{ goToTab('cuisine'); setOverlay(null) },
    goDepenses:()=>{ goToTab('depenses'); setOverlay(null) },
    goParams:()=>{ goToTab('params'); setOverlay(null) },
    openPanier:()=>setOverlay('panier'),
    openFridge:()=>setOverlay('frigo'),
    listDropOpen, toggleListDrop:()=>setListDropOpen(v=>!v), closeListDrop:()=>setListDropOpen(false),
    openAddDefault:()=>{ setSheetCat('fl'); setSheetText(''); setOverlay('addSheet') },
    openNewRecipe:()=>{ setOverlay('newRecipe'); setNrName(''); setNrIng([]); setNrText(''); setNrEmoji('🍽️') },
    closeOverlay:()=>setOverlay(null),
    askClear:()=>setOverlay('clear'),
    confirmClear:()=>doClear(),
    // Paramètres extra
    userEmail, onSignOut,
    toast,
  }

  return (
    <div style={{ width:'100%', maxWidth:430, margin:'0 auto', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:'#F2F2F2', fontFamily:"'Plus Jakarta Sans', -apple-system, system-ui, sans-serif", WebkitFontSmoothing:'antialiased', color:'#15110F', position:'relative' }}>
      <div style={{ flex:1, minHeight:0, position:'relative', overflow:'hidden' }}>
        <div ref={pagerRef} onScroll={onPagerScroll} className="fg-pager" style={{ display:'flex', width:'100%', height:'100%', overflowX:'auto', overflowY:'hidden' }}>
          <div style={{ flex:'0 0 100%', width:'100%', height:'100%', overflow:'hidden' }}><ListeScreen {...p} /></div>
          <div style={{ flex:'0 0 100%', width:'100%', height:'100%', overflow:'hidden' }}><CuisineScreen {...p} /></div>
          <div style={{ flex:'0 0 100%', width:'100%', height:'100%', overflow:'hidden' }}><DepensesScreen {...p} /></div>
          <div style={{ flex:'0 0 100%', width:'100%', height:'100%', overflow:'hidden' }}><ParametresScreen {...p} /></div>
        </div>

        {overlay==='panier'      && <PanierOverlay        {...p} />}
        {overlay==='frigo'       && <FrigoOverlay         {...p} />}
        {overlay==='recipe'      && <RecipeOverlay        {...p} />}
        {overlay==='addSheet'    && <AddSheetOverlay      {...p} />}
        {overlay==='listsMgr'    && <ListsManagerOverlay  {...p} />}
        {overlay==='newRecipe'   && <NewRecipeOverlay     {...p} />}
        {overlay==='clear'       && <ClearConfirmOverlay  {...p} />}
        {overlay==='editList'    && <EditListOverlay      {...p} />}
        {overlay==='editRecipe'  && <EditRecipeOverlay   {...p} />}
      </div>

      <BottomNav tab={tab} goListe={p.goListe} goCuisine={p.goCuisine} goDepenses={p.goDepenses} goParams={p.goParams} />

      <Toast message={toast} />
    </div>
  )
}
