export default function ListsManagerOverlay(p) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:45, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={p.closeOverlay} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.42)' }}/>
      <div style={{ position:'relative', background:'#fff', borderRadius:'28px 28px 0 0', maxHeight:'84%', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px 0 4px', display:'flex', justifyContent:'center' }}>
          <div style={{ width:38, height:5, borderRadius:3, background:'#E2E2E2' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 22px 12px', borderBottom:'1px solid #F2F2F2', flexShrink:0 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:20, fontWeight:800 }}>Mes listes 👥</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#9A9A9A', marginTop:1 }}>Choisis, rejoins ou crée une liste partagée.</div>
          </div>
          <button onClick={p.closeOverlay} style={{ width:32, height:32, flexShrink:0, border:'none', borderRadius:10, background:'#F4F4F5', color:'#6B6B6B', fontSize:18, fontWeight:700, cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
        <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:'12px 18px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {p.myLists.map((l, i) => (
              <div key={i} style={l.cardStyle}>
                <button onClick={l.onSelect} style={{ flex:1, minWidth:0, display:'flex', alignItems:'center', gap:12, border:'none', background:'transparent', cursor:'pointer', textAlign:'left', padding:0 }}>
                  <span style={{ width:44, height:44, flexShrink:0, borderRadius:12, background:'#F4F4F5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{l.emoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:800 }}>{l.name}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#9A9A9A' }}>{l.membersLabel}</div>
                  </div>
                </button>
                {l.active && <span style={{ flexShrink:0, fontSize:11, fontWeight:800, color:'#E8472A', background:'#FDEDE9', padding:'5px 10px', borderRadius:9 }}>ACTIVE</span>}
                {l.canLeave && !l.active && <button onClick={l.onLeave} style={{ flexShrink:0, border:'none', background:'#F4F4F5', color:'#C0392B', fontFamily:'inherit', fontSize:12, fontWeight:800, padding:'8px 11px', borderRadius:10, cursor:'pointer' }}>Quitter</button>}
              </div>
            ))}
          </div>

          <div style={{ marginTop:18 }}>
            <div style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#9A9A9A', marginBottom:10 }}>Rejoindre avec un code</div>
            <div style={{ display:'flex', gap:8 }}>
              <input value={p.mgrCode} onChange={e=>p.setMgrCode(e.target.value)} placeholder="Code d'invitation (ex: FRIG-XXXX)" style={{ flex:1, border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'11px 13px', fontFamily:'inherit', fontSize:14, fontWeight:600 }} />
              <button onClick={p.joinByCode} style={{ flexShrink:0, border:'none', background:'#15110F', color:'#fff', fontFamily:'inherit', fontSize:14, fontWeight:800, padding:'11px 16px', borderRadius:11, cursor:'pointer' }}>Rejoindre</button>
            </div>
          </div>

          <div style={{ marginTop:18 }}>
            <div style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#9A9A9A', marginBottom:10 }}>Créer une nouvelle liste</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <input value={p.mgrName} onChange={e=>p.setMgrName(e.target.value)} placeholder="Nom de la liste (ex: Coloc)" style={{ border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'11px 13px', fontFamily:'inherit', fontSize:14, fontWeight:600 }} />
              <div style={{ display:'flex', gap:8 }}>
                <select value={p.mgrStore} onChange={e=>p.setMgrStore(e.target.value)} style={{ flex:1, border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'11px 13px', fontFamily:'inherit', fontSize:14, fontWeight:600, background:'#fff' }}>
                  {p.storeNames.map(s => <option key={s}>{s}</option>)}
                </select>
                <input value={p.mgrCity} onChange={e=>p.setMgrCity(e.target.value)} placeholder="Ville" style={{ flex:1, border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'11px 13px', fontFamily:'inherit', fontSize:14, fontWeight:600 }} />
              </div>
              <button onClick={p.createNamedList} style={{ border:'none', background:'#E8472A', color:'#fff', fontFamily:'inherit', fontSize:14, fontWeight:800, padding:'13px', borderRadius:12, cursor:'pointer', boxShadow:'0 4px 12px rgba(232,71,42,.3)' }}>Créer la liste</button>
            </div>
          </div>
        </div>
        <div style={{ height:'max(22px, env(safe-area-inset-bottom))' }}/>
      </div>
    </div>
  )
}
