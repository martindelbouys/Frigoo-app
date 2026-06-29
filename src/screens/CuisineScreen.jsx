export default function CuisineScreen(p) {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#F6F6F7', position:'relative' }}>
      <div style={{ background:'#fff', padding:'16px 16px 14px', paddingTop:'max(54px, calc(env(safe-area-inset-top) + 14px))', borderBottom:'1px solid #F0F0F0', flexShrink:0 }}>
        <div style={{ fontSize:28, fontWeight:800, letterSpacing:'-.6px', marginTop:1 }}>Recettes </div>
      </div>
      <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:'14px 16px 120px', display:'flex', flexDirection:'column', gap:12, position:'relative' }}>
        {p.recipes.map((r, i) => (
          <div key={i} style={{ flexShrink:0, background:'#fff', border:'1px solid #F0F0F0', borderRadius:20, overflow:'hidden', boxShadow:'0 1px 2px rgba(0,0,0,.04), 0 6px 20px rgba(0,0,0,.03)' }}>
            <button onClick={r.onOpen} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'10px 12px', border:'none', background:'#fff', cursor:'pointer', textAlign:'left' }}>
              <span style={{ width:44, height:44, flexShrink:0, borderRadius:13, background:'#FCF1E6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:23 }}>{r.emoji}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:800, letterSpacing:'-.3px' }}>{r.name}</div>
                <div style={{ fontSize:12, fontWeight:600, color:'#9A9A9A', marginTop:1 }}>{r.ingLabel}</div>
              </div>
              <svg width="8" height="13" viewBox="0 0 8 14" style={{ flexShrink:0 }}><path d="M1 1l6 6-6 6" stroke="#CFCFCF" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={r.onAddAll} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:9, border:'none', borderTop:'1px solid #F4F4F4', background:'#FFF7F5', color:'#E8472A', fontFamily:'inherit', fontSize:12, fontWeight:800, cursor:'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Tout ajouter à la liste
            </button>
          </div>
        ))}
      </div>
      <div style={{ position:'absolute', left:0, right:0, bottom:0, height:56, background:'linear-gradient(to bottom, rgba(246,246,247,0), #F6F6F7)', pointerEvents:'none' }}/>
      <button onClick={p.openNewRecipe} style={{ position:'absolute', right:16, bottom:20, zIndex:5, display:'flex', alignItems:'center', gap:6, border:'none', background:'#E8472A', color:'#fff', fontFamily:'inherit', fontSize:14, fontWeight:800, padding:'13px 18px', borderRadius:14, cursor:'pointer', boxShadow:'0 6px 18px rgba(232,71,42,.34)' }}>
        <span style={{ fontSize:18, lineHeight:1 }}>+</span> Nouvelle
      </button>
    </div>
  )
}
