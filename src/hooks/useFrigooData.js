import { useState, useRef, useEffect, useCallback } from 'react'
import { onSnapshot, query, collection, where, orderBy, updateDoc } from 'firebase/firestore'
import { db, storage } from '../firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { userRef, recipesRef, expensesRef, itemsRef } from '../firestore/paths'
import { bootstrapUser } from '../firestore/bootstrap'

// Amorce le compte (bootstrapUser) puis ouvre tous les listeners temps réel
// (profil, listes, articles, recettes, dépenses) et expose les mutations qui
// écrivent directement sur le doc utilisateur (budget, préférences, profil).
export function useFrigooData(uid, userEmail, flash) {
  const [loading, setLoading]                 = useState(true)
  const [budget, setBudget]                   = useState(250)
  const [showPricesLocal, setShowPricesLocal] = useState(true)
  const [activeListId, setActiveListId]       = useState(null)
  const [userName, setUserName]               = useState('')
  const [userPhoto, setUserPhoto]             = useState('')
  const [lists, setLists]                     = useState([])
  const [articles, setArticles]               = useState([])
  const [recipes, setRecipes]                 = useState([])
  const [expenses, setExpenses]               = useState([])

  const listIdsRef = useRef([]) // track active list subscriptions

  // ── Bootstrap: ensure user doc + default list ──────────────────────────────
  useEffect(() => {
    let cancelled = false
    bootstrapUser(uid, userEmail)
      .catch(e => console.error('boot error:', e))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [uid])

  // ── Real-time listeners ────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return

    const unsubs = []

    // User profile
    unsubs.push(onSnapshot(userRef(uid), snap => {
      if (!snap.exists()) return
      const d = snap.data()
      if (d.budget !== undefined) setBudget(d.budget)
      if (d.showPrices !== undefined) setShowPricesLocal(d.showPrices)
      if (d.activeListId) setActiveListId(d.activeListId)
      if (d.name !== undefined) setUserName(d.name)
      if (d.photoURL !== undefined) setUserPhoto(d.photoURL)
    }))

    // Lists
    const listsQ = query(collection(db, 'lists'), where('members', 'array-contains', uid))
    unsubs.push(onSnapshot(listsQ, snap => {
      setLists(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    }))

    // Recipes (sans orderBy pour éviter l'index Firestore manquant)
    unsubs.push(onSnapshot(recipesRef(uid), snap => {
      setRecipes(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    }))

    // Expenses
    unsubs.push(onSnapshot(query(expensesRef(uid), orderBy('createdAt', 'desc')), snap => {
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

  // ── Budget / prefs mutations ───────────────────────────────────────────────
  const budgetUp = useCallback(async () => {
    const n = budget + 10; setBudget(n); await updateDoc(userRef(uid), { budget:n })
  }, [uid, budget])

  const budgetDown = useCallback(async () => {
    const n = Math.max(10, budget - 10); setBudget(n); await updateDoc(userRef(uid), { budget:n })
  }, [uid, budget])

  const togglePrices = useCallback(async () => {
    const n = !showPricesLocal; setShowPricesLocal(n); await updateDoc(userRef(uid), { showPrices:n })
  }, [uid, showPricesLocal])

  const saveDisplayName = useCallback(async (name) => {
    const n = name.trim()
    setUserName(n)
    await updateDoc(userRef(uid), { name: n })
  }, [uid])

  const uploadPhoto = useCallback(async (file) => {
    if (!file) return
    try {
      const ref = storageRef(storage, `users/${uid}/avatar`)
      await uploadBytes(ref, file)
      const url = await getDownloadURL(ref)
      setUserPhoto(url)
      await updateDoc(userRef(uid), { photoURL: url })
    } catch (e) {
      flash('Erreur upload photo : ' + e.code)
    }
  }, [uid, flash])

  return {
    loading,
    budget, showPricesLocal, activeListId, userName, userPhoto,
    lists, articles, recipes, expenses,
    budgetUp, budgetDown, togglePrices, saveDisplayName, uploadPhoto,
  }
}
