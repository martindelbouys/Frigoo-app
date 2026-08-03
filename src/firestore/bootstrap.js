import {
  doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  collection, query, where, writeBatch, serverTimestamp, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { db } from '../firebase'
import { INITIAL_RECIPES } from '../data'
import { userRef, recipesRef, expensesRef, itemsRef } from './paths'

// Assure l'existence du doc utilisateur + d'au moins une liste, nettoie les
// doublons, rejoint les listes en attente d'invitation, et amorce les recettes
// par défaut. Appelé une fois au démarrage, avant d'ouvrir les listeners temps réel.
export async function bootstrapUser(uid, userEmail, flash) {
  const uSnap = await getDoc(userRef(uid))
  let data = uSnap.exists() ? uSnap.data() : null

  if (!data) {
    // New user → create user doc
    await setDoc(userRef(uid), { budget:250, showPrices:true, activeListId:null, createdAt:serverTimestamp() })
    data = { budget:250, showPrices:true, activeListId:null }
  }

  // Check if user has any list
  const q = query(collection(db, 'lists'), where('members', 'array-contains', uid))
  const { docs } = await getDocs(q)

  if (docs.length === 0) {
    if (import.meta.env.DEV) {
      // Dev: 3 listes avec articles, dépenses et recettes enrichies
      const devLists = [
        { emoji:'🛒', name:'Ma liste', members:[uid], store:'Carrefour City', city:'Lyon 7ᵉ',
          items:[
            { name:'Tomates', cat:'fl', price:1.95, qty:3 },
            { name:'Pâtes', cat:'fec', price:0.89, qty:2 },
            { name:'Lait', cat:'lait', price:0.89, qty:3 },
            { name:'Poulet', cat:'vp', price:5.40, qty:1 },
            { name:'Œufs', cat:'lait', price:2.10, qty:1 },
            { name:'Bananes', cat:'fl', price:1.20, qty:1 },
            { name:'Fromage râpé', cat:'lait', price:1.95, qty:1 },
            { name:'Riz', cat:'fec', price:1.40, qty:1 },
          ]
        },
        { emoji:'🏠', name:'Appart', members:[uid], store:'Lidl', city:'Villeurbanne',
          items:[
            { name:'Dentifrice', cat:'soin', price:2.20, qty:1 },
            { name:"Jus d'orange", cat:'bois', price:1.80, qty:2 },
            { name:'Yaourts', cat:'lait', price:1.85, qty:2 },
            { name:'Pain de mie', cat:'fec', price:1.15, qty:1 },
            { name:'Lessive', cat:'men', price:5.20, qty:1 },
          ]
        },
        { emoji:'🎉', name:'BBQ du 5 juillet', members:[uid], store:'Leclerc', city:'Bron',
          items:[
            { name:'Saucisses', cat:'vp', price:2.90, qty:3 },
            { name:'Bière', cat:'bois', price:4.20, qty:2 },
            { name:'Chips', cat:'apero', price:1.80, qty:3 },
            { name:'Houmous', cat:'apero', price:2.10, qty:2 },
            { name:'Olives', cat:'apero', price:1.95, qty:1 },
          ]
        },
      ]
      let firstId = null
      for (const l of devLists) {
        const { items, ...listData } = l
        const lRef = await addDoc(collection(db, 'lists'), { ...listData, createdAt:serverTimestamp() })
        if (!firstId) firstId = lRef.id
        const b = writeBatch(db)
        items.forEach(it => b.set(doc(itemsRef(lRef.id)), { ...it, place:'liste', checked:false, createdAt:serverTimestamp() }))
        await b.commit()
      }
      await updateDoc(userRef(uid), { activeListId:firstId, budget:250 })
      // Dépenses
      const expB = writeBatch(db)
      const devExp = [
        { reason:'Monoprix express', emoji:'🛒', amount:21.85, dateLabel:'27 juin' },
        { reason:'Boulangerie',       emoji:'🥐', amount:6.80,  dateLabel:'25 juin' },
        { reason:'Marché bio',        emoji:'🥦', amount:18.90, dateLabel:'22 juin' },
        { reason:'Lidl semaine',      emoji:'🛒', amount:32.10, dateLabel:'18 juin' },
        { reason:'Courses Carrefour', emoji:'🛒', amount:47.30, dateLabel:'12 juin' },
      ]
      devExp.forEach(e => expB.set(doc(expensesRef(uid)), { ...e, createdAt:serverTimestamp() }))
      await expB.commit()
    } else {
      // Prod: liste unique avec 3 articles
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
      await updateDoc(userRef(uid), { activeListId:lid })
    }
  } else {
    // Nettoie les doublons "Ma liste" vides
    const activeId = data.activeListId || docs[0].id
    for (const d of docs) {
      if (d.id === activeId) continue
      const iItems = await getDocs(itemsRef(d.id))
      if (iItems.empty && d.data().name === 'Ma liste') {
        await deleteDoc(doc(collection(db, 'lists'), d.id))
      }
    }
    if (!data.activeListId) await updateDoc(userRef(uid), { activeListId:activeId })
  }

  // Auto-join lists where user was invited by email
  if (userEmail && userEmail !== 'dev@frigoo.local') {
    try {
      const invQ = query(collection(db, 'lists'), where('pendingInvites', 'array-contains', userEmail))
      const invSnap = await getDocs(invQ)
      for (const d of invSnap.docs) {
        const ld = d.data()
        if (!(ld.members || []).includes(uid)) {
          await updateDoc(d.ref, {
            members: arrayUnion(uid),
            pendingInvites: arrayRemove(userEmail),
          })
          if (flash) flash('Tu as rejoint « '+(ld.name||'')+' » ✓')
        }
      }
    } catch(e) { console.warn('auto-join:', e.code) }
  }

  // Seed default recipes if none (2 exemples seulement pour ne pas noyer l'onglet)
  const { docs: rDocs } = await getDocs(collection(db, 'users', uid, 'recipes'))
  if (rDocs.length === 0) {
    const batch = writeBatch(db)
    INITIAL_RECIPES.forEach(r => batch.set(doc(recipesRef(uid)), { emoji:r.emoji, name:r.name, ing:r.ing, createdAt:serverTimestamp() }))
    await batch.commit()
  }
}
