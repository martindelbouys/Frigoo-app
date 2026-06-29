import { useState, useEffect, useRef } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, getDocs,
  doc, serverTimestamp, writeBatch, increment,
} from 'firebase/firestore'
import { db } from '../firebase'

export const CATEGORIES = [
  'Fruits & Légumes', 'Féculents & Céréales', 'Produits Laitiers',
  'Viandes & Poissons', 'Matières Grasses', 'Surgelés', 'Boissons',
  'Produits Sucrés', 'Apéro', 'Soin & Santé', 'Produit Ménager', 'Foyer',
]

const CATEGORY_EMOJI = {
  'Fruits & Légumes': '🥦', 'Féculents & Céréales': '🍞',
  'Produits Laitiers': '🥛', 'Viandes & Poissons': '🥩',
  'Matières Grasses': '🧈', 'Surgelés': '🧊', 'Boissons': '🧃',
  'Produits Sucrés': '🍬', 'Apéro': '🍷', 'Soin & Santé': '💊',
  'Produit Ménager': '🧹', 'Foyer': '🏠',
}

const CATEGORY_COLOR = {
  'Fruits & Légumes': '#EAF7EC', 'Féculents & Céréales': '#FBF1E3',
  'Produits Laitiers': '#EAF2FB', 'Viandes & Poissons': '#FBEBEC',
  'Matières Grasses': '#FCF6E3', 'Surgelés': '#E7F6FB',
  'Boissons': '#F0EBFB', 'Produits Sucrés': '#FBEDF4',
  'Apéro': '#FCF0E5', 'Soin & Santé': '#E6F6F3',
  'Produit Ménager': '#EFF7E4', 'Foyer': '#F0F1F3',
}

function tileStyle(size, fs, color) {
  return {
    width: size, height: size, flexShrink: 0,
    borderRadius: Math.round(size * 0.29),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: fs, background: color,
  }
}

async function getOrCreateList(uid) {
  const q = query(collection(db, 'lists'), where('members', 'array-contains', uid))
  const snap = await getDocs(q)
  if (!snap.empty) return snap.docs[0].id
  const ref = await addDoc(collection(db, 'lists'), {
    name: 'Ma liste', members: [uid], createdAt: serverTimestamp(),
  })
  return ref.id
}

