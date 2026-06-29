export default function ParametresScreen(p) {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#F6F6F7' }}>
      <div style={{ background:'#fff', padding:'16px 16px 14px', paddingTop:'max(54px, calc(env(safe-area-inset-top) + 14px))', borderBottom:'1px solid #F0F0F0', flexShrink:0 }}>
        <div style={{ fontSize:28, fontWeight:800, letterSpacing:'-.6px', marginTop:1 }}>Paramètres </div>
      </div>
      <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:'16px 16px 120px' }}>
        {/* Profile card */}
        <div style={{ display:'flex', alignItems:'center', gap:14, background:'#fff', border:'1px solid #F0F0F0', borderRadius:20, padding:16 }}>
          <button onClick={p.pickPhoto} style={{ position:'relative', width:58, height:58, flexShrink:0, border:'none', borderRadius:'50%', background:'#FCF1E6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, cursor:'pointer', padding:0 }}>
            🧑‍🎓
            <span style={{ position:'absolute', right:-3, bottom:-3, width:24, height:24, borderRadius:'50%', background:'#E8472A', border:'2.5px solid #fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8a2 2 0 0 1 2-2h2l1.4-2h7.2L19 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3"/></svg>
            </span>
          </button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800 }}>Toi</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#9A9A9A' }}>{p.userEmail}</div>
          </div>
          <button onClick={p.onSignOut} style={{ border:'none', background:'#F4F4F5', color:'#C0392B', fontFamily:'inherit', fontSize:13, fontWeight:800, padding:'9px 14px', borderRadius:11, cursor:'pointer' }}>Déco.</button>
        </div>

        {/* My lists */}
        <div style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#6B6B6B', margin:'22px 4px 10px' }}>Mes listes partagées</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {p.myLists.map((l, i) => (
            <div key={i} style={l.cardStyle}>
              <button onClick={l.onSelect} style={{ flex:1, minWidth:0, display:'flex', alignItems:'center', gap:12, border:'none', background:'transparent', cursor:'pointer', textAlign:'left', padding:0 }}>
                <span style={{ width:46, height:46, flexShrink:0, borderRadius:13, background:'#F4F4F5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{l.emoji}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:16, fontWeight:800 }}>{l.name}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#9A9A9A', marginTop:2 }}>{l.subLabel}</div>
                </div>
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
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:'1px solid #F4F4F4' }}>
            <span style={{ fontSize:18 }}>💶</span>
            <span style={{ flex:1, fontSize:15, fontWeight:700 }}>Afficher les prix</span>
            <button onClick={p.togglePrices} style={{ width:50, height:30, border:'none', borderRadius:16, cursor:'pointer', position:'relative', background:p.pricesToggleOn?'#E8472A':'#D9D9DC', padding:0 }}>
              <span style={{ position:'absolute', top:3, width:24, height:24, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.25)', left:p.pricesToggleOn?23:3, transition:'left .15s' }}/>
            </button>
          </div>
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
