import { useState, useEffect, useRef } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, getDocs,
  doc, serverTimestamp, writeBatch,
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

function AddItemModal({ listId, onClose }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    addDoc(collection(db, 'lists', listId, 'items'), {
      name: name.trim(),
      category,
      checked: false,
      createdAt: serverTimestamp(),
    })
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', background: '#fff',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px 36px',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: '#E0E0E0', alignSelf: 'center', marginBottom: 4,
        }} />

        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text)' }}>
          Ajouter un article
        </span>

        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de l'article…"
            style={{
              padding: '13px 14px',
              borderRadius: 12, border: '1px solid var(--color-border)',
              fontSize: 15, fontFamily: 'inherit', color: 'var(--color-text)',
              outline: 'none', background: 'var(--color-bg-card)',
            }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: '13px 14px',
              borderRadius: 12, border: '1px solid var(--color-border)',
              fontSize: 15, fontFamily: 'inherit', color: 'var(--color-text)',
              background: 'var(--color-bg-card)', outline: 'none',
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              background: 'var(--color-accent)', color: '#fff',
              border: 'none', borderRadius: 12, padding: '14px',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 16,
              cursor: 'pointer', marginTop: 4,
            }}
          >
            Ajouter
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ListeScreen({ user }) {
  const [listId, setListId] = useState(null)
  const [items, setItems] = useState([])
  const [swipedId, setSwipedId] = useState(null)
  const [showModal, setShowModal] = useState(false)

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

  const handleClearList = async () => {
    if (!listId) return
    // Only deletes documents inside lists/{listId}/items — never touches fridges/ or any other collection.
    const snap = await getDocs(collection(db, 'lists', listId, 'items'))
    const batch = writeBatch(db)
    snap.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }

  const grouped = CATEGORIES
    .map((cat) => ({ cat, items: items.filter((i) => i.category === cat) }))
    .filter(({ items }) => items.length > 0)

  const checkedCount = items.filter((i) => i.checked).length
  const totalCount = items.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 16px 14px',
        background: '#fff',
        boxShadow: '0 1px 0 var(--color-border)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
          Dans ma liste, il y a…
        </span>
        <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
          {checkedCount}/{totalCount} pris
        </span>
      </div>

      {/* Items list */}
      <div
        style={{ flex: 1, overflowY: 'auto', paddingBottom: 148 }}
        onClick={() => swipedId && setSwipedId(null)}
      >
        {grouped.length === 0 && (
          <p style={{
            textAlign: 'center',
            color: 'var(--color-text-tertiary)',
            padding: '56px 24px',
            fontSize: 15,
          }}>
            Votre liste est vide.<br />Appuyez sur + pour ajouter un article.
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

      {/* Vider la liste — fixed just above the bottom nav */}
      <div style={{
        position: 'fixed', bottom: 64, left: 0, right: 0,
        padding: '10px 16px',
        background: '#fff',
        borderTop: '1px solid var(--color-border)',
        zIndex: 40,
      }}>
        <button
          onClick={handleClearList}
          disabled={totalCount === 0}
          style={{
            width: '100%', padding: '14px',
            background: totalCount === 0 ? '#ccc' : 'var(--color-accent)',
            color: '#fff', border: 'none', borderRadius: 12,
            fontFamily: 'inherit', fontWeight: 700, fontSize: 15,
            cursor: totalCount === 0 ? 'default' : 'pointer',
          }}
        >
          Vider la liste
        </button>
      </div>

      {/* FAB — above the "Vider la liste" bar */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed', bottom: 138, right: 20,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--color-accent)', color: '#fff',
          border: 'none', fontSize: 28, lineHeight: 1,
          cursor: 'pointer', zIndex: 50,
          boxShadow: '0 4px 16px rgba(232,71,42,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'inherit',
        }}
        aria-label="Ajouter un article"
      >
        +
      </button>

      {/* Modal */}
      {showModal && listId && (
        <AddItemModal listId={listId} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
