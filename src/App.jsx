import { useState, useEffect } from 'react'
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import ListeScreen from './screens/ListeScreen'
import RecettesScreen from './screens/RecettesScreen'
import DepensesScreen from './screens/DepensesScreen'
import ParametresScreen from './screens/ParametresScreen'

const provider = new GoogleAuthProvider()

async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      budgetMensuel: 250,
      showPrices: true,
    })
  }
}

async function getOrCreateList(uid) {
  const q = query(collection(db, 'lists'), where('members', 'array-contains', uid))
  const snap = await getDocs(q)
  if (!snap.empty) return snap.docs[0].id
  const ref = await addDoc(collection(db, 'lists'), {
    name: 'Ma liste', members: [uid], createdAt: serverTimestamp(),
  })
  return ref.id
}

// ── Nav icons ──
function IconListe({ active }) {
  const c = active ? '#E8472A' : '#9A9A9A'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}
function IconRecettes({ active }) {
  const c = active ? '#E8472A' : '#9A9A9A'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}
function IconDepenses({ active }) {
  const c = active ? '#E8472A' : '#9A9A9A'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}
function IconParams({ active }) {
  const c = active ? '#E8472A' : '#9A9A9A'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

const TABS = [
  { id: 'liste',    Icon: IconListe },
  { id: 'recettes', Icon: IconRecettes },
  { id: 'depenses', Icon: IconDepenses },
  { id: 'params',   Icon: IconParams },
]

function LoginScreen({ onSignIn }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 24, padding: 32, background: '#F6F6F7' }}>
      <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 64, fontWeight: 600, color: '#E8472A', letterSpacing: -1, lineHeight: 1 }}>frigoo</div>
      <p style={{ color: '#6B6B6B', textAlign: 'center', fontWeight: 600, fontSize: 15, maxWidth: 260 }}>
        Gérez vos courses, votre cuisine et vos dépenses.
      </p>
      <button onClick={onSignIn} style={{ background: '#E8472A', color: '#fff', border: 'none', borderRadius: 14, padding: '15px 32px', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 18px rgba(232,71,42,.34)' }}>
        Se connecter avec Google
      </button>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(undefined)
  const [activeTab, setActiveTab] = useState('liste')
  const [listId, setListId] = useState(null)
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null)
      if (u) {
        ensureUserDoc(u)
        getOrCreateList(u.uid).then(setListId)
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!listId) return
    return onSnapshot(collection(db, 'lists', listId, 'items'), (snap) => setItemCount(snap.size))
  }, [listId])

  if (user === undefined) return null
  if (!user) return (
    <div style={{ maxWidth: 430, margin: '0 auto', height: '100svh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <LoginScreen onSignIn={() => signInWithPopup(auth, provider)} />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100svh' }}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'liste'    && <ListeScreen user={user} />}
        {activeTab === 'recettes' && <RecettesScreen uid={user.uid} listId={listId} />}
        {activeTab === 'depenses' && <DepensesScreen uid={user.uid} listId={listId} itemCount={itemCount} />}
        {activeTab === 'params'   && <ParametresScreen user={user} listId={listId} />}
      </main>

      <nav style={{ flexShrink: 0, display: 'flex', borderTop: '1px solid #F0F0F0', background: '#fff', height: 60 }}>
        {TABS.map(({ id, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Icon active={activeTab === id} />
          </button>
        ))}
      </nav>
    </div>
  )
}
