export default function FrigoOverlay(p) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:40, background:'#F2F2F2', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'linear-gradient(180deg,#EAF4FB,#fff)', padding:'16px 16px 14px', paddingTop:'max(44px, env(safe-area-inset-top))', borderBottom:'1px solid #F0F0F0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={p.closeOverlay} style={{ width:40, height:40, flexShrink:0, border:'none', borderRadius:12, background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 3px rgba(0,0,0,.08)' }}>
            <svg width="11" height="18" viewBox="0 0 12 20" fill="none"><path d="M10 2L2 10l8 8" stroke="#404040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-.4px', color:'#15110f' }}>Dans mon frigoo,<div> il y a...</div></div>
          </div>
        </div>
      </div>
      <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:'14px 16px 24px' }}>
        {p.fridgeEmpty && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'40px 12px' }}>
            <img src="/uploads/penguin-fridge.png" alt="Frigoo" style={{ width:'100%', maxWidth:200, height:'auto', display:'block' }} />
            <div style={{ fontSize:13, fontWeight:800, marginTop:18, color:'rgba(21,17,15,0.5)' }}>Il faut que je rachète des sardines moi ...</div>
          </div>
        )}
        {p.fridgeNotEmpty && (
          <>
            <div style={{ background:'#fff', border:'1px solid #F0F0F0', borderRadius:18, overflow:'hidden' }}>
              {p.fridgeItems.map(it => (
                <div key={it.id} style={{ display:'flex', alignItems:'center', gap:11, padding:'13px 14px', borderBottom:'1px solid #F4F4F4' }}>
                  <span style={it.tileStyle}>{it.emoji}</span>
                  <span style={{ flex:1, minWidth:0, fontSize:16, fontWeight:700, color:'#15110f' }}>{it.name}</span>
                  <button onClick={it.onRebuy} style={{ flexShrink:0, border:'none', background:'#FFF4F1', color:'#E8472A', fontFamily:'inherit', fontSize:13, fontWeight:800, padding:'8px 14px', borderRadius:11, cursor:'pointer' }}>Racheter</button>
                  <button onClick={it.onRemove} style={{ flexShrink:0, border:'none', background:'transparent', color:'#C8C8C8', fontSize:18, fontWeight:700, cursor:'pointer', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'26px 0 8px' }}>
              <img src="/uploads/penguin-fridge.png" alt="Frigoo" style={{ width:'70%', maxWidth:190, height:'auto', display:'block' }} />
              <div style={{ fontSize:13, fontWeight:800, color:'rgba(0,0,0,0.5)', marginTop:10, textAlign:'center', maxWidth:300, lineHeight:1.4 }}>Mmmmm j'ai encore ce délicieux carpaccio<div>de crevettes</div></div>
            </div>
          </>
        )}
      </div>
      {p.fridgeNotEmpty && (
        <div style={{ flexShrink:0, background:'#fff', borderTop:'1px solid #EFEFEF', padding:'14px 16px', paddingBottom:'max(26px, env(safe-area-inset-bottom))' }}>
          <button onClick={p.clearFridge} style={{ width:'100%', border:'none', background:'#E8472A', color:'#fff', fontFamily:'inherit', fontSize:15, fontWeight:800, padding:'15px 22px', borderRadius:15, cursor:'pointer' }}>Vider le frigoo</button>
        </div>
      )}
    </div>
  )
}
