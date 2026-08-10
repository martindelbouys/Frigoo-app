function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ width:40, height:40, flexShrink:0, border:'none', borderRadius:12, background:'#F4F4F5', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="11" height="18" viewBox="0 0 12 20" fill="none"><path d="M10 2L2 10l8 8" stroke="#404040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  )
}

export default function PanierOverlay(p) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:40, background:'#F2F2F2', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#fff', padding:'16px 16px 14px', paddingTop:'max(44px, env(safe-area-inset-top))', borderBottom:'1px solid #F0F0F0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <BackBtn onClick={p.closeOverlay} />
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-.4px' }}>Dans ma liste, il y a...</div>
            {p.panierNotEmpty && <img src="/uploads/penguin-cart-full.png" alt="" style={{ height:34, width:'auto', display:'block' }} />}
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
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'32px 16px' }}>
            <img src="/uploads/penguin-cart-empty.png" alt="Frigoo" style={{ width:'100%', maxWidth:220, height:'auto', display:'block' }} />
            <div style={{ fontSize:19, fontWeight:800, marginTop:12 }}>Mon dieu, je n'ai rien prévu à manger !</div>
            <div style={{ fontSize:14, fontWeight:600, color:'#8A8A8A', marginTop:6 }}>Ajoute des articles depuis ta liste.</div>
          </div>
        )}
        {p.panierGroups.map(g => (
          <div key={g.key} style={{ marginTop:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, margin:'0 4px 8px' }}>
              <span style={{ fontSize:16 }}>{g.emoji}</span>
              <span style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#6B6B6B' }}>{g.name}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {g.items.map(it => (
                <button key={it.id} onClick={it.onToggle} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 10px', border:'1px solid #F0F0F0', borderRadius:16, background:'#fff', cursor:'pointer', textAlign:'left', minWidth:0 }}>
                  <span style={{ ...it.checkStyle, width:22, height:22 }}>
                    {it.checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </span>
                  <span style={{ ...it.tileStyle, width:30, height:30 }}>{it.emoji}</span>
                  <span style={{ ...it.nameStyle, flex:1, minWidth:0, fontSize:13, lineHeight:1.2, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{it.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {p.panierNotEmpty && (
        <div style={{ flexShrink:0, background:'#fff', borderTop:'1px solid #EFEFEF', padding:'14px 16px', paddingBottom:'max(26px, env(safe-area-inset-bottom))', display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={p.clearChecked} disabled={!p.panierHasChecked} style={{ flex:1, border:'none', background:p.panierHasChecked?'#E8472A':'#F1F1F2', color:p.panierHasChecked?'#fff':'#B7B7B7', fontFamily:'inherit', fontSize:15, fontWeight:800, padding:'15px 22px', borderRadius:15, cursor:p.panierHasChecked?'pointer':'default' }}>Retirer les articles cochés</button>
        </div>
      )}
    </div>
  )
}
