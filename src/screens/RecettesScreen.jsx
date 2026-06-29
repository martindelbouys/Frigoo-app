import { useState, useEffect, useRef } from 'react'
import {
  collection, onSnapshot, addDoc, deleteDoc,
  doc, serverTimestamp, getDocs,
} from 'firebase/firestore'
import { db } from '../firebase'

const CATEGORIES = [
  'Fruits & Légumes', 'Féculents & Céréales', 'Produits Laitiers',
  'Viandes & Poissons', 'Matières Grasses', 'Surgelés', 'Boissons',
  'Produits Sucrés', 'Apéro', 'Soin & Santé', 'Produit Ménager', 'Foyer',
]

const CATEGORY_COLOR = {
  'Fruits & Légumes': '#EAF7EC', 'Féculents & Céréales': '#FBF1E3',
  'Produits Laitiers': '#EAF2FB', 'Viandes & Poissons': '#FBEBEC',
  'Matières Grasses': '#FCF6E3', 'Surgelés': '#E7F6FB',
  'Boissons': '#F0EBFB', 'Produits Sucrés': '#FBEDF4',
  'Apéro': '#FCF0E5', 'Soin & Santé': '#E6F6F3',
  'Produit Ménager': '#EFF7E4', 'Foyer': '#F0F1F3',
}

const CATEGORY_EMOJI = {
  'Fruits & Légumes': '🥦', 'Féculents & Céréales': '🍞',
  'Produits Laitiers': '🥛', 'Viandes & Poissons': '🥩',
  'Matières Grasses': '🧈', 'Surgelés': '🧊', 'Boissons': '🧃',
  'Produits Sucrés': '🍬', 'Apéro': '🍷', 'Soin & Santé': '💊',
  'Produit Ménager': '🧹', 'Foyer': '🏠',
}

const RECIPE_EMOJIS = ['🍝', '🍛', '🥗', '🌮', '🍜', '🥘', '🍲', '🥚', '🍕', '🍣', '🥩', '🍗']

function tile(size, fs, color) {
  return {
    width: size, height: size, flexShrink: 0,
    borderRadius: Math.round(size * 0.29),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: fs, background: color,
  }
}

