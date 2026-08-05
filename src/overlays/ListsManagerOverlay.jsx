const EMOJIS = ['📝','🏠','🛒','🍽️','👪','🧑‍🤝‍🧑','✨','🎯','🌿','💼','🎓','🍕','🥑','🎉','🏖️','🌈']

export default function ListsManagerOverlay(p) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:45, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={p.closeOverlay} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.42)' }}/>
      <div style={{ position:'relative', background:'#fff', borderRadius:'28px 28px 0 0', maxHeight:'88%', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px 0 4px', display:'flex', justifyContent:'center' }}>
          <div style={{ width:38, height:5, borderRadius:3, background:'#E2E2E2' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 22px 12px', borderBottom:'1px solid #F2F2F2', flexShrink:0 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:20, fontWeight:800 }}>Nouvelle liste</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#9A9A9A', marginTop:1 }}>Crée et invite des membres dès maintenant.</div>
          </div>
          <button onClick={p.closeOverlay} style={{ width:32, height:32, flexShrink:0, border:'none', borderRadius:10, background:'#F4F4F5', color:'#6B6B6B', fontSize:18, fontWeight:700, cursor:'pointer', lineHeight:1 }}>×</button>
        </div>

        <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:'14px 18px' }}>

          {/* Emoji + nom */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <div style={{ width:52, height:52, flexShrink:0, borderRadius:15, background:'#FFF4F1', border:'1.5px solid #ECECEC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>{p.mgrEmoji}</div>
            <input value={p.mgrName} onChange={e=>p.setMgrName(e.target.value)} placeholder="Nom de la liste (ex : Coloc)" style={{ flex:1, border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'11px 13px', fontFamily:'inherit', fontSize:15, fontWeight:700 }} />
          </div>

          {/* Emoji picker */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:16 }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={()=>p.setMgrEmoji(e)} style={{ width:40, height:40, border: e===p.mgrEmoji ? '2px solid #E8472A' : '1.5px solid #ECECEC', borderRadius:11, background: e===p.mgrEmoji ? '#FFF4F1' : '#fff', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{e}</button>
            ))}
          </div>

          {/* Invitations */}
          <div style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#9A9A9A', marginBottom:8 }}>Inviter des membres</div>
          <div style={{ display:'flex', gap:8, marginBottom: p.mgrInviteEmails.length ? 10 : 0 }}>
            <input
              value={p.mgrInviteText}
              onChange={e=>p.setMgrInviteText(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&p.addMgrInvite()}
              placeholder="adresse@email.com"
              inputMode="email"
              style={{ flex:1, border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'11px 13px', fontFamily:'inherit', fontSize:14, fontWeight:600 }}
            />
            <button onClick={p.addMgrInvite} style={{ flexShrink:0, border:'none', background:'#15110F', color:'#fff', fontFamily:'inherit', fontSize:13, fontWeight:800, padding:'11px 14px', borderRadius:11, cursor:'pointer' }}>+ Ajouter</button>
          </div>

          {p.mgrInviteEmails.length > 0 && (
            <div style={{ background:'#F8F8F8', borderRadius:13, padding:'4px 8px', marginBottom:8 }}>
              {p.mgrInviteEmails.map((email, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 6px', borderBottom: i < p.mgrInviteEmails.length-1 ? '1px solid #EFEFEF' : 'none' }}>
                  <span style={{ fontSize:16 }}>✉️</span>
                  <span style={{ flex:1, fontSize:13, fontWeight:600, color:'#15110F' }}>{email}</span>
                  <button onClick={()=>p.setMgrInviteEmails(prev=>prev.filter((_,j)=>j!==i))} style={{ border:'none', background:'transparent', color:'#C8C8C8', fontSize:17, fontWeight:700, cursor:'pointer', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize:12, fontWeight:600, color:'#BDBDBD', marginTop:6, lineHeight:1.5 }}>
            La personne recevra une invitation à accepter dans Frigoo.
          </div>

        </div>

        <div style={{ flexShrink:0, padding:'12px 18px', paddingBottom:'max(26px, env(safe-area-inset-bottom))' }}>
          <button onClick={p.createNamedList} style={{ width:'100%', border:'none', background:'#E8472A', color:'#fff', fontFamily:'inherit', fontSize:15, fontWeight:800, padding:'15px', borderRadius:15, cursor:'pointer', opacity: p.mgrName.trim() ? 1 : 0.45 }}>
            Créer la liste{p.mgrInviteEmails.length > 0 ? ` · ${p.mgrInviteEmails.length} invitation${p.mgrInviteEmails.length>1?'s':''}` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
