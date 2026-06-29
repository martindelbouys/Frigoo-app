export default function ClearConfirmOverlay(p) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:50, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={p.closeOverlay} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.5)' }}/>
      <div style={{ position:'relative', background:'#fff', borderRadius:'28px 28px 0 0', padding:'20px 22px max(32px, env(safe-area-inset-bottom))' }}>
        <div style={{ padding:'0 0 16px', display:'flex', justifyContent:'center' }}>
          <div style={{ width:38, height:5, borderRadius:3, background:'#E2E2E2' }}/>
        </div>
        <div style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>Vider la liste ?</div>
        <div style={{ fontSize:14, fontWeight:600, color:'#6B6B6B', marginBottom:20 }}>Les articles dans le frigo seront conservés.</div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={p.closeOverlay} style={{ flex:1, border:'1.5px solid #E0E0E0', background:'#fff', color:'#6B6B6B', fontFamily:'inherit', fontSize:15, fontWeight:800, padding:'14px', borderRadius:14, cursor:'pointer' }}>Annuler</button>
          <button onClick={p.confirmClear} style={{ flex:1, border:'none', background:'#FF3B30', color:'#fff', fontFamily:'inherit', fontSize:15, fontWeight:800, padding:'14px', borderRadius:14, cursor:'pointer' }}>Vider</button>
        </div>
      </div>
    </div>
  )
}
