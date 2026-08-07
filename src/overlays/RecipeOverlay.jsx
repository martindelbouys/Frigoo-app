export default function RecipeOverlay(p) {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:40, background:'#F2F2F2', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#fff', padding:'16px 16px 18px', paddingTop:'max(44px, env(safe-area-inset-top))', borderBottom:'1px solid #F0F0F0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={p.closeOverlay} style={{ width:40, height:40, flexShrink:0, border:'none', borderRadius:12, background:'#F4F4F5', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="11" height="18" viewBox="0 0 12 20" fill="none"><path d="M10 2L2 10l8 8" stroke="#404040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span style={{ width:54, height:54, flexShrink:0, borderRadius:16, background:'#FCF1E6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>{p.recipeEmoji}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-.5px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.recipeName}</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#9A9A9A', marginTop:2 }}>{p.recipeIngLabel}</div>
          </div>
          <button onClick={p.openEditRecipe} style={{ width:40, height:40, flexShrink:0, border:'none', borderRadius:12, background:'#F4F4F5', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onClick={p.deleteCurrentRecipe} style={{ width:40, height:40, flexShrink:0, border:'none', borderRadius:12, background:'#FDEDE9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E8472A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>

      {p.recipePhotoURL && (
        <div style={{ flexShrink:0, height:180, overflow:'hidden' }}>
          <img src={p.recipePhotoURL} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        </div>
      )}

      <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:16 }}>
        <div style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#6B6B6B', margin:'0 4px 10px' }}>Ingrédients</div>
        <div style={{ background:'#fff', border:'1px solid #F0F0F0', borderRadius:18, overflow:'hidden' }}>
          {p.recipeIngredients.map((it, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:11, padding:'13px 14px', borderBottom:'1px solid #F4F4F4' }}>
              <span style={it.tileStyle}>{it.emoji}</span>
              <span style={{ flex:1, fontSize:15, fontWeight:700 }}>{it.name}</span>
              {it.inList && <span style={{ fontSize:11, fontWeight:800, color:'#2E86C9', background:'#EAF4FB', padding:'5px 9px', borderRadius:8 }}>déjà dans la liste</span>}
            </div>
          ))}
        </div>

        {/* Recipe confirm dialogs */}
        {p.showRecipeConfirm && (
          <div style={{ marginTop:16, background:'#fff', border:'1px solid #F0F0F0', borderRadius:18, padding:18 }}>
            <div style={{ fontSize:16, fontWeight:800, marginBottom:8 }}>Ajouter « {p.pendRecipeName} » ?</div>
            <div style={{ fontSize:14, fontWeight:600, color:'#6B6B6B', marginBottom:14 }}>Les ingrédients seront ajoutés à ta liste active.</div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={p.cancelAsk} style={{ flex:1, border:'1.5px solid #E0E0E0', background:'#fff', color:'#6B6B6B', fontFamily:'inherit', fontSize:14, fontWeight:800, padding:'12px', borderRadius:12, cursor:'pointer' }}>Annuler</button>
              <button onClick={p.confirmAddStep1} style={{ flex:2, border:'none', background:'#E8472A', color:'#fff', fontFamily:'inherit', fontSize:14, fontWeight:800, padding:'12px', borderRadius:12, cursor:'pointer' }}>Tout ajouter</button>
            </div>
          </div>
        )}
      </div>
      <div style={{ flexShrink:0, background:'#fff', borderTop:'1px solid #EFEFEF', padding:'14px 16px', paddingBottom:'max(26px, env(safe-area-inset-bottom))' }}>
        <button onClick={p.addCurrentRecipe} style={{ width:'100%', border:'none', background:'#E8472A', color:'#fff', fontFamily:'inherit', fontSize:16, fontWeight:800, padding:16, borderRadius:16, cursor:'pointer', boxShadow:'0 6px 18px rgba(232,71,42,.3)' }}>Tout ajouter à la liste</button>
      </div>
    </div>
  )
}
