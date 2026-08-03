import { useState, useEffect } from 'react'
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import FrigooApp from './FrigooApp'

const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' })

function LoginScreen({ onSignIn, loading, error }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:28, padding:32, background:'#F2F2F2', fontFamily:"'Plus Jakarta Sans', -apple-system, system-ui, sans-serif" }}>
      <div>
        <div style={{ fontFamily:"'Fredoka', sans-serif", fontSize:72, fontWeight:600, color:'#E8472A', letterSpacing:-2, lineHeight:1, textAlign:'center' }}>frigoo</div>
        <div style={{ fontSize:14, fontWeight:700, color:'#9A9A9A', textAlign:'center', marginTop:6 }}>La liste de courses pensée pour les budgets serrés 🐧</div>
      </div>
      <img src="/uploads/penguin-wave.png" alt="" style={{ width:170, maxWidth:'70%', height:'auto' }} />
      <button
        onClick={onSignIn}
        disabled={loading}
        style={{ display:'flex', alignItems:'center', gap:10, background:loading?'#ccc':'#E8472A', color:'#fff', border:'none', borderRadius:16, padding:'15px 28px', fontSize:16, fontWeight:800, cursor:loading?'default':'pointer', fontFamily:'inherit', boxShadow:'0 6px 18px rgba(232,71,42,.30)', opacity:loading?0.7:1 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" opacity=".9"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".7"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" opacity=".5"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity=".8"/></svg>
        {loading ? 'Connexion…' : 'Se connecter avec Google'}
      </button>
      {error && <div style={{ color:'#C0392B', fontSize:13, fontWeight:600, textAlign:'center', maxWidth:280 }}>{error}</div>}
    </div>
  )
}

const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
// PWA installée sur l'écran d'accueil : signInWithRedirect n'y fonctionne pas de façon fiable
// (la navigation vers Google ne se produit jamais, sans erreur). signInWithPopup fonctionne bien
// à la place, y compris en mode standalone.
const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

export default function App() {
  const [user, setUser]       = useState(undefined)
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    getRedirectResult(auth).catch(e => setError(e.message))
    return onAuthStateChanged(auth, u => setUser(u ?? null))
  }, [])

  const signIn = async () => {
    setSigningIn(true)
    setError('')
    const stuckTimer = setTimeout(() => {
      setError('La fenêtre de connexion ne s\'ouvre pas. Ton navigateur bloque peut-être les popups (Safari en navigation privée, bloqueur de pub…) : autorise les popups pour ce site et réessaie.')
    }, 8000)
    try {
      if (isMobile && !isStandalone) {
        await signInWithRedirect(auth, provider)
      } else {
        await signInWithPopup(auth, provider)
      }
      clearTimeout(stuckTimer)
    } catch (e) {
      clearTimeout(stuckTimer)
      setSigningIn(false)
      setError(e.message)
    }
  }

  if (!user) return <LoginScreen onSignIn={signIn} loading={signingIn || user === undefined} error={error} />
  return <FrigooApp uid={user.uid} userEmail={user.email} onSignOut={() => signOut(auth)} />
}
