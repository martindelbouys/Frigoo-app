import { useState, useRef } from 'react'
import { catalogCat, emojiOf } from '../lib/catalog'

const EMOJIS = ['🍽️','🍕','🍝','🥗','🍲','🥘','🫕','🍜','🍛','🥙','🌮','🫔','🥪','🍱','🥞','🧆','🍳','🥚','🫛','🥦','🍖','🍗','🐟','🍰','🎂','🍮']

export default function EditRecipeOverlay(p) {
  const r = p.editRecipe
  const [name, setName]   = useState(r?.name || '')
  const [emoji, setEmoji] = useState(r?.emoji || '🍽️')
  const [ing, setIng]     = useState(r?.ing || [])
  const fileRef = useRef()

  if (!r) return null

  const addIng = () => {
    const n = p.nrText.trim()
    if (!n) return
    const cat = catalogCat(n) || 'foyer'
    setIng(prev => [...prev, { name: n, cat }])
    p.setNrText('')
  }

  const pickSugg = (s) => {
    setIng(prev => [...prev, { name: s.name, cat: s.cat }])
    p.setNrText('')
  }

  const save = () => {
    const nm = name.trim()
    if (!nm) return
    if (!ing.length) return
    p.updateRecipe(r.id, { name: nm, emoji, ing: ing.map(i => ({ name: i.name, cat: i.cat })) })
  }

  return (
    <div style={{ position:'absolute', inset:0, zIndex:50, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={p.closeOverlay} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.42)' }}/>
      <div style={{ position:'relative', background:'#fff', borderRadius:'28px 28px 0 0', maxHeight:'88%', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px 0 4px', display:'flex', justifyContent:'center' }}>
          <div style={{ width:38, height:5, borderRadius:3, background:'#E2E2E2' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 22px 12px', borderBottom:'1px solid #F2F2F2', flexShrink:0 }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:46, height:46, flexShrink:0, borderRadius:13, background:'#FCF1E6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>{emoji}</div>
            <div style={{ fontSize:20, fontWeight:800 }}>Modifier la recette</div>
          </div>
          <button onClick={p.closeOverlay} style={{ width:32, height:32, flexShrink:0, border:'none', borderRadius:10, background:'#F4F4F5', color:'#6B6B6B', fontSize:18, fontWeight:700, cursor:'pointer', lineHeight:1 }}>×</button>
        </div>

        <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:'12px 18px' }}>

          {/* Emoji picker */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={()=>setEmoji(e)} style={{ width:38, height:38, border: e===emoji ? '2px solid #E8472A' : '1.5px solid #ECECEC', borderRadius:10, background: e===emoji ? '#FFF4F1' : '#fff', fontSize:19, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{e}</button>
            ))}
          </div>

          {/* Nom */}
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom de la recette" style={{ width:'100%', border:'1.5px solid #ECECEC', outline:'none', borderRadius:12, padding:'13px 14px', fontFamily:'inherit', fontSize:16, fontWeight:700, boxSizing:'border-box', marginBottom:14 }} />

          {/* Photo */}
          <button onClick={()=>fileRef.current.click()} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', border:'1.5px solid #ECECEC', borderRadius:12, padding:'11px 14px', background: r.photoURL ? '#F8F8F8' : '#fff', cursor:'pointer', marginBottom:14, boxSizing:'border-box' }}>
            {r.photoURL
              ? <img src={r.photoURL} alt="" style={{ width:36, height:36, borderRadius:8, objectFit:'cover' }}/>
              : <span style={{ fontSize:22 }}>📷</span>
            }
            <span style={{ fontSize:13, fontWeight:700, color:'#6B6B6B' }}>{r.photoURL ? 'Changer la photo' : 'Ajouter une photo'}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{ p.uploadRecipePhoto(r.id, e.target.files[0]); e.target.value='' }}/>

          {/* Ingrédients */}
          <div style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#9A9A9A', marginBottom:8 }}>Ingrédients</div>

          {ing.length > 0 && (
            <div style={{ background:'#F2F2F2', borderRadius:14, padding:'8px 4px', marginBottom:12 }}>
              {ing.map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px' }}>
                  <span style={{ fontSize:18 }}>{emojiOf(item.name)}</span>
                  <span style={{ flex:1, fontSize:14, fontWeight:700 }}>{item.name}</span>
                  <button onClick={()=>setIng(prev=>prev.filter((_,j)=>j!==i))} style={{ border:'none', background:'transparent', color:'#C8C8C8', fontSize:18, cursor:'pointer', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ position:'relative' }}>
            <div style={{ display:'flex', gap:8 }}>
              <input value={p.nrText} onChange={e=>p.setNrText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addIng()} placeholder="Ajouter un ingrédient…" style={{ flex:1, border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'11px 13px', fontFamily:'inherit', fontSize:14, fontWeight:600 }} />
              <button onClick={addIng} style={{ flexShrink:0, border:'none', background:'#15110F', color:'#fff', fontFamily:'inherit', fontSize:14, fontWeight:800, padding:'11px 16px', borderRadius:11, cursor:'pointer' }}>+ Ajouter</button>
            </div>
            {p.nrSuggestions.length > 0 && (
              <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'#fff', border:'1px solid #ECECEC', borderRadius:13, overflow:'hidden', zIndex:10, boxShadow:'0 4px 16px rgba(0,0,0,.1)' }}>
                {p.nrSuggestions.map((s, i) => (
                  <button key={i} onMouseDown={e=>{e.preventDefault();pickSugg(s)}} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', border:'none', borderBottom:'1px solid #F4F4F4', background:'#fff', cursor:'pointer', textAlign:'left', fontFamily:'inherit' }}>
                    <span style={{ fontSize:18, width:26, textAlign:'center' }}>{s.emoji}</span>
                    <span style={{ fontSize:14, fontWeight:700 }}>{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ flexShrink:0, padding:'12px 18px', paddingBottom:'max(26px, env(safe-area-inset-bottom))' }}>
          <button onClick={save} style={{ width:'100%', border:'none', background:'#E8472A', color:'#fff', fontFamily:'inherit', fontSize:16, fontWeight:800, padding:16, borderRadius:15, cursor:'pointer', opacity:(name.trim()&&ing.length)?1:0.45 }}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}
