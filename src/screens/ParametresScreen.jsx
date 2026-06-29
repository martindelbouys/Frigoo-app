import { useState, useEffect } from 'react'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '../firebase'

export default function ParametresScreen({ user, listId }) {
  const [showPrices, setShowPrices] = useState(true)
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')

  useEffect(() => {
    if (!user?.uid) return
    return onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        if (data.showPrices !== undefined) setShowPrices(data.showPrices)
      }
    })
  }, [user?.uid])

  const togglePrices = async () => {
    const next = !showPrices
    setShowPrices(next)
    await updateDoc(doc(db, 'users', user.uid), { showPrices: next })
  }

  const handleSignOut = () => signOut(auth)

  return (
    <div style={{ flex: 1, background: '#F6F6F7', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ background: '#fff', padding: '16px 20px 14px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.5px' }}>Paramètres</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>

        {/* Profile card */}
        <div style={{ background: '#fff', border: '1px solid #ECECEC', borderRadius: 16, padding: '14px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FFE7DF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              : '🎓'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>{user?.displayName ?? 'Utilisateur'}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#9A9A9A', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email ?? ''}</div>
          </div>
          <button
            onClick={handleSignOut}
            style={{ flexShrink: 0, border: '1px solid #ECECEC', background: '#F4F4F5', color: '#6B6B6B', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: '8px 14px', borderRadius: 10, cursor: 'pointer' }}
          >
            Modifier
          </button>
        </div>

        {/* MES LISTES */}
        <div style={{ fontSize: 12, fontWeight: 800, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 10 }}>
          Mes listes partagées
        </div>

        {/* Active list card */}
        <div style={{ background: '#fff', border: '2px solid #E8472A', borderRadius: 16, padding: '14px 16px', marginBottom: 10, boxShadow: '0 2px 8px rgba(232,71,42,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>🏠</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                <span style={{ fontSize: 16, fontWeight: 800 }}>Ma liste</span>
                <span style={{ background: '#FDEDE9', color: '#E8472A', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '.3px' }}>ACTIVE</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9A9A9A' }}>
                Toi seul · {user?.email ?? ''}
              </div>
            </div>
            <button style={{ flexShrink: 0, border: 'none', background: '#FDEDE9', color: '#E8472A', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, padding: '8px 14px', borderRadius: 10, cursor: 'pointer' }}>
              Quitter
            </button>
          </div>
        </div>

        {/* Rejoindre */}
        <button style={{ width: '100%', border: '1.5px dashed #D0D0D0', background: 'transparent', borderRadius: 14, padding: '14px', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: '#9A9A9A', cursor: 'pointer', marginBottom: 24 }}>
          + Rejoindre ou créer une liste
        </button>

        {/* PRÉFÉRENCES */}
        <div style={{ fontSize: 12, fontWeight: 800, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 10 }}>
          Préférences
        </div>

        <div style={{ background: '#fff', border: '1px solid #ECECEC', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          {/* Afficher les prix */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 16px', borderBottom: '1px solid #F4F4F4' }}>
            <span style={{ fontSize: 22 }}>💶</span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>Afficher les prix</span>
            <button
              onClick={togglePrices}
              style={{ flexShrink: 0, width: 50, height: 28, borderRadius: 14, border: 'none', background: showPrices ? '#E8472A' : '#D9D9DC', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}
            >
              <span style={{ position: 'absolute', top: 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', left: showPrices ? 25 : 3, transition: 'left .2s' }} />
            </button>
          </div>

          {/* Catégories personnalisées */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 16px', borderBottom: '1px solid #F4F4F4', cursor: 'pointer' }}>
            <span style={{ fontSize: 22 }}>📦</span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>Catégories personnalisées</span>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1l6 6-6 6" stroke="#C8C8C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Magasins */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 16px', cursor: 'pointer' }}>
            <span style={{ fontSize: 22 }}>📍</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Magasins à proximité</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9A9A9A', marginTop: 1 }}>Trouve où faire tes courses</div>
            </div>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1l6 6-6 6" stroke="#C8C8C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          style={{ width: '100%', marginTop: 24, border: 'none', background: '#F4F4F5', color: '#E8472A', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, padding: '14px', borderRadius: 14, cursor: 'pointer' }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
