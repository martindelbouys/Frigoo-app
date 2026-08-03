import { useEffect } from 'react'

export default function ListeScreen(p) {
  useEffect(() => {
    if (!p.listDropOpen) return
    const close = () => p.closeListDrop()
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [p.listDropOpen])

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#F2F2F2', position:'relative', paddingTop:'env(safe-area-inset-top)' }}>
      {/* Brand header */}
      <div ref={p.brandRef} className="brand-header" style={{ background:'#FFE7DF', flexShrink:0 }}>
        <div className="brand-header-inner" style={{ position:'relative', paddingTop:14, paddingLeft:16, paddingRight:16, paddingBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Fredoka',sans-serif", fontSize:60, fontWeight:600, letterSpacing:-0.5, color:'#E8472A', lineHeight:1, marginBottom:14 }}>
            <span>frig</span>
            <img src="/uploads/frigoo-eyes.png" alt="" style={{ height:52, width:'auto', marginLeft:1, transform:'translateY(15px)', display:'block' }} />
          </div>
          <button onClick={e=>{ e.stopPropagation(); p.toggleListDrop() }} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, border:'none', background:'#fff', borderRadius:15, padding:'11px 11px 11px 13px', cursor:'pointer', textAlign:'left', boxShadow:'0 2px 10px rgba(0,0,0,.06)' }}>
            <span style={{ fontSize:26, lineHeight:1 }}>{p.activeListEmoji}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:21, fontWeight:800, letterSpacing:'-.5px', lineHeight:1.1 }}>{p.activeListName}</div>
              <div style={{ fontSize:11.5, fontWeight:700, color:'#9A9A9A', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.activeMembersLabel}</div>
            </div>
            {p.activeMembersLabel !== 'Toi seul' && <span style={{ flexShrink:0, fontSize:9, fontWeight:800, color:'#E8472A', textTransform:'uppercase', letterSpacing:.4, lineHeight:1.15, textAlign:'right', whiteSpace:'nowrap' }}>Liste partagée</span>}
            <span style={{ flexShrink:0, display:'flex', alignItems:'center', gap:5, background:'#FFF4F1', borderRadius:11, padding:'8px 12px', fontSize:13, fontWeight:800, color:'#E8472A' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: p.listDropOpen ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
              Changer
            </span>
          </button>
        </div>
      </div>

      {/* Inline list dropdown */}
      {p.listDropOpen && (
        <div style={{ background:'#FFE7DF', flexShrink:0, padding:'28px 14px 16px' }}>
          {p.myLists.map((l, i) => (
            <button key={i} onClick={e=>{ e.stopPropagation(); l.onSelect(); p.closeListDrop() }} style={{ width:'100%', display:'flex', alignItems:'center', gap:13, border:'none', borderRadius:16, background: l.active ? '#fff' : 'rgba(255,255,255,0.55)', padding:'13px 14px', cursor:'pointer', textAlign:'left', marginBottom: i < p.myLists.length - 1 ? 8 : 0, boxShadow: l.active ? '0 3px 12px rgba(232,71,42,.14)' : 'none' }}>
              <span style={{ width:42, height:42, flexShrink:0, borderRadius:13, background: l.active ? '#FDEDE9' : '#FFF4F1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{l.emoji}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:16, fontWeight:800, color:'#15110F', lineHeight:1.2 }}>{l.name}</div>
                <div style={{ fontSize:11.5, fontWeight:700, color: l.active ? '#E8472A' : '#9A9A9A', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{l.subLabel}</div>
              </div>
              {l.active && (
                <span style={{ flexShrink:0, width:26, height:26, borderRadius:8, background:'#E8472A', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="13" height="10" viewBox="0 0 13 10" fill="none"><path d="M1.5 5l3.5 3.5L11.5 1" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Search bar */}
      <div style={{ background:'#fff', padding:'12px 16px 10px', borderBottom:'1px solid #F0F0F0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#F1F1F2', borderRadius:13, padding:'0 12px', height:44 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>
          <input value={p.search} onChange={e=>p.setSearch(e.target.value)} placeholder="Rechercher ou ajouter un article…" style={{ flex:1, border:'none', outline:'none', background:'transparent', fontFamily:'inherit', fontSize:15, fontWeight:600, color:'#15110F' }} />
          {p.searching && (
            <button onClick={()=>p.setSearch('')} style={{ border:'none', background:'#D9D9DC', width:20, height:20, borderRadius:10, color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>×</button>
          )}
        </div>
      </div>

      {/* FAB buttons */}
      <button onClick={p.openFridge} style={{ position:'absolute', left:16, bottom:22, zIndex:30, width:54, height:54, border:'1px solid #E6EFF6', borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 6px 18px rgba(46,134,201,.30)' }}>
        <svg width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E86C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="5" y1="10" x2="19" y2="10"/><line x1="8.5" y1="5" x2="8.5" y2="7.5"/><line x1="8.5" y1="13.5" x2="8.5" y2="16"/></svg>
        {p.fridgeCount > 0 && <span style={{ position:'absolute', top:-4, right:-4, minWidth:20, height:20, padding:'0 5px', borderRadius:10, background:'#2E86C9', color:'#fff', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff' }}>{p.fridgeCount}</span>}
      </button>
      <button onClick={p.openPanier} style={{ position:'absolute', right:16, bottom:22, zIndex:30, width:62, height:62, border:'none', borderRadius:'50%', background:'#E8472A', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 8px 22px rgba(232,71,42,.42)' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2.2l2.3 12.1a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/></svg>
        <span style={{ position:'absolute', top:-4, right:-4, minWidth:20, height:20, padding:'0 5px', borderRadius:10, background:'#15110F', color:'#fff', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff' }}>{p.cartCount}</span>
      </button>

      {/* Search results */}
      {p.searching && (
        <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:'14px 16px 110px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#9A9A9A', textTransform:'uppercase', letterSpacing:.3, marginBottom:10 }}>Résultats</div>
          <div style={{ background:'#fff', border:'1px solid #F0F0F0', borderRadius:18, overflow:'hidden' }}>
            {p.searchResults.map((r, i) => (
              <button key={i} onClick={r.onAdd} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'13px 14px', border:'none', borderBottom:'1px solid #F4F4F4', background:'#fff', cursor:'pointer', textAlign:'left' }}>
                <span style={r.tileStyle}>{r.emoji}</span>
                <span style={{ flex:1, fontSize:15, fontWeight:700 }}>{r.name}</span>
                <span style={{ fontSize:13, fontWeight:700, color:'#9A9A9A' }}>{r.priceLabel}</span>
                <span style={{ width:30, height:30, flexShrink:0, borderRadius:9, background:'#FDEDE9', color:'#E8472A', fontSize:21, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>+</span>
              </button>
            ))}
            <button onClick={p.onAddCustom} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:14, border:'none', background:'#FFFBFA', cursor:'pointer', textAlign:'left' }}>
              <span style={{ width:38, height:38, flexShrink:0, borderRadius:11, background:'#E8472A', color:'#fff', fontSize:24, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>+</span>
              <span style={{ flex:1, fontSize:15, fontWeight:700 }}>Ajouter « {p.search} »</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#B5B5B5' }}>Foyer</span>
            </button>
          </div>
        </div>
      )}

      {/* Main list content */}
      {!p.searching && (
        <div ref={p.scrollRef} className="fg-scroll" onScroll={p.onListScroll} style={{ flex:1, overflowY:'auto' }}>
          {/* Store picker */}
          <button onClick={p.openStorePicker} style={{ width:'calc(100% - 32px)', margin:'14px 16px 0', display:'flex', alignItems:'center', gap:11, border:'1px solid #ECECEC', background:'#fff', borderRadius:14, padding:'11px 13px', cursor:'pointer', textAlign:'left', boxShadow:'0 1px 2px rgba(0,0,0,.03)' }}>
            <span style={{ width:36, height:36, flexShrink:0, borderRadius:11, background:'#EAF4FB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>📍</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#9A9A9A' }}>Magasin de cette liste</div>
              <div style={{ fontSize:15, fontWeight:800, lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.activeStoreLabel}</div>
            </div>
            <span style={{ flexShrink:0, display:'flex', alignItems:'center', gap:5, background:'#FFF4F1', color:'#E8472A', borderRadius:11, padding:'8px 12px', fontSize:13, fontWeight:800 }}>Changer</span>
          </button>

          {/* Category pills */}
          <div className="fg-scroll" style={{ position:'sticky', top:0, zIndex:12, display:'flex', gap:8, overflowX:'auto', padding:'12px 16px 11px', background:'#F2F2F2', borderBottom:'1px solid #ECECEC' }}>
            {p.categories.map((c, i) => (
              <button key={i} onClick={c.onOpen} style={{ flexShrink:0, display:'flex', alignItems:'center', gap:7, padding:'8px 13px 8px 9px', border:'1px solid #ECECEC', borderRadius:13, background:'#fff', cursor:'pointer', boxShadow:'0 1px 2px rgba(0,0,0,.03)' }}>
                <span style={c.tileStyle}>{c.emoji}</span>
                <span style={{ fontSize:13, fontWeight:700, whiteSpace:'nowrap' }}>{c.shortName}</span>
              </button>
            ))}
          </div>

          {/* Empty state */}
          {p.listEmpty && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'32px 16px' }}>
              <img src="/uploads/penguin-writing.png" alt="Frigoo" style={{ width:'100%', maxWidth:154, height:'auto', display:'block' }} />
              <div style={{ fontSize:13, fontWeight:800, marginTop:8, color:'rgba(21,17,15,0.5)' }}>Meilleur moment de ma journée :<div>réfléchir à quoi manger !!</div></div>
            </div>
          )}

          {/* List groups */}
          <div style={{ padding:'8px 16px 160px' }}>
            {p.listGroups.map(g => (
              <div key={g.key} style={{ marginTop:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, margin:'0 4px 8px' }}>
                  <span style={{ fontSize:16 }}>{g.emoji}</span>
                  <span style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#6B6B6B' }}>{g.name}</span>
                </div>
                <div style={{ background:'#fff', border:'1px solid #F0F0F0', borderRadius:18, overflow:'hidden', boxShadow:'0 1px 2px rgba(0,0,0,.03)' }}>
                  {g.items.map(it => (
                    <div key={it.id} style={{ position:'relative', overflow:'hidden', borderBottom:'1px solid #F4F4F4' }}>
                      {/* Swipe bg left (delete) */}
                      <div style={{ position:'absolute', inset:0, background:'#FF3B30', visibility:'hidden', display:'flex', alignItems:'center', gap:8, paddingLeft:18 }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        <span style={{ fontSize:12, fontWeight:800, color:'#fff', letterSpacing:.2 }}>Supprimer</span>
                      </div>
                      {/* Swipe bg right (fridge) */}
                      <div style={{ position:'absolute', inset:0, background:'#2E86C9', visibility:'hidden', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:8, paddingRight:18 }}>
                        <span style={{ fontSize:12, fontWeight:800, color:'#fff', letterSpacing:.2 }}>Frigo</span>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="5" y1="10" x2="19" y2="10"/><line x1="8.5" y1="5" x2="8.5" y2="7.5"/><line x1="8.5" y1="13.5" x2="8.5" y2="16"/></svg>
                      </div>
                      {/* Item row */}
                      <div onMouseDown={it.onSwipeStart} onTouchStart={it.onSwipeStart} onTouchMove={it.onTouchMove} onTouchEnd={it.onTouchEnd} style={{ display:'flex', alignItems:'center', gap:9, padding:'11px 12px', background:'#fff', position:'relative', zIndex:1, touchAction:'pan-y', userSelect:'none', cursor:'grab' }}>
                        <span style={it.tileStyle}>{it.emoji}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:15, fontWeight:700, lineHeight:1.2 }}>{it.name}</div>
                          {it.hasPrice && (
                            <div style={{ marginTop:4 }}><span style={it.priceBadgeStyle} title={it.priceTierTitle}>{it.priceLabel}</span></div>
                          )}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <button onClick={it.onDec} style={{ width:30, height:30, border:'none', borderRadius:9, background:'#EBEBEB', cursor:'pointer', fontSize:18, fontWeight:700, color:'#6B6B6B', lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                          <span style={{ minWidth:16, textAlign:'center', fontSize:14, fontWeight:800 }}>{it.qty}</span>
                          <button onClick={it.onInc} style={{ width:30, height:30, border:'none', borderRadius:9, background:'#E8472A', cursor:'pointer', fontSize:17, fontWeight:700, color:'#fff', lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
