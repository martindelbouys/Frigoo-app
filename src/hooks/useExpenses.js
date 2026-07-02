import { useState } from 'react'
import { doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { expensesRef } from '../firestore/paths'
import { emojiOf } from '../lib/catalog'

const MOIS = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.']

// Navigation mensuelle + CRUD des dépenses, et calcul du budget restant du mois affiché.
export function useExpenses({ uid, expenses, budget, flash }) {
  const [expYear, setExpYear]         = useState(new Date().getFullYear())
  const [expMonthIdx, setExpMonthIdx] = useState(new Date().getMonth())
  const [expReason, setExpReason]     = useState('')
  const [expAmount, setExpAmount]     = useState('')

  const filteredExpenses = expenses.filter(e => {
    const d = e.createdAt?.toDate?.()
    if (!d) return false
    return d.getFullYear() === expYear && d.getMonth() === expMonthIdx
  })
  const spent = filteredExpenses.reduce((t, e) => t+e.amount, 0)
  const remaining = budget - spent
  const pct = Math.max(0, Math.min(100, Math.round((spent/budget)*100)))
  const isCurrentMonth = expYear === new Date().getFullYear() && expMonthIdx === new Date().getMonth()
  const expMonthLabel = MOIS[expMonthIdx].replace('.','') + ' ' + expYear

  const prevMonth = () => { if (expMonthIdx === 0) { setExpMonthIdx(11); setExpYear(y=>y-1) } else setExpMonthIdx(m=>m-1) }
  const nextMonth = () => {
    const now = new Date()
    if (expYear === now.getFullYear() && expMonthIdx === now.getMonth()) return
    if (expMonthIdx === 11) { setExpMonthIdx(0); setExpYear(y=>y+1) } else setExpMonthIdx(m=>m+1)
  }

  const addExpense = async () => {
    const r = expReason.trim(); const a = parseFloat((expAmount||'').replace(',','.'))
    if (!r || !(a > 0)) { flash('Indique un motif et un montant valide'); return }
    const d = new Date()
    try {
      await addDoc(expensesRef(uid), { reason:r, emoji:emojiOf(r)||'🛒', amount:a, dateLabel:d.getDate()+' '+MOIS[d.getMonth()], createdAt:serverTimestamp() })
      setExpReason(''); setExpAmount('')
      // Revenir au mois courant si on était dans un mois passé
      setExpYear(d.getFullYear()); setExpMonthIdx(d.getMonth())
      flash('Dépense ajoutée ✓')
    } catch(e) { flash('Erreur : '+e.code); console.error(e) }
  }

  const removeExpense = async (id) => {
    await deleteDoc(doc(db, 'users', uid, 'expenses', id))
  }

  return {
    expReason, setExpReason, expAmount, setExpAmount,
    filteredExpenses, spent, remaining, pct, isCurrentMonth, expMonthLabel,
    prevMonth, nextMonth, addExpense, removeExpense,
  }
}
