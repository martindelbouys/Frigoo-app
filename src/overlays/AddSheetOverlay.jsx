export default function AddSheetOverlay(p) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:45, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={p.closeOverlay} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.42)' }}/>
      <div style={{ position:'relative', background:'#fff', borderRadius:'28px 28px 0 0', maxHeight:'78%', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px 0 4px', display:'flex', justifyContent:'center' }}>
          <div style={{ width:38, height:5, borderRadius:3, background:'#E2E2E2' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:11, padding:'6px 18px 14px', borderBottom:'1px solid #F2F2F2', flexShrink:0 }}>
          <span style={p.sheetTileStyle}>{p.sheetEmoji}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9A9A9A', textTransform:'uppercase', letterSpacing:.3 }}>Ajouter à la liste</div>
            <div style={{ fontSize:18, fontWeight:800 }}>{p.sheetCatName}</div>
          </div>
          <button onClick={p.closeOverlay} style={{ width:32, height:32, border:'none', borderRadius:10, background:'#F4F4F5', color:'#6B6B6B', fontSize:18, fontWeight:700, cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
        <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:'8px 16px' }}>
          {p.sheetItems.map((s, i) => (
            <button key={i} onClick={s.onAdd} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'12px 6px', border:'none', borderBottom:'1px solid #F4F4F4', background:'transparent', cursor:'pointer', textAlign:'left' }}>
              <span style={{ fontSize:22, width:30, textAlign:'center' }}>{s.emoji}</span>
              <span style={s.nameStyle}>{s.name}</span>
              {s.inList && <span style={{ width:30, height:30, flexShrink:0, borderRadius:9, background:'#EAF4FB', color:'#2E86C9', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>}
              {s.notInList && <span style={{ width:30, height:30, flexShrink:0, borderRadius:9, background:'#FDEDE9', color:'#E8472A', fontSize:21, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>+</span>}
            </button>
          ))}
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'14px 2px 6px' }}>
            <input value={p.sheetText} onChange={e=>p.setSheetText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&p.onSheetAdd()} placeholder="Autre article…" style={{ flex:1, border:'1.5px solid #ECECEC', outline:'none', borderRadius:12, padding:'12px 14px', fontFamily:'inherit', fontSize:15, fontWeight:600 }} />
            <button onClick={p.onSheetAdd} style={{ border:'none', background:'#15110F', color:'#fff', fontFamily:'inherit', fontSize:14, fontWeight:800, padding:'13px 16px', borderRadius:12, cursor:'pointer' }}>Ajouter</button>
          </div>
        </div>
        <div style={{ height:'max(22px, env(safe-area-inset-bottom))' }}/>
      </div>
    </div>
  )
}
