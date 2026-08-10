import { doc, addDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { itemsRef } from '../firestore/paths'
import { priceOf } from '../lib/catalog'
import { isInList, isInFridge } from '../lib/items'

// Actions CRUD sur les articles de la liste active (ajout, suppression,
// aller/retour frigo, vidage). Ne connaît rien d'autre que la liste active et ses articles.
// Pas de notion de quantité : un article est soit dans la liste, soit pas.
export function useListItems({ activeListId, articles, flash }) {
  const mine     = articles.filter(a => a.listId === activeListId)
  const inList   = mine.filter(isInList)
  const inFridge = mine.filter(isInFridge)

  const addToList = async (name, cat, price) => {
    const lid = activeListId
    const ex = articles.find(a => a.listId === lid && a.name.toLowerCase() === name.toLowerCase())
    if (ex) {
      if (!isInList(ex)) {
        await updateDoc(doc(db, 'lists', lid, 'items', ex.id), { inList:true })
        flash(name+' remis dans la liste ✓')
      } else {
        flash(name+' déjà dans la liste')
      }
    } else {
      await addDoc(itemsRef(lid), { name, cat, price:price!=null?price:priceOf(name), qty:1, inList:true, inFridge:false, checked:false, createdAt:serverTimestamp() })
      flash(name+' ajouté ✓')
    }
  }

  // Retire un article de la liste. S'il est aussi un basique du frigo, il y
  // reste (juste retiré de la liste) ; sinon le document est supprimé.
  const removeFromList = async (id, listId) => {
    const item = articles.find(a => a.id === id)
    if (!item) return
    if (isInFridge(item)) {
      await updateDoc(doc(db, 'lists', listId, 'items', id), { inList:false })
    } else {
      await deleteDoc(doc(db, 'lists', listId, 'items', id))
    }
  }

  // Retire un article du frigo. S'il est aussi sur la liste, il y reste
  // (juste retiré du frigo) ; sinon le document est supprimé.
  const removeFromFridge = async (id, listId) => {
    const item = articles.find(a => a.id === id)
    if (!item) return
    if (isInList(item)) {
      await updateDoc(doc(db, 'lists', listId, 'items', id), { inFridge:false })
    } else {
      await deleteDoc(doc(db, 'lists', listId, 'items', id))
    }
  }

  const gotIt = async (id, listId) => {
    const item = articles.find(a => a.id === id)
    await updateDoc(doc(db, 'lists', listId, 'items', id), { inList:false, inFridge:true, checked:false })
    flash('🐧 '+(item?.name||'')+' → direction le frigo')
  }

  // "Racheter" : ajoute l'article à la liste sans le retirer du frigo — il y
  // reste visible, grisé, tant qu'il est encore sur la liste.
  const rebuy = async (id, listId) => {
    await updateDoc(doc(db, 'lists', listId, 'items', id), { inList:true })
    flash('Ajouté à la liste ✓')
  }

  const clearFridge = async () => {
    if (!inFridge.length) return
    const batch = writeBatch(db)
    inFridge.forEach(a => {
      const ref = doc(db, 'lists', a.listId, 'items', a.id)
      if (isInList(a)) batch.update(ref, { inFridge:false })
      else batch.delete(ref)
    })
    await batch.commit()
    flash('Frigo vidé 🧊')
  }

  const toggleCheck = async (id, listId) => {
    const item = articles.find(a => a.id === id)
    if (!item) return
    await updateDoc(doc(db, 'lists', listId, 'items', id), { checked:!item.checked })
  }

  const clearChecked = async () => {
    const lid = activeListId
    const checkedItems = inList.filter(a => a.checked)
    if (!checkedItems.length) return
    const batch = writeBatch(db)
    checkedItems.forEach(a => {
      const ref = doc(db, 'lists', lid, 'items', a.id)
      if (isInFridge(a)) batch.update(ref, { inList:false, checked:false })
      else batch.delete(ref)
    })
    await batch.commit()
    flash('Articles cochés retirés 🧹')
  }

  return { addToList, removeFromList, removeFromFridge, gotIt, rebuy, clearFridge, toggleCheck, clearChecked }
}
