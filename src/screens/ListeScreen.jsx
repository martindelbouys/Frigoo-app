import { useState, useEffect, useRef } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, getDocs,
  doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export const CATEGORIES = [
  'Fruits & Légumes',
  'Féculents & Céréales',
  'Produits Laitiers',
  'Viandes & Poissons',
  'Matières Grasses',
  'Surgelés',
  'Boissons',
  'Produits Sucrés',
  'Apéro',
  'Soin & Santé',
  'Produit Ménager',
  'Foyer',
]

const CATEGORY_EMOJI = {
  'Fruits & Légumes':   '🥦',
  'Féculents & Céréales': '🍞',
  'Produits Laitiers':  '🥛',
  'Viandes & Poissons': '🥩',
  'Matières Grasses':   '🧈',
  'Surgelés':           '🧊',
  'Boissons':           '🧃',
  'Produits Sucrés':    '🍬',
  'Apéro':              '🍷',
  'Soin & Santé':       '💊',
  'Produit Ménager':    '🧹',
  'Foyer':              '🏠',
}

async function getOrCreateList(uid) {
  const q = query(collection(db, 'lists'), where('members', 'array-contains', uid))
  const snap = await getDocs(q)
  if (!snap.empty) return snap.docs[0].id
  const ref = await addDoc(collection(db, 'lists'), {
    name: 'Ma liste',
    members: [uid],
    createdAt: serverTimestamp(),
  })
  return ref.id
}

function SwipeableItem({ item, listId, swipedId, setSwipedId }) {
  const touchStartX = useRef(null)
  const isOpen = swipedId === item.id

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta < -50) setSwipedId(item.id)
    else if (delta > 20) setSwipedId(null)
    touchStartX.current = null
  }

  const toggleChecked = (e) => {
    e.stopPropagation()
    updateDoc(doc(db, 'lists', listId, 'items', item.id), { checked: !item.checked })
  }

  const handleDelete = () =>
    deleteDoc(doc(db, 'lists', listId, 'items', item.id))

  const handleRowClick = () => {
    if (isOpen) setSwipedId(null)
  }

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 12, margin: '0 16px 5px',
    }}>
      <div
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          background: 'var(--color-accent)',
          display: 'flex', alignItems: 'center',
          padding: '0 20px', cursor: 'pointer',
        }}
        onClick={handleDelete}
      >
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Supprimer</span>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleRowClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '15px 14px',
          background: '#fff',
          transform: isOpen ? 'translateX(-100px)' : 'translateX(0)',
          transition: 'transform 0.22s ease',
          position: 'relative',
        }}
      >
        <button
          onClick={toggleChecked}
          style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            border: `2px solid ${item.checked ? 'var(--color-accent)' : '#C8C8C8'}`,
            background: item.checked ? 'var(--color-accent)' : 'transparent',
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {item.checked && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4.5L4 7.5L10 1" stroke="#fff" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: '#F4F4F5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          {CATEGORY_EMOJI[item.category] ?? '🛒'}
        </div>

        <span style={{
          fontSize: 15, lineHeight: 1.4, fontWeight: 500,
          color: item.checked ? 'var(--color-text-tertiary)' : 'var(--color-text)',
          textDecoration: item.checked ? 'line-through' : 'none',
          flex: 1,
        }}>
          {item.name}
        </span>
      </div>
    </div>
  )
}

export default function ListeScreen({ user }) {
  const [listId, setListId] = useState(null)
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [swipedId, setSwipedId] = useState(null)

  useEffect(() => {
    getOrCreateList(user.uid).then(setListId)
  }, [user.uid])

  useEffect(() => {
    if (!listId) return
    const unsubscribe = onSnapshot(
      collection(db, 'lists', listId, 'items'),
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )
    return unsubscribe
  }, [listId])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!name.trim() || !listId) return
    addDoc(collection(db, 'lists', listId, 'items'), {
      name: name.trim(),
      category,
      checked: false,
      createdAt: serverTimestamp(),
    })
    setName('')
  }

  const grouped = CATEGORIES
    .map((cat) => ({ cat, items: items.filter((i) => i.category === cat) }))
    .filter(({ items }) => items.length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Add form */}
      <form
        onSubmit={handleAdd}
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de l'article…"
            style={{
              flex: 1, padding: '10px 12px',
              borderRadius: 10, border: '1px solid var(--color-border)',
              fontSize: 15, fontFamily: 'inherit', color: 'var(--color-text)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'var(--color-accent)', color: '#fff',
              border: 'none', borderRadius: 10, padding: '10px 18px',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            Ajouter
          </button>
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: '9px 12px',
            borderRadius: 10, border: '1px solid var(--color-border)',
            fontSize: 14, fontFamily: 'inherit', color: 'var(--color-text)',
            background: 'var(--color-bg-card)', outline: 'none',
          }}
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </form>

      {/* Items list */}
      <div
        style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}
        onClick={() => swipedId && setSwipedId(null)}
      >
        {grouped.length === 0 && (
          <p style={{
            textAlign: 'center',
            color: 'var(--color-text-tertiary)',
            padding: '56px 24px',
            fontSize: 15,
          }}>
            Votre liste est vide.<br />Ajoutez votre premier article ci-dessus.
          </p>
        )}
        {grouped.map(({ cat, items: catItems }) => (
          <div key={cat}>
            <div style={{ padding: '16px 16px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>{CATEGORY_EMOJI[cat]}</span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase', letterSpacing: '0.6px',
              }}>
                {cat}
              </span>
            </div>
            {catItems.map((item) => (
              <SwipeableItem
                key={item.id}
                item={item}
                listId={listId}
                swipedId={swipedId}
                setSwipedId={setSwipedId}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