// ── New recipe modal ──
function NewRecipeModal({ uid, onClose }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🍝')
  const [ingredients, setIngredients] = useState([{ name: '', category: CATEGORIES[0] }])
  const nameRef = useRef(null)

  useEffect(() => { setTimeout(() => nameRef.current?.focus(), 60) }, [])

  const addIngredient = () =>
    setIngredients((prev) => [...prev, { name: '', category: CATEGORIES[0] }])

  const updateIng = (i, field, value) =>
    setIngredients((prev) => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))

  const removeIng = (i) =>
    setIngredients((prev) => prev.filter((_, idx) => idx !== i))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const validIngs = ingredients.filter((i) => i.name.trim())
    await addDoc(collection(db, 'users', uid, 'recipes'), {
      name: name.trim(), emoji,
      ingredients: validIngs,
      createdAt: serverTimestamp(),
    })
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 430, margin: '0 auto', background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxHeight: '85svh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0E0E0', alignSelf: 'center' }} />
        <div style={{ fontSize: 18, fontWeight: 800 }}>Nouvelle recette</div>

        {/* Emoji picker */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {RECIPE_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${emoji === e ? '#E8472A' : 'transparent'}`, background: emoji === e ? '#FFF4F1' : '#F4F4F5', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {e}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de la recette…"
            style={{ padding: '13px 14px', borderRadius: 12, border: '1px solid #F0F0F0', fontSize: 15, fontFamily: 'inherit', background: '#F4F4F5', outline: 'none', fontWeight: 700 }}
          />

          <div style={{ fontSize: 13, fontWeight: 800, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '.3px', marginTop: 4 }}>Ingrédients</div>

          {ingredients.map((ing, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={ing.name}
                onChange={(e) => updateIng(i, 'name', e.target.value)}
                placeholder={`Ingrédient ${i + 1}`}
                style={{ flex: 1, padding: '11px 12px', borderRadius: 11, border: '1px solid #F0F0F0', fontSize: 14, fontFamily: 'inherit', background: '#F4F4F5', outline: 'none' }}
              />
              <select
                value={ing.category}
                onChange={(e) => updateIng(i, 'category', e.target.value)}
                style={{ padding: '11px 8px', borderRadius: 11, border: '1px solid #F0F0F0', fontSize: 13, fontFamily: 'inherit', background: '#F4F4F5', outline: 'none', color: '#6B6B6B' }}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c.split(' & ')[0]}</option>)}
              </select>
              {ingredients.length > 1 && (
                <button type="button" onClick={() => removeIng(i)} style={{ flexShrink: 0, border: 'none', background: 'transparent', color: '#C8C8C8', fontSize: 20, cursor: 'pointer', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addIngredient}
            style={{ alignSelf: 'flex-start', border: 'none', background: '#F4F4F5', color: '#E8472A', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, padding: '8px 14px', borderRadius: 10, cursor: 'pointer' }}
          >
            + Ajouter un ingrédient
          </button>

          <button
            type="submit"
            style={{ marginTop: 4, background: '#E8472A', color: '#fff', border: 'none', borderRadius: 13, padding: '14px', fontFamily: 'inherit', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Recipe detail overlay ──
function RecipeDetail({ recipe, uid, listId, onClose }) {
  const handleAddAll = async () => {
    if (!listId) return
    for (const ing of recipe.ingredients) {
      await addDoc(collection(db, 'lists', listId, 'items'), {
        name: ing.name, category: ing.category,
        checked: false, qty: 1, createdAt: serverTimestamp(),
      })
    }
    onClose()
  }

  const handleDelete = async () => {
    await deleteDoc(doc(db, 'users', uid, 'recipes', recipe.id))
    onClose()
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: '#F6F6F7', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', padding: '16px 16px 14px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onClose}
            style={{ width: 40, height: 40, flexShrink: 0, border: 'none', borderRadius: 12, background: '#F4F4F5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="11" height="18" viewBox="0 0 12 20" fill="none">
              <path d="M10 2L2 10l8 8" stroke="#404040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span style={{ fontSize: 28, lineHeight: 1 }}>{recipe.emoji}</span>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.3px', flex: 1 }}>{recipe.name}</div>
          <button onClick={handleDelete} style={{ border: 'none', background: 'transparent', color: '#C8C8C8', fontSize: 22, cursor: 'pointer', padding: 4 }}>🗑️</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 10 }}>
          {recipe.ingredients.length} ingrédient{recipe.ingredients.length > 1 ? 's' : ''}
        </div>
        <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 18, overflow: 'hidden' }}>
          {recipe.ingredients.map((ing, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px', borderBottom: i < recipe.ingredients.length - 1 ? '1px solid #F4F4F4' : 'none' }}>
              <span style={tile(34, 19, CATEGORY_COLOR[ing.category] ?? '#F4F4F5')}>
                {CATEGORY_EMOJI[ing.category] ?? '🛒'}
              </span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>{ing.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#9A9A9A' }}>{ing.category.split(' & ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: '10px 16px 20px', background: '#F6F6F7' }}>
        <button
          onClick={handleAddAll}
          style={{ width: '100%', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, padding: '15px', borderRadius: 15, cursor: 'pointer', background: '#E8472A', boxShadow: '0 6px 18px rgba(232,71,42,.3)' }}
        >
          Tout ajouter à la liste
        </button>
      </div>
    </div>
  )
}

export default function RecettesScreen({ uid, listId }) {
  const [recipes, setRecipes] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!uid) return
    return onSnapshot(collection(db, 'users', uid, 'recipes'), (snap) =>
      setRecipes(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name)))
    )
  }, [uid])

  const handleAddAll = async (recipe) => {
    if (!listId) return
    for (const ing of recipe.ingredients) {
      await addDoc(collection(db, 'lists', listId, 'items'), {
        name: ing.name, category: ing.category,
        checked: false, qty: 1, createdAt: serverTimestamp(),
      })
    }
  }

  return (
    <div style={{ flex: 1, position: 'relative', background: '#F6F6F7', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 20px 14px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.5px' }}>Recettes</div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 100px' }}>
        {recipes.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '60px 24px' }}>
            <span style={{ fontSize: 60 }}>👨‍🍳</span>
            <div style={{ fontSize: 16, fontWeight: 800, marginTop: 16 }}>Aucune recette</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#8A8A8A', marginTop: 6 }}>Appuie sur + pour créer ta première recette.</div>
          </div>
        )}
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            style={{ background: '#fff', border: '1px solid #ECECEC', borderRadius: 16, marginBottom: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}
          >
            <button
              onClick={() => setSelected(recipe)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '14px 14px 12px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={tile(46, 24, '#FFF4F1')}>{recipe.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>{recipe.name}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#9A9A9A', marginTop: 2 }}>
                  {recipe.ingredients?.length ?? 0} ingrédient{(recipe.ingredients?.length ?? 0) > 1 ? 's' : ''}
                </div>
              </div>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M1 1l6 6-6 6" stroke="#C8C8C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => handleAddAll(recipe)}
              style={{ width: '100%', border: 'none', borderTop: '1px solid #FFF4F1', background: '#FFFBFA', color: '#E8472A', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, padding: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <span style={{ fontSize: 16 }}>+</span> Tout ajouter à la liste
            </button>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowNew(true)}
        style={{ position: 'absolute', right: 16, bottom: 22, border: 'none', borderRadius: 20, background: '#E8472A', color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, padding: '14px 22px', cursor: 'pointer', boxShadow: '0 8px 22px rgba(232,71,42,.42)', display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> Nouvelle
      </button>

      {/* Modals */}
      {showNew && <NewRecipeModal uid={uid} onClose={() => setShowNew(false)} />}
      {selected && <RecipeDetail recipe={selected} uid={uid} listId={listId} onClose={() => setSelected(null)} />}
    </div>
  )
}
