function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ width:40, height:40, flexShrink:0, border:'none', borderRadius:12, background:'#F4F4F5', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="11" height="18" viewBox="0 0 12 20" fill="none"><path d="M10 2L2 10l8 8" stroke="#404040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  )
}

export default function PanierOverlay(p) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:40, background:'#F6F6F7', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#fff', padding:'16px 16px 14px', paddingTop:'max(54px, calc(env(safe-area-inset-top) + 14px))', borderBottom:'1px solid #F0F0F0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <BackBtn onClick={p.closeOverlay} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-.4px' }}>Dans ma liste, il y a...</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:12 }}>
          <div style={{ flex:1, height:9, borderRadius:5, background:'#F1F1F2', overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:5, background:'#E8472A', width:p.panierBarPct+'%', transition:'width .25s' }}/>
          </div>
          <span style={{ fontSize:13, fontWeight:800, color:'#6B6B6B' }}>{p.panierPickedLabel}</span>
        </div>
      </div>
      <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:'8px 16px 16px' }}>
        {p.panierEmpty && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'50px 32px' }}>
            <div style={{ width:130, height:130, borderRadius:'50%', background:'#EAF4FB', border:'2px dashed #BBD9EC', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:50 }}>🐧</span>
              <span style={{ fontSize:9, fontWeight:700, color:'#8FB4CC', textTransform:'uppercase', letterSpacing:.4 }}>mascotte</span>
            </div>
            <div style={{ fontSize:19, fontWeight:800, marginTop:18 }}>Panier vide</div>
            <div style={{ fontSize:14, fontWeight:600, color:'#8A8A8A', marginTop:6 }}>Ajoute des articles depuis ta liste.</div>
          </div>
        )}
        {p.panierGroups.map(g => (
          <div key={g.key} style={{ marginTop:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, margin:'0 4px 8px' }}>
              <span style={{ fontSize:16 }}>{g.emoji}</span>
              <span style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#6B6B6B' }}>{g.name}</span>
            </div>
            <div style={{ background:'#fff', border:'1px solid #F0F0F0', borderRadius:18, overflow:'hidden' }}>
              {g.items.map(it => (
                <button key={it.id} onClick={it.onToggle} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'13px 14px', border:'none', borderBottom:'1px solid #F4F4F4', background:'#fff', cursor:'pointer', textAlign:'left' }}>
                  <span style={it.checkStyle}>
                    {it.checked && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </span>
                  <span style={it.tileStyle}>{it.emoji}</span>
                  <span style={it.nameStyle}>{it.name} {it.qtyLabel}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {p.panierNotEmpty && (
        <div style={{ flexShrink:0, background:'#fff', borderTop:'1px solid #EFEFEF', padding:'14px 16px', paddingBottom:'max(26px, env(safe-area-inset-bottom))', display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={p.askClear} style={{ flex:1, border:'none', background:'#E8472A', color:'#fff', fontFamily:'inherit', fontSize:15, fontWeight:800, padding:'15px 22px', borderRadius:15, cursor:'pointer' }}>Vider la liste</button>
        </div>
      )}
    </div>
  )
}
