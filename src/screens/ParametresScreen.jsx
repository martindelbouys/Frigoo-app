import { useState, useRef } from 'react'
import { useTabHeaderCollapse } from '../hooks/useTabHeaderCollapse'

export default function ParametresScreen(p) {
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal]         = useState('')
  const fileRef = useRef()
  const { headerRef, onScroll } = useTabHeaderCollapse()

  const startEdit = () => { setNameVal(p.userName || ''); setEditingName(true) }
  const commitName = () => { if (nameVal.trim()) p.saveDisplayName(nameVal.trim()); setEditingName(false) }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#F2F2F2', paddingTop:'env(safe-area-inset-top)' }}>
      <div style={{ flexShrink:0, padding:'0 16px 14px', paddingTop:16, display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ fontSize:28, fontWeight:800, letterSpacing:'-.6px' }}>Paramètres</div>
        <div ref={headerRef} className="tab-header" style={{ position:'relative', width:0, height:0 }}>
          <img src="/uploads/penguin-mecano.png" alt="" style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', height:96, width:'auto', display:'block' }} />
        </div>
      </div>
      <div className="fg-scroll" onScroll={onScroll} style={{ flex:1, overflowY:'auto', padding:'16px 16px 120px' }}>

        {/* Profile card */}
        <div style={{ display:'flex', alignItems:'center', gap:14, background:'#fff', border:'1px solid #F0F0F0', borderRadius:20, padding:16 }}>
          {/* Avatar */}
          <button onClick={()=>fileRef.current.click()} style={{ position:'relative', width:58, height:58, flexShrink:0, border:'none', borderRadius:'50%', background:'#FCF1E6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, cursor:'pointer', padding:0, overflow:'hidden' }}>
            {p.userPhoto
              ? <img src={p.userPhoto} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <span>🧑‍🎓</span>
            }
            <span style={{ position:'absolute', right:-3, bottom:-3, width:24, height:24, borderRadius:'50%', background:'#E8472A', border:'2.5px solid #fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8a2 2 0 0 1 2-2h2l1.4-2h7.2L19 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3"/></svg>
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{ p.uploadPhoto(e.target.files[0]); e.target.value='' }} />

          {/* Name + email */}
          <div style={{ flex:1, minWidth:0 }}>
            {editingName ? (
              <input
                autoFocus
                value={nameVal}
                onChange={e=>setNameVal(e.target.value)}
                onBlur={commitName}
                onKeyDown={e=>{ if(e.key==='Enter') commitName(); if(e.key==='Escape') setEditingName(false) }}
                placeholder="Ton prénom…"
                style={{ width:'100%', border:'none', outline:'none', borderBottom:'2px solid #E8472A', fontFamily:'inherit', fontSize:18, fontWeight:800, background:'transparent', padding:'2px 0', boxSizing:'border-box' }}
              />
            ) : (
              <button onClick={startEdit} style={{ border:'none', background:'transparent', padding:0, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:18, fontWeight:800 }}>{p.userName || 'Mon profil'}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#BDBDBD" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            )}
            <div style={{ fontSize:13, fontWeight:600, color:'#9A9A9A', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.userEmail}</div>
          </div>

          <button onClick={p.onSignOut} style={{ border:'none', background:'#F4F4F5', color:'#C0392B', fontFamily:'inherit', fontSize:13, fontWeight:800, padding:'9px 14px', borderRadius:11, cursor:'pointer' }}>Déco.</button>
        </div>

        {/* Invitations en attente */}
        {p.invitations.length > 0 && (
          <>
            <div style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#6B6B6B', margin:'22px 4px 10px' }}>Invitations en attente</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {p.invitations.map(inv => (
                <div key={inv.id} style={{ display:'flex', alignItems:'center', gap:12, background:'#FFF4F1', border:'1.5px solid #FFD9CC', borderRadius:16, padding:14 }}>
                  <span style={{ width:44, height:44, flexShrink:0, borderRadius:13, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{inv.emoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:800 }}>{inv.name}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#9A9A9A' }}>T'invite à rejoindre cette liste</div>
                  </div>
                  <button onClick={inv.onDecline} style={{ flexShrink:0, border:'none', background:'#fff', color:'#9A9A9A', fontFamily:'inherit', fontSize:12, fontWeight:800, padding:'8px 12px', borderRadius:10, cursor:'pointer' }}>Refuser</button>
                  <button onClick={inv.onAccept} style={{ flexShrink:0, border:'none', background:'#E8472A', color:'#fff', fontFamily:'inherit', fontSize:12, fontWeight:800, padding:'8px 12px', borderRadius:10, cursor:'pointer' }}>Accepter</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* My lists */}
        <div style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#6B6B6B', margin:'22px 4px 10px' }}>Mes listes partagées</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {p.myLists.map((l, i) => (
            <div key={i} style={l.cardStyle}>
              <button onClick={l.onSelect} style={{ flex:1, minWidth:0, display:'flex', alignItems:'center', gap:12, border:'none', background:'transparent', cursor:'pointer', textAlign:'left', padding:0 }}>
                <span style={{ width:46, height:46, flexShrink:0, borderRadius:13, background:'#F4F4F5', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
                  {l.photoURL ? <img src={l.photoURL} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : l.emoji}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:16, fontWeight:800 }}>{l.name}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#9A9A9A', marginTop:2 }}>{l.subLabel}</div>
                </div>
              </button>
              <button onClick={()=>p.openEditList(l.id)} style={{ flexShrink:0, width:34, height:34, border:'none', borderRadius:10, background:'#F4F4F5', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              {l.active && <span style={{ flexShrink:0, fontSize:11, fontWeight:800, color:'#E8472A', background:'#FDEDE9', padding:'5px 10px', borderRadius:9 }}>ACTIVE</span>}
              {l.canLeave && !l.active && <button onClick={l.onLeave} style={{ flexShrink:0, border:'none', background:'#F4F4F5', color:'#C0392B', fontFamily:'inherit', fontSize:12, fontWeight:800, padding:'8px 11px', borderRadius:10, cursor:'pointer' }}>Quitter</button>}
            </div>
          ))}
          <button onClick={p.openListsMgr} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:14, border:'2px dashed #E0E0E0', borderRadius:16, background:'transparent', color:'#8A8A8A', fontFamily:'inherit', fontSize:14, fontWeight:800, cursor:'pointer' }}>
            <span style={{ fontSize:18, lineHeight:1 }}>+</span> Rejoindre ou créer une liste
          </button>
        </div>

        {/* Preferences */}
        <div style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#6B6B6B', margin:'22px 4px 10px' }}>Préférences</div>
        <div style={{ background:'#fff', border:'1px solid #F0F0F0', borderRadius:18, overflow:'hidden' }}>
          <button onClick={p.comingSoon} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 16px', border:'none', borderBottom:'1px solid #F4F4F4', background:'#fff', cursor:'pointer', textAlign:'left' }}>
            <span style={{ fontSize:18 }}>🏷️</span>
            <span style={{ flex:1, fontSize:15, fontWeight:700 }}>Catégories personnalisées</span>
            <svg width="8" height="14" viewBox="0 0 8 14"><path d="M1 1l6 6-6 6" stroke="#CFCFCF" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={p.comingSoon} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 16px', border:'none', background:'#fff', cursor:'pointer', textAlign:'left' }}>
            <span style={{ fontSize:18 }}>📍</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:700 }}>Magasins à proximité</div>
              <div style={{ fontSize:12, fontWeight:600, color:'#9A9A9A' }}>Trouve où faire tes courses</div>
            </div>
            <svg width="8" height="14" viewBox="0 0 8 14"><path d="M1 1l6 6-6 6" stroke="#CFCFCF" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* About */}
        <div style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#6B6B6B', margin:'22px 4px 10px' }}>À propos</div>
        <div style={{ background:'#fff', border:'1px solid #F0F0F0', borderRadius:18, padding:18, textAlign:'center' }}>
          <div style={{ fontSize:26, fontWeight:800, letterSpacing:'-.5px' }}>Frig<span style={{ color:'#E8472A' }}>oo</span></div>
          <div style={{ fontSize:12, fontWeight:600, color:'#9A9A9A', marginTop:4 }}>Version 1.0 · anciennement Régalade</div>
          <div style={{ fontSize:12, fontWeight:600, color:'#BDBDBD', marginTop:10 }}>La liste de courses pensée pour les budgets serrés 🐧</div>
        </div>

      </div>
    </div>
  )
}
