import { useState, useRef, useEffect } from 'react'
import { STORES } from '../data'

const EMOJIS = ['🏠','🏡','🛒','🍽️','👪','🧑‍🤝‍🧑','📝','✨','🎯','🌿','💼','🎓','🍕','🥑','🥦','🐧','❤️','🛍️','🏖️','🌈','🌟','🎁','🏋️','🎪']

export default function EditListOverlay(p) {
  const [name, setName]         = useState(p.editList?.name || '')
  const [emoji, setEmoji]       = useState(p.editList?.emoji || '📝')
  const [store, setStore]       = useState(p.editList?.store || 'Carrefour')
  const [city, setCity]         = useState(p.editList?.city || '')
  const [inviteText, setInviteText] = useState('')
  const fileRef = useRef()
  const inviteRef = useRef()

  const pendingInvites = p.editList?.pendingInvites || []

  const addInvite = () => {
    const e = inviteText.trim().toLowerCase()
    if (!e) return
    p.addInviteToList(p.editList.id, e)
    setInviteText('')
  }

  const save = () => {
    if (!name.trim()) { p.flash('Donne un nom à la liste'); return }
    p.updateList(p.editList.id, { name: name.trim(), emoji, store, city: city.trim() })
    p.closeOverlay()
  }

  return (
    <div style={{ position:'absolute', inset:0, zIndex:50, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={p.closeOverlay} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.42)' }}/>
      <div style={{ position:'relative', background:'#fff', borderRadius:'28px 28px 0 0', maxHeight:'88%', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px 0 4px', display:'flex', justifyContent:'center' }}>
          <div style={{ width:38, height:5, borderRadius:3, background:'#E2E2E2' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 22px 12px', borderBottom:'1px solid #F2F2F2', flexShrink:0 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:20, fontWeight:800 }}>Modifier la liste</div>
          </div>
          <button onClick={p.closeOverlay} style={{ width:32, height:32, flexShrink:0, border:'none', borderRadius:10, background:'#F4F4F5', color:'#6B6B6B', fontSize:18, fontWeight:700, cursor:'pointer', lineHeight:1 }}>×</button>
        </div>

        <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:'14px 18px' }}>

          {/* Photo + emoji */}
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
            <button onClick={()=>fileRef.current.click()} style={{ position:'relative', width:64, height:64, flexShrink:0, border:'none', borderRadius:18, background: p.editList?.photoURL ? 'transparent' : '#FFF4F1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, cursor:'pointer', overflow:'hidden', padding:0 }}>
              {p.editList?.photoURL
                ? <img src={p.editList.photoURL} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : <span>{emoji}</span>
              }
              <span style={{ position:'absolute', right:-3, bottom:-3, width:22, height:22, borderRadius:'50%', background:'#E8472A', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8a2 2 0 0 1 2-2h2l1.4-2h7.2L19 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3"/></svg>
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{ p.uploadListPhoto(p.editList.id, e.target.files[0]); e.target.value='' }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#9A9A9A', marginBottom:6 }}>Nom de la liste</div>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex : Coloc, Famille…" style={{ width:'100%', border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'11px 13px', fontFamily:'inherit', fontSize:15, fontWeight:700, boxSizing:'border-box' }}/>
            </div>
          </div>

          {/* Emoji picker */}
          <div style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#9A9A9A', marginBottom:8 }}>Icône</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:18 }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={()=>setEmoji(e)} style={{ width:44, height:44, border: e===emoji ? '2px solid #E8472A' : '1.5px solid #ECECEC', borderRadius:12, background: e===emoji ? '#FFF4F1' : '#fff', fontSize:22, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{e}</button>
            ))}
          </div>

          {/* Magasin */}
          <div style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#9A9A9A', marginBottom:8 }}>Magasin</div>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:18 }}>
            {STORES.map(s => (
              <button key={s.name} onClick={()=>setStore(s.name)} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 12px', border: s.name===store ? '2px solid #E8472A' : '1.5px solid #ECECEC', borderRadius:11, background: s.name===store ? '#FFF4F1' : '#fff', fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                <span>{s.emoji}</span>{s.name}
              </button>
            ))}
          </div>

          {/* Ville */}
          <div style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#9A9A9A', marginBottom:8 }}>Ville</div>
          <input value={city} onChange={e=>setCity(e.target.value)} placeholder="Ex : Lyon 7ᵉ" style={{ width:'100%', border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'11px 13px', fontFamily:'inherit', fontSize:14, fontWeight:600, boxSizing:'border-box', marginBottom:18 }}/>

          {/* Invitations */}
          <div style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#9A9A9A', marginBottom:8 }}>Membres invités</div>
          <div style={{ display:'flex', gap:8, marginBottom: pendingInvites.length ? 10 : 0 }}>
            <input
              ref={inviteRef}
              value={inviteText}
              onChange={e=>setInviteText(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&addInvite()}
              placeholder="adresse@email.com"
              inputMode="email"
              style={{ flex:1, border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'11px 13px', fontFamily:'inherit', fontSize:14, fontWeight:600 }}
            />
            <button onClick={addInvite} style={{ flexShrink:0, border:'none', background:'#15110F', color:'#fff', fontFamily:'inherit', fontSize:13, fontWeight:800, padding:'11px 14px', borderRadius:11, cursor:'pointer' }}>+ Inviter</button>
          </div>

          {pendingInvites.length > 0 && (
            <div style={{ background:'#F8F8F8', borderRadius:13, padding:'4px 8px', marginBottom:6 }}>
              {pendingInvites.map((email, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 6px', borderBottom: i < pendingInvites.length-1 ? '1px solid #EFEFEF' : 'none' }}>
                  <span style={{ fontSize:16 }}>✉️</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#15110F', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{email}</div>
                    <div style={{ fontSize:11, fontWeight:600, color:'#BDBDBD', marginTop:1 }}>En attente d'acceptation</div>
                  </div>
                  <button onClick={()=>p.removeInviteFromList(p.editList.id, email)} style={{ border:'none', background:'transparent', color:'#C8C8C8', fontSize:17, fontWeight:700, cursor:'pointer', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize:12, fontWeight:600, color:'#BDBDBD', marginTop:4, lineHeight:1.5 }}>
            La personne rejoindra automatiquement la liste à l'ouverture de Frigoo.
          </div>

        </div>

        <div style={{ flexShrink:0, padding:'12px 18px', paddingBottom:'max(26px, env(safe-area-inset-bottom))' }}>
          <button onClick={save} style={{ width:'100%', border:'none', background:'#E8472A', color:'#fff', fontFamily:'inherit', fontSize:15, fontWeight:800, padding:'15px', borderRadius:15, cursor:'pointer' }}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}
