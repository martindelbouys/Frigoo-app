export default function StorePickerOverlay(p) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:45, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={p.closeOverlay} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.42)' }}/>
      <div style={{ position:'relative', background:'#fff', borderRadius:'28px 28px 0 0', maxHeight:'84%', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px 0 4px', display:'flex', justifyContent:'center' }}>
          <div style={{ width:38, height:5, borderRadius:3, background:'#E2E2E2' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 22px 12px', borderBottom:'1px solid #F2F2F2', flexShrink:0 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:20, fontWeight:800 }}>Choisir un magasin 📍</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#9A9A9A', marginTop:1 }}>Les prix s'adaptent à ton magasin.</div>
          </div>
          <button onClick={p.closeOverlay} style={{ width:32, height:32, flexShrink:0, border:'none', borderRadius:10, background:'#F4F4F5', color:'#6B6B6B', fontSize:18, fontWeight:700, cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
        <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:'12px 18px' }}>
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            <input value={p.storeCity} onChange={e=>p.setStoreCity(e.target.value)} placeholder="Ville ou quartier" style={{ flex:1, border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'10px 13px', fontFamily:'inherit', fontSize:14, fontWeight:600 }} />
            <button onClick={p.useGeoloc} style={{ flexShrink:0, border:'none', background:'#EAF4FB', color:'#2E86C9', fontFamily:'inherit', fontSize:13, fontWeight:800, padding:'10px 14px', borderRadius:11, cursor:'pointer' }}>📍 Localiser</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {p.storeOptions.map((s, i) => (
              <button key={i} onClick={s.onPick} style={s.cardStyle}>
                <span style={{ fontSize:22 }}>{s.emoji}</span>
                <div style={{ flex:1, textAlign:'left' }}>
                  <div style={{ fontSize:15, fontWeight:800 }}>{s.name}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#9A9A9A' }}>{s.tag} · {s.priceLevel}</div>
                </div>
                {s.active && <span style={{ fontSize:11, fontWeight:800, color:'#E8472A', background:'#FDEDE9', padding:'5px 10px', borderRadius:9 }}>ACTIF</span>}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height:'max(22px, env(safe-area-inset-bottom))' }}/>
      </div>
    </div>
  )
}
