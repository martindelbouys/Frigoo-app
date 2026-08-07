import { useState } from 'react'
import { doc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { itemsRef } from '../firestore/paths'
import { priceOf } from '../lib/catalog'

// Ajout d'une recette à la liste active (avec confirmation en cas de doublons)
// et suppression de recette. Porte son propre état de confirmation (recipeId,
// recipeAsk, pendingRecipeId) car il est indissociable de ces actions.
export function useRecipeActions({ uid, recipes, activeListId, lists, articles, flash, setOverlay, setTab }) {
  const [recipeId, setRecipeId]               = useState(null)
  const [recipeAsk, setRecipeAsk]             = useState(null)
  const [pendingRecipeId, setPendingRecipeId] = useState(null)

  const deleteRecipe = async (id) => {
    const r = recipes.find(x => x.id === id)
    await deleteDoc(doc(db, 'users', uid, 'recipes', id))
    setOverlay(null); setRecipeId(null)
    flash('Recette « '+(r?.name||'')+' » supprimée 🗑️')
  }

  const askAddRecipe = (id) => { setRecipeId(id); setPendingRecipeId(id); setRecipeAsk('confirm'); setOverlay('recipe') }
  const cancelAsk = () => { setRecipeAsk(null); setPendingRecipeId(null) }

  // Pas de notion de quantité : un ingrédient déjà dans la liste est simplement
  // ignoré (pas de choix à faire, contrairement à avant où on demandait s'il
  // fallait +1 sa quantité).
  const commitRecipe = async () => {
    const r = recipes.find(x => x.id === pendingRecipeId)
    if (!r) { setRecipeAsk(null); return }
    const lid = activeListId
    const listActive = lists.find(l => l.id === lid)
    const batch = writeBatch(db)
    let added = 0
    r.ing.forEach(({name, cat}) => {
      const ex = articles.find(a => a.listId === lid && a.name.toLowerCase() === name.toLowerCase())
      if (!ex) {
        batch.set(doc(itemsRef(lid)), { name, cat, price:priceOf(name), qty:1, place:'liste', checked:false, createdAt:serverTimestamp() }); added++
      }
    })
    await batch.commit()
    setRecipeAsk(null); setPendingRecipeId(null); setRecipeId(null); setOverlay(null); setTab('liste')
    if (added === 0) flash('Tout est déjà dans « '+(listActive?.name||'')+' »')
    else flash(added+' ingrédient'+(added>1?'s':'')+' ajouté'+(added>1?'s':'')+' à « '+(listActive?.name||'')+' »')
  }

  const confirmAddStep1 = () => commitRecipe()

  return {
    recipeId, setRecipeId, recipeAsk, pendingRecipeId,
    deleteRecipe, askAddRecipe, cancelAsk, commitRecipe, confirmAddStep1,
  }
}
