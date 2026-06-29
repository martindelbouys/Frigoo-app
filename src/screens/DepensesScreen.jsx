import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, addDoc, deleteDoc,
  doc, updateDoc, serverTimestamp, getDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

const EXPENSE_EMOJIS = ['🛒', '🥖', '🌿', '🍖', '💊', '🧴', '🍷', '🧹', '🍕', '☕']

function fmt(n) {
  return Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default function DepensesScreen({ uid, listId, itemCount }) {
  const [budget, setBudget] = useState(250)
  const [expenses, setExpenses] = useState([])
  const [motif, setMotif] = useState('')
  const [montant, setMontant] = useState('')

  useEffect(() => {
    if (!uid) return
    getDoc(doc(db, 'users', uid)).then((snap) => {
      if (snap.exists() && snap.data().budgetMensuel) setBudget(snap.data().budgetMensuel)
    })
    return onSnapshot(collection(db, 'users', uid, 'expenses'), (snap) =>
      setExpenses(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      )
    )
  }, [uid])

  const now = new Date()
  const currentMonthKey = monthKey(now)
  const thisMonthExpenses = expenses.filter((e) => {
    if (!e.createdAt) return false
    return monthKey(new Date(e.createdAt.seconds * 1000)) === currentMonthKey
  })
  const totalSpent = thisMonthExpenses.reduce((s, e) => s + (e.montant ?? 0), 0)
  const remaining = budget - totalSpent
  const spentPct = Math.min(100, Math.round((totalSpent / budget) * 100))

  const adjustBudget = async (delta) => {
    const newBudget = Math.max(0, budget + delta)
    setBudget(newBudget)
    await updateDoc(doc(db, 'users', uid), { budgetMensuel: newBudget })
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    const amount = parseFloat(montant.replace(',', '.'))
    if (!motif.trim() || isNaN(amount) || amount <= 0) return
    const emoji = EXPENSE_EMOJIS[Math.floor(Math.random() * EXPENSE_EMOJIS.length)]
    await addDoc(collection(db, 'users', uid, 'expenses'), {
      motif: motif.trim(), montant: amount, emoji, createdAt: serverTimestamp(),
    })
    setMotif('')
    setMontant('')
  }

  const handleDelete = (id) => deleteDoc(doc(db, 'users', uid, 'expenses', id))

  const formatDate = (ts) => {
    if (!ts) return ''
    const d = new Date(ts.seconds * 1000)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  }

  return (
    <div style={{ flex: 1, background: '#F6F6F7', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 20px 14px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.5px' }}>Dépenses</div>
      </div>

      {/* Scroll */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>

        {/* Budget card */}
        <div style={{ background: '#E8472A', borderRadius: 18, padding: '18px 20px 16px', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.75)', marginBottom: 4 }}>Il te reste ce mois-ci</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>{fmt(remaining)}&nbsp;€</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>/ {fmt(budget)}&nbsp;€</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.3)', overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', borderRadius: 3, background: '#fff', width: `${100 - spentPct}%`, transition: 'width .3s' }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.75)', textAlign: 'right', marginBottom: 14 }}>
            {fmt(totalSpent)}&nbsp;€ dépensés
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Budget mensuel</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: '4px 6px' }}>
              <button onClick={() => adjustBudget(-10)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.25)', color: '#fff', fontSize: 20, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', minWidth: 70, textAlign: 'center' }}>{fmt(budget)}&nbsp;€</span>
              <button onClick={() => adjustBudget(10)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.25)', color: '#fff', fontSize: 20, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
            </div>
          </div>
        </div>

        {/* Panier en cours */}
        <div style={{ background: '#fff', border: '1px solid #ECECEC', borderRadius: 14, padding: '13px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}>
          <span style={{ fontSize: 28 }}>🛒</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Panier en cours</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#9A9A9A', marginTop: 1 }}>
              {itemCount} article{itemCount > 1 ? 's' : ''} dans ta liste
            </div>
          </div>
        </div>

        {/* DÉPENSES DU MOIS */}
        <div style={{ fontSize: 12, fontWeight: 800, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 10 }}>
          Dépenses du mois
        </div>

        {/* Add form */}
        <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Motif (ex : Courses Lidl)"
            style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid #ECECEC', fontSize: 14, fontFamily: 'inherit', background: '#fff', outline: 'none', color: '#15110F' }}
          />
          <input
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            placeholder="0,00"
            type="text"
            inputMode="decimal"
            style={{ width: 72, padding: '12px 10px', borderRadius: 12, border: '1px solid #ECECEC', fontSize: 14, fontFamily: 'inherit', background: '#fff', outline: 'none', textAlign: 'center', color: '#15110F' }}
          />
          <button
            type="submit"
            style={{ width: 44, height: 44, flexShrink: 0, border: 'none', borderRadius: 12, background: '#E8472A', color: '#fff', fontSize: 22, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
          >
            +
          </button>
        </form>

        {/* Expenses list */}
        {thisMonthExpenses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#9A9A9A', fontSize: 14, fontWeight: 600 }}>
            Aucune dépense ce mois-ci.
          </div>
        )}
        {thisMonthExpenses.map((exp) => (
          <div key={exp.id} style={{ background: '#fff', border: '1px solid #ECECEC', borderRadius: 14, padding: '13px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 2px rgba(0,0,0,.03)' }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{exp.emoji ?? '🛒'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.motif}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9A9A9A', marginTop: 1 }}>{formatDate(exp.createdAt)}</div>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#15110F', flexShrink: 0 }}>− {fmt(exp.montant)} €</span>
            <button onClick={() => handleDelete(exp.id)} style={{ border: 'none', background: 'transparent', color: '#D0D0D0', fontSize: 20, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}
