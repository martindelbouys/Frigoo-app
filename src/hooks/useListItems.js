import { doc, addDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { itemsRef } from '../firestore/paths'
import { priceOf } from '../lib/catalog'

// Actions CRUD sur les articles de la liste active (ajout, suppression,
// aller/retour frigo, vidage). Ne connaît rien d'autre que la liste active et ses articles.
// Pas de notion de quantité : un article est soit dans la liste, soit pas.
export function useListItems({ activeListId, articles, flash, onListCleared }) {
  const mine     = articles.filter(a => a.listId === activeListId)
  const inList   = mine.filter(a => a.place === 'liste')
  const inFridge = mine.filter(a => a.place === 'frigo')

  const addToList = async (name, cat, price) => {
    const lid = activeListId
    const ex = articles.find(a => a.listId === lid && a.name.toLowerCase() === name.toLowerCase())
    if (ex) {
      if (ex.place !== 'liste') {
        await updateDoc(doc(db, 'lists', lid, 'items', ex.id), { place:'liste' })
        flash(name+' remis dans la liste ✓')
      } else {
        flash(name+' déjà dans la liste')
      }
    } else {
      await addDoc(itemsRef(lid), { name, cat, price:price!=null?price:priceOf(name), qty:1, place:'liste', checked:false, createdAt:serverTimestamp() })
      flash(name+' ajouté ✓')
    }
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

  const clearFridge = async () => {
    if (!inFridge.length) return
    const batch = writeBatch(db)
    inFridge.forEach(a => batch.delete(doc(db, 'lists', a.listId, 'items', a.id)))
    await batch.commit()
    flash('Frigo vidé 🧊')
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
    onListCleared?.()
    flash('Liste vidée 🧹 (frigo conservé)')
  }

  return { addToList, remove, gotIt, rebuy, clearFridge, toggleCheck, doClear }
}