// ── Chevron SVG ──
function ChevronLeft({ size = 11, height = 18, stroke = '#404040' }) {
  return (
    <svg width={size} height={height} viewBox="0 0 12 20" fill="none">
      <path d="M10 2L2 10l8 8" stroke={stroke} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Add item modal (shared by main list and panier) ──
function AddItemModal({ listId, onClose }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const inputRef = useRef(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 60) }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    addDoc(collection(db, 'lists', listId, 'items'), {
      name: name.trim(), category, checked: false, qty: 1,
      createdAt: serverTimestamp(),
    })
    onClose()
  }

  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 20px 34px', display: 'flex', flexDirection: 'column', gap: 12 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0E0E0', alignSelf: 'center', marginBottom: 4 }} />
        <span style={{ fontSize: 17, fontWeight: 800 }}>Ajouter un article</span>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de l'article…"
            style={{ padding: '13px 14px', borderRadius: 12, border: '1px solid #F0F0F0', fontSize: 15, fontFamily: 'inherit', background: '#F4F4F5', outline: 'none' }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '13px 14px', borderRadius: 12, border: '1px solid #F0F0F0', fontSize: 15, fontFamily: 'inherit', background: '#F4F4F5', outline: 'none' }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>
            ))}
          </select>
          <button
            type="submit"
            style={{ background: '#E8472A', color: '#fff', border: 'none', borderRadius: 13, padding: '14px', fontFamily: 'inherit', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginTop: 4 }}
          >
            Ajouter
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Swipeable item row (main list) ──
// swipe LEFT = delete (red), swipe RIGHT = move to fridge (blue)
function MainItem({ item, listId, onMoveToFridge }) {
  const startX = useRef(null)
  const [offset, setOffset] = useState(0)
  const THRESHOLD = 70

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX }
  const onTouchMove = (e) => {
    if (startX.current === null) return
    const dx = e.touches[0].clientX - startX.current
    setOffset(Math.max(-THRESHOLD - 10, Math.min(THRESHOLD + 10, dx)))
  }
  const onTouchEnd = () => {
    if (offset < -THRESHOLD) deleteDoc(doc(db, 'lists', listId, 'items', item.id))
    else if (offset > THRESHOLD) onMoveToFridge(item)
    setOffset(0)
    startX.current = null
  }

  const incQty = (e) => {
    e.stopPropagation()
    updateDoc(doc(db, 'lists', listId, 'items', item.id), { qty: (item.qty || 1) + 1 })
  }
  const decQty = (e) => {
    e.stopPropagation()
    const newQty = (item.qty || 1) - 1
    if (newQty <= 0) deleteDoc(doc(db, 'lists', listId, 'items', item.id))
    else updateDoc(doc(db, 'lists', listId, 'items', item.id), { qty: newQty })
  }

  const catColor = CATEGORY_COLOR[item.category] ?? '#F4F4F5'
  const emoji = CATEGORY_EMOJI[item.category] ?? '🛒'

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid #F4F4F4' }}>
      {/* Swipe left = delete */}
      <div style={{ position: 'absolute', inset: 0, background: '#FF3B30', display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 18 }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '.2px' }}>Supprimer</span>
      </div>
      {/* Swipe right = fridge */}
      <div style={{ position: 'absolute', inset: 0, background: '#2E86C9', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingRight: 18 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '.2px' }}>Frigo</span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="3" /><line x1="5" y1="10" x2="19" y2="10" />
          <line x1="8.5" y1="5" x2="8.5" y2="7.5" /><line x1="8.5" y1="13.5" x2="8.5" y2="16" />
        </svg>
      </div>
      {/* Row */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 12px', background: '#fff', position: 'relative', zIndex: 1, touchAction: 'pan-y', userSelect: 'none', transform: `translateX(${offset}px)`, transition: offset === 0 ? 'transform .2s' : 'none' }}
      >
        <span style={tileStyle(34, 19, catColor)}>{emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>
            {item.name}{item.qty > 1 ? ` ×${item.qty}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#F4F4F5', borderRadius: 9, padding: 2 }}>
          <button onClick={decQty} style={{ width: 26, height: 26, border: 'none', background: 'transparent', fontSize: 18, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6B6B', lineHeight: 1 }}>−</button>
          <span style={{ width: 22, textAlign: 'center', fontSize: 15, fontWeight: 800, color: '#15110F' }}>{item.qty || 1}</span>
          <button onClick={incQty} style={{ width: 26, height: 26, border: 'none', background: '#E8472A', borderRadius: 7, fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', lineHeight: 1 }}>+</button>
        </div>
      </div>
    </div>
  )
}

// ── Panier overlay ("Dans ma liste") ──
function PanierOverlay({ items, listId, onClose }) {
  const handleClear = async () => {
    const snap = await getDocs(collection(db, 'lists', listId, 'items'))
    const batch = writeBatch(db)
    snap.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }

  const toggleChecked = (item) =>
    updateDoc(doc(db, 'lists', listId, 'items', item.id), { checked: !item.checked })

  const grouped = CATEGORIES
    .map((cat) => ({ cat, items: items.filter((i) => i.category === cat) }))
    .filter(({ items }) => items.length > 0)

  const picked = items.filter((i) => i.checked).length
  const total = items.length
  const pct = total ? Math.round(picked / total * 100) : 0

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: '#F6F6F7', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 16px 14px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onClose}
            style={{ width: 40, height: 40, flexShrink: 0, border: 'none', borderRadius: 12, background: '#F4F4F5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft />
          </button>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.4px', lineHeight: 1.2, flex: 1 }}>
            Dans ma liste, il y a...
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <div style={{ flex: 1, height: 9, borderRadius: 5, background: '#F1F1F2', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 5, background: '#E8472A', width: `${pct}%`, transition: 'width .25s' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#6B6B6B', flexShrink: 0 }}>
            {picked}/{total} pris
          </span>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px' }}>
        {grouped.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '50px 32px' }}>
            <div style={{ width: 130, height: 130, borderRadius: '50%', background: '#EAF4FB', border: '2px dashed #BBD9EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 50 }}>🛒</span>
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, marginTop: 18 }}>Panier vide</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#8A8A8A', marginTop: 6 }}>Ajoute des articles depuis ta liste.</div>
          </div>
        )}
        {grouped.map(({ cat, items: catItems }) => (
          <div key={cat} style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '0 4px 8px' }}>
              <span style={{ fontSize: 16 }}>{CATEGORY_EMOJI[cat]}</span>
              <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.3px', color: '#6B6B6B' }}>{cat}</span>
            </div>
            <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 18, overflow: 'hidden' }}>
              {catItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleChecked(item)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px', border: 'none', borderBottom: '1px solid #F4F4F4', background: '#fff', cursor: 'pointer', textAlign: 'left' }}
                >
                  {/* Checkbox */}
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    border: item.checked ? '2px solid #E8472A' : '2px solid #DBDBDB',
                    background: item.checked ? '#E8472A' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.checked && (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  {/* Tile */}
                  <span style={tileStyle(34, 19, CATEGORY_COLOR[item.category] ?? '#F4F4F5')}>
                    {CATEGORY_EMOJI[item.category] ?? '🛒'}
                  </span>
                  {/* Name */}
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 800, textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? '#B7B7B7' : '#15110F' }}>
                    {item.name}{item.qty > 1 ? ` ×${item.qty}` : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Vider button */}
      {total > 0 && (
        <div style={{ flexShrink: 0, padding: '10px 16px 20px', background: '#F6F6F7' }}>
          <button
            onClick={handleClear}
            style={{ width: '100%', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, padding: '15px 22px', borderRadius: 15, cursor: 'pointer', background: '#E8472A' }}
          >
            Vider la liste
          </button>
        </div>
      )}
    </div>
  )
}

// ── Fridge overlay ("Dans mon frigoo") ──
function FridgeOverlay({ listId, onClose, onRebuy }) {
  const [fridgeItems, setFridgeItems] = useState([])

  useEffect(() => {
    if (!listId) return
    return onSnapshot(collection(db, 'lists', listId, 'fridge'), (snap) =>
      setFridgeItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )
  }, [listId])

  const handleRemove = (item) =>
    deleteDoc(doc(db, 'lists', listId, 'fridge', item.id))

  const handleRebuy = async (item) => {
    await addDoc(collection(db, 'lists', listId, 'items'), {
      name: item.name, category: item.category,
      checked: false, qty: 1, createdAt: serverTimestamp(),
    })
    await deleteDoc(doc(db, 'lists', listId, 'fridge', item.id))
    onClose()
  }

  const fridgeEmpty = fridgeItems.length === 0

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: '#F6F6F7', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg,#EAF4FB,#fff)', padding: '16px 16px 14px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onClose}
            style={{ width: 40, height: 40, flexShrink: 0, border: 'none', borderRadius: 12, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}
          >
            <ChevronLeft />
          </button>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.4px', lineHeight: 1.2, flex: 1 }}>
            Dans mon frigoo,<br />il y a...
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 24px' }}>
        {fridgeEmpty ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 12px' }}>
            <span style={{ fontSize: 80 }}>🐧</span>
            <div style={{ fontSize: 13, fontWeight: 800, marginTop: 18, color: '#15110F80' }}>
              Il faut que je rachète des sardines moi...
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 18, overflow: 'hidden' }}>
            {fridgeItems.map((item) => (
              <div
                key={item.id}
                style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px', borderBottom: '1px solid #F4F4F4' }}
              >
                <span style={tileStyle(34, 19, CATEGORY_COLOR[item.category] ?? '#F4F4F5')}>
                  {CATEGORY_EMOJI[item.category] ?? '🛒'}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 700, color: '#15110F' }}>{item.name}</span>
                <button
                  onClick={() => handleRebuy(item)}
                  style={{ flexShrink: 0, border: 'none', background: '#FFF4F1', color: '#E8472A', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, padding: '8px 14px', borderRadius: 11, cursor: 'pointer' }}
                >
                  Racheter
                </button>
                <button
                  onClick={() => handleRemove(item)}
                  style={{ flexShrink: 0, border: 'none', background: 'transparent', color: '#C8C8C8', fontSize: 18, fontWeight: 700, cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main screen ──
export default function ListeScreen({ user }) {
  const [listId, setListId] = useState(null)
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [showPanier, setShowPanier] = useState(false)
  const [showFridge, setShowFridge] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [fridgeCount, setFridgeCount] = useState(0)
  const searchRef = useRef(null)

  useEffect(() => { getOrCreateList(user.uid).then(setListId) }, [user.uid])

  useEffect(() => {
    if (!listId) return
    const unsub1 = onSnapshot(collection(db, 'lists', listId, 'items'), (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )
    const unsub2 = onSnapshot(collection(db, 'lists', listId, 'fridge'), (snap) =>
      setFridgeCount(snap.size)
    )
    return () => { unsub1(); unsub2() }
  }, [listId])

  const handleMoveToFridge = async (item) => {
    await addDoc(collection(db, 'lists', listId, 'fridge'), {
      name: item.name, category: item.category, createdAt: serverTimestamp(),
    })
    await deleteDoc(doc(db, 'lists', listId, 'items', item.id))
  }

  const searching = search.trim().length > 0

  const grouped = CATEGORIES
    .map((cat) => ({ cat, items: items.filter((i) => i.category === cat) }))
    .filter(({ items }) => items.length > 0)

  const cartCount = items.length

  // Search: filter items by name
  const searchResults = searching
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase().trim()))
    : []

  return (
    <div style={{ flex: 1, position: 'relative', background: '#F6F6F7', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Brand header ── */}
      <div style={{ background: '#FFE7DF', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
        <div style={{ padding: '20px 16px 42px', position: 'relative' }}>
          {/* Logo frigoo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 8 }}>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 54, fontWeight: 600, letterSpacing: -1, color: '#E8472A', lineHeight: 1 }}>
              frig<span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <span style={{ display: 'inline-flex', width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '3px solid #E8472A', alignItems: 'center', justifyContent: 'center', marginTop: -4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#15110F', display: 'block' }} />
                </span>
                <span style={{ display: 'inline-flex', width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '3px solid #E8472A', alignItems: 'center', justifyContent: 'center', marginTop: -4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#15110F', display: 'block' }} />
                </span>
              </span>
            </div>
          </div>
          {/* Household card — overlaps bottom of header */}
          <div style={{ position: 'absolute', bottom: -28, left: 16, right: 16, zIndex: 2 }}>
            <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, border: 'none', background: '#fff', borderRadius: 15, padding: '11px 11px 11px 13px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>🏠</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.5px', lineHeight: 1.1 }}>{user?.displayName?.split(' ')[0] ?? 'Ma liste'}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9A9A9A', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email ?? ''}
                </div>
              </div>
              <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 800, color: '#E8472A', textTransform: 'uppercase', letterSpacing: '.4px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                Ma liste
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div style={{ background: '#fff', padding: '40px 16px 10px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F1F1F2', borderRadius: 13, padding: '0 12px', height: 44 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher ou ajouter un article…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: '#15110F' }}
          />
          {searching && (
            <button
              onClick={() => setSearch('')}
              style={{ border: 'none', background: '#D9D9DC', width: 20, height: 20, borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {searching ? (
          /* Search results */
          <div style={{ padding: '14px 16px 110px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 10 }}>Résultats</div>
            {searchResults.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 18, overflow: 'hidden', marginBottom: 10 }}>
                {searchResults.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px', borderBottom: '1px solid #F4F4F4' }}>
                    <span style={tileStyle(38, 20, CATEGORY_COLOR[item.category] ?? '#F4F4F5')}>
                      {CATEGORY_EMOJI[item.category] ?? '🛒'}
                    </span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>{item.name}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 18, overflow: 'hidden' }}>
              <button
                onClick={() => { setShowModal(true); setSearch('') }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: 14, border: 'none', background: '#FFFBFA', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ ...tileStyle(38, 20, '#E8472A'), color: '#fff', fontWeight: 800, fontSize: 24 }}>+</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>Ajouter «&nbsp;{search.trim()}&nbsp;»</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal view: store card + sticky category pills + items */
          <>
            {/* Store card */}
            <button style={{ width: 'calc(100% - 32px)', margin: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 11, border: '1px solid #ECECEC', background: '#fff', borderRadius: 14, padding: '11px 13px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}>
              <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 11, background: '#EAF4FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📍</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.3px', color: '#9A9A9A' }}>Magasin de cette liste</div>
                <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Choisir un magasin</div>
              </div>
              <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, background: '#EAF4FB', color: '#2E86C9', borderRadius: 11, padding: '8px 12px', fontSize: 13, fontWeight: 800 }}>Changer</span>
            </button>

            {/* Category filter pills — sticky */}
            <div style={{ position: 'sticky', top: 0, zIndex: 12, display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 16px 11px', background: '#F6F6F7', borderBottom: '1px solid #ECECEC' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setShowModal(true)}
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, padding: '8px 13px 8px 9px', border: '1px solid #ECECEC', borderRadius: 13, background: '#fff', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}
                >
                  <span style={tileStyle(26, 15, CATEGORY_COLOR[cat] ?? '#F4F4F5')}>{CATEGORY_EMOJI[cat]}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {cat.split(' & ')[0].split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* Items */}
            <div style={{ padding: '8px 16px 160px' }}>
              {grouped.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 16px' }}>
                  <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#15110F80' }}>
                    Recherche un article pour l'ajouter à ta liste.
                  </div>
                </div>
              ) : (
                grouped.map(({ cat, items: catItems }) => (
                  <div key={cat} style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '0 4px 8px' }}>
                      <span style={{ fontSize: 16 }}>{CATEGORY_EMOJI[cat]}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.3px', color: '#6B6B6B' }}>{cat}</span>
                    </div>
                    <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}>
                      {catItems.map((item) => (
                        <MainItem
                          key={item.id}
                          item={item}
                          listId={listId}
                          onMoveToFridge={handleMoveToFridge}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* ── FAB fridge (left) ── */}
      <button
        onClick={() => setShowFridge(true)}
        style={{ position: 'absolute', left: 16, bottom: 22, zIndex: 30, width: 54, height: 54, border: '1px solid #E6EFF6', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 18px rgba(46,134,201,.30)' }}
      >
        <svg width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E86C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="3" /><line x1="5" y1="10" x2="19" y2="10" />
          <line x1="8.5" y1="5" x2="8.5" y2="7.5" /><line x1="8.5" y1="13.5" x2="8.5" y2="16" />
        </svg>
        {fridgeCount > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, padding: '0 5px', borderRadius: 10, background: '#2E86C9', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
            {fridgeCount}
          </span>
        )}
      </button>

      {/* ── FAB panier (right) ── */}
      <button
        onClick={() => setShowPanier(true)}
        style={{ position: 'absolute', right: 16, bottom: 22, zIndex: 30, width: 62, height: 62, border: 'none', borderRadius: '50%', background: '#E8472A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 22px rgba(232,71,42,.42)' }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
          <path d="M2 3h2.2l2.3 12.1a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
        </svg>
        {cartCount > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, padding: '0 5px', borderRadius: 10, background: '#15110F', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
            {cartCount}
          </span>
        )}
      </button>

      {/* ── Add item modal ── */}
      {showModal && listId && (
        <AddItemModal listId={listId} onClose={() => setShowModal(false)} />
      )}

      {/* ── Overlays ── */}
      {showPanier && (
        <PanierOverlay
          items={items}
          listId={listId}
          onClose={() => setShowPanier(false)}
        />
      )}
      {showFridge && (
        <FridgeOverlay
          listId={listId}
          onClose={() => setShowFridge(false)}
        />
      )}
    </div>
  )
}
