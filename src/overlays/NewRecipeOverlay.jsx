import { emojiOf } from '../FrigooApp'

export default function NewRecipeOverlay(p) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:45, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={p.closeOverlay} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.42)' }}/>
      <div style={{ position:'relative', background:'#fff', borderRadius:'28px 28px 0 0', maxHeight:'84%', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px 0 4px', display:'flex', justifyContent:'center' }}>
          <div style={{ width:38, height:5, borderRadius:3, background:'#E2E2E2' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 22px 12px', borderBottom:'1px solid #F2F2F2', flexShrink:0 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:20, fontWeight:800 }}>Nouvelle recette 🍽️</div>
          </div>
          <button onClick={p.closeOverlay} style={{ width:32, height:32, flexShrink:0, border:'none', borderRadius:10, background:'#F4F4F5', color:'#6B6B6B', fontSize:18, fontWeight:700, cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
        <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:'12px 18px' }}>
          <input value={p.nrName} onChange={e=>p.setNrName(e.target.value)} placeholder="Nom de la recette (ex: Pâtes carbo)" style={{ width:'100%', border:'1.5px solid #ECECEC', outline:'none', borderRadius:12, padding:'13px 14px', fontFamily:'inherit', fontSize:16, fontWeight:700, boxSizing:'border-box', marginBottom:14 }} />

          {p.nrIngredients.length > 0 && (
            <div style={{ background:'#F6F6F7', borderRadius:14, padding:'8px 4px', marginBottom:12 }}>
              {p.nrIngredients.map((ing, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px' }}>
                  <span style={{ fontSize:18 }}>{ing.emoji}</span>
                  <span style={{ flex:1, fontSize:14, fontWeight:700 }}>{ing.name}</span>
                  <button onClick={ing.onRemove} style={{ border:'none', background:'transparent', color:'#C8C8C8', fontSize:18, cursor:'pointer', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:'flex', gap:8 }}>
            <input value={p.nrText} onChange={e=>p.setNrText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&p.onNrAddIng()} placeholder="Ajouter un ingrédient…" style={{ flex:1, border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'11px 13px', fontFamily:'inherit', fontSize:14, fontWeight:600 }} />
            <button onClick={p.onNrAddIng} style={{ flexShrink:0, border:'none', background:'#15110F', color:'#fff', fontFamily:'inherit', fontSize:14, fontWeight:800, padding:'11px 16px', borderRadius:11, cursor:'pointer' }}>+ Ajouter</button>
          </div>
        </div>
        <div style={{ flexShrink:0, padding:'12px 18px', paddingBottom:'max(26px, env(safe-area-inset-bottom))' }}>
          <button onClick={p.saveNewRecipe} style={{ width:'100%', border:'none', background:'#E8472A', color:'#fff', fontFamily:'inherit', fontSize:16, fontWeight:800, padding:16, borderRadius:15, cursor:'pointer', opacity:(p.nrName.trim()&&p.nrHasIng)?1:0.45 }}>Enregistrer la recette</button>
        </div>
      </div>
    </div>
  )
}
