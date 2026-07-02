import { doc, collection } from 'firebase/firestore'
import { db } from '../firebase'

export const userRef     = (uid) => doc(db, 'users', uid)
export const recipesRef  = (uid) => collection(db, 'users', uid, 'recipes')
export const expensesRef = (uid) => collection(db, 'users', uid, 'expenses')
export const itemsRef    = (listId) => collection(db, 'lists', listId, 'items')
