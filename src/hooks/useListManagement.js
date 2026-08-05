import { useState } from 'react'
import { doc, addDoc, updateDoc, collection, writeBatch, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import { userRef } from '../firestore/paths'

// Création, adhésion, invitations et mise à jour des listes partagées.
// Porte l'état du formulaire "nouvelle liste" (mgr*) car il n'est utile qu'ici.
export function useListManagement({ uid, userEmail, lists, invitations, articles, activeListId, flash, setOverlay }) {
  const [mgrName, setMgrName]                 = useState('')
  const [mgrEmoji, setMgrEmoji]               = useState('📝')
  const [mgrInviteEmails, setMgrInviteEmails] = useState([])
  const [mgrInviteText, setMgrInviteText]     = useState('')

  const leaveList = async (id) => {
    if (lists.length <= 1) { flash('Tu dois garder au moins une liste'); return }
    const lst = lists.find(l => l.id === id)
    const l = lists.find(l => l.id === id)
    const newMembers = (l?.members || []).filter(m => m !== uid)
    if (newMembers.length === 0) {
      // Delete the list entirely
      const items = articles.filter(a => a.listId === id)
      const batch = writeBatch(db)
      items.forEach(a => batch.delete(doc(db, 'lists', id, 'items', a.id)))
      batch.delete(doc(db, 'lists', id))
      await batch.commit()
    } else {
      await updateDoc(doc(db, 'lists', id), { members:newMembers })
    }
    if (activeListId === id) {
      const nextList = lists.find(l => l.id !== id)
      if (nextList) await updateDoc(userRef(uid), { activeListId:nextList.id })
    }
    flash('Tu as quitté « '+(lst?.name||'')+' »')
  }

  const createNamedList = async () => {
    const n = mgrName.trim()
    if (!n) { flash('Donne un nom à ta liste'); return }
    const invites = mgrInviteEmails.filter(e => e.includes('@'))
    const ref = await addDoc(collection(db, 'lists'), {
      name:n, emoji:mgrEmoji||'📝', members:[uid],
      pendingInvites: invites,
      createdAt:serverTimestamp(),
    })
    await updateDoc(userRef(uid), { activeListId:ref.id })
    setMgrName(''); setMgrEmoji('📝'); setMgrInviteEmails([]); setMgrInviteText('')
    setOverlay(null)
    flash('Liste « '+n+' » créée'+(invites.length ? ' · '+invites.length+' invitation'+(invites.length>1?'s':'')+' envoyée'+(invites.length>1?'s':'') : '')+' ✓')
  }

  const acceptInvite = async (listId) => {
    const inv = invitations.find(i => i.id === listId)
    await updateDoc(doc(db, 'lists', listId), {
      members: arrayUnion(uid),
      pendingInvites: arrayRemove(userEmail.toLowerCase()),
    })
    await updateDoc(userRef(uid), { activeListId: listId })
    flash('Tu as rejoint « '+(inv?.name||'')+' » ✓')
  }

  const declineInvite = async (listId) => {
    const inv = invitations.find(i => i.id === listId)
    await updateDoc(doc(db, 'lists', listId), { pendingInvites: arrayRemove(userEmail.toLowerCase()) })
    flash('Invitation refusée · « '+(inv?.name||'')+' »')
  }

  const addInviteToList = async (listId, email) => {
    const e = email.trim().toLowerCase()
    if (!e.includes('@') || !e.includes('.')) { flash('Adresse email invalide'); return }
    await updateDoc(doc(db, 'lists', listId), { pendingInvites: arrayUnion(e) })
    flash('Invitation ajoutée ✓')
  }

  const removeInviteFromList = async (listId, email) => {
    await updateDoc(doc(db, 'lists', listId), { pendingInvites: arrayRemove(email) })
  }

  const addMgrInvite = () => {
    const e = mgrInviteText.trim().toLowerCase()
    if (!e.includes('@') || !e.includes('.')) { flash('Adresse email invalide'); return }
    if (mgrInviteEmails.includes(e)) { flash('Email déjà ajouté'); return }
    setMgrInviteEmails(prev => [...prev, e])
    setMgrInviteText('')
  }

  const switchList = async (id) => {
    await updateDoc(userRef(uid), { activeListId:id })
    flash('Liste active : '+(lists.find(l=>l.id===id)?.name||''))
  }

  const updateList = async (id, data) => {
    await updateDoc(doc(db, 'lists', id), data)
    flash('Liste mise à jour ✓')
  }

  const uploadListPhoto = async (listId, file) => {
    if (!file) return
    try {
      const ref = storageRef(storage, `lists/${listId}/cover`)
      await uploadBytes(ref, file)
      const url = await getDownloadURL(ref)
      await updateDoc(doc(db, 'lists', listId), { photoURL: url })
      flash('Photo mise à jour ✓')
    } catch(e) { flash('Erreur upload : ' + e.code) }
  }

  return {
    mgrName, setMgrName, mgrEmoji, setMgrEmoji,
    mgrInviteEmails, setMgrInviteEmails, mgrInviteText, setMgrInviteText,
    leaveList, createNamedList, addInviteToList, removeInviteFromList, addMgrInvite,
    switchList, updateList, uploadListPhoto, acceptInvite, declineInvite,
  }
}
