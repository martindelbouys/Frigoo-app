import { useState, useEffect } from 'react'
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { List, ChefHat, Wallet, Settings } from 'lucide-react'
import { auth, db } from './firebase'

const provider = new GoogleAuthProvider()

async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      budgetMensuel: 0,
    })
  }
}

const TABS = [
  { id: 'liste',    label: 'Liste',    Icon: List },
  { id: 'cuisine',  label: 'Cuisine',  Icon: ChefHat },
  { id: 'depenses', label: 'Dépenses', Icon: Wallet },
  { id: 'params',   label: 'Paramètres', Icon: Settings },
]

function Screen({ name }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>{name}</h1>
    </div>
  )
}

function LoginScreen({ onSignIn }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      flex: 1, gap: 24, padding: 32,
    }}>
      <h1 style={{ fontSize: 36, fontWeight: 800 }}>Frigoo</h1>
      <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
        Gérez vos courses, votre cuisine et vos dépenses.
      </p>
      <button onClick={onSignIn} style={{
        background: 'var(--color-accent)', color: '#fff',
        border: 'none', borderRadius: 12, padding: '14px 28px',
        fontSize: 16, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'inherit',
      }}>
        Se connecter avec Google
      </button>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(undefined)
  const [activeTab, setActiveTab] = useState('liste')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null)
      if (u) ensureUserDoc(u)
    })
    return unsubscribe
  }, [])

  const handleSignIn = () => signInWithPopup(auth, provider)

  if (user === undefined) return null

  if (!user) return <LoginScreen onSignIn={handleSignIn} />

  const activeScreen = TABS.find((t) => t.id === activeTab)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 64 }}>
        <Screen name={activeScreen.label} />
      </main>

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex', borderTop: '1px solid var(--color-border)',
        background: '#fff', height: 64,
      }}>
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id
          const color = active ? 'var(--color-accent)' : 'var(--color-text-secondary)'
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                color, fontFamily: 'inherit',
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500 }}>{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
