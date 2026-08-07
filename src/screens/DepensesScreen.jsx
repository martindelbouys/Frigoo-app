export default function DepensesScreen(p) {
  const remaining = p.budget - p.spent
  const remainColor = remaining < 0 ? '#FFE3B0' : '#fff'

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'#F2F2F2', paddingTop:'env(safe-area-inset-top)' }}>
      <div className="fg-scroll" style={{ flex:1, overflowY:'auto', padding:'16px 16px 120px' }}>

        {/* Titre + mascotte */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <div style={{ fontSize:28, fontWeight:800, letterSpacing:'-.6px' }}>Dépenses</div>
          <div style={{ position:'relative', width:0, height:0 }}>
            <img src="/uploads/penguin-abaque.png" alt="" style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', height:96, width:'auto', display:'block' }} />
          </div>
        </div>

        {/* Month selector */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', border:'1px solid #F0F0F0', borderRadius:16, padding:'10px 14px', marginBottom:12 }}>
          <button onClick={p.prevMonth} style={{ width:34, height:34, border:'none', borderRadius:10, background:'#F4F4F5', color:'#15110F', fontSize:18, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:16, fontWeight:800, letterSpacing:'-.3px', textTransform:'capitalize' }}>{p.expMonthLabel}</div>
            {p.isCurrentMonth && <div style={{ fontSize:10, fontWeight:800, color:'#E8472A', textTransform:'uppercase', letterSpacing:.4, marginTop:1 }}>Ce mois-ci</div>}
          </div>
          <button onClick={p.nextMonth} style={{ width:34, height:34, border:'none', borderRadius:10, background: p.isCurrentMonth ? '#F0F0F0' : '#F4F4F5', color: p.isCurrentMonth ? '#BDBDBD' : '#15110F', fontSize:18, fontWeight:700, cursor: p.isCurrentMonth ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
        </div>

        {/* Budget card */}
        <div style={{ borderRadius:24, padding:22, color:'#fff', boxShadow:'0 8px 22px rgba(240,130,79,.28)', background:'#e8472a' }}>
          <div style={{ fontSize:13, fontWeight:700, opacity:.85 }}>Il te reste ce mois-ci</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:8, marginTop:4 }}>
            <span style={{ fontSize:46, fontWeight:800, letterSpacing:'-1.5px', color:remainColor }}>{p.remainingLabel}</span>
            <span style={{ fontSize:15, fontWeight:700, opacity:.7 }}>/ {p.budgetLabel}</span>
          </div>
          <div style={{ height:11, borderRadius:6, background:'rgba(255,255,255,.28)', marginTop:16, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:6, background:'#fff', width:p.pct+'%' }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8, fontSize:12, fontWeight:700, opacity:.9 }}>
            <span>{p.spentLabel} dépensés</span>
          </div>
          <div style={{ height:1, background:'rgba(255,255,255,.24)', margin:'18px 0' }}/>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:15, fontWeight:800 }}>Budget mensuel</div>
            <div style={{ display:'flex', alignItems:'center', gap:0, background:'rgba(255,255,255,.22)', borderRadius:12, padding:3 }}>
              <button onClick={p.budgetDown} style={{ width:34, height:34, border:'none', background:'#fff', borderRadius:9, cursor:'pointer', fontSize:20, fontWeight:700, color:'#F0824F', lineHeight:1, boxShadow:'0 1px 3px rgba(0,0,0,.12)' }}>−</button>
              <span style={{ minWidth:96, padding:'0 6px', textAlign:'center', fontSize:16, fontWeight:800, color:'#fff', whiteSpace:'nowrap' }}>{p.budgetLabel}</span>
              <button onClick={p.budgetUp} style={{ width:34, height:34, border:'none', background:'#fff', borderRadius:9, cursor:'pointer', fontSize:18, fontWeight:700, color:'#F0824F', lineHeight:1, boxShadow:'0 1px 3px rgba(0,0,0,.12)' }}>+</button>
            </div>
          </div>
        </div>

        {/* Add expense (only on current month) */}
        {p.isCurrentMonth && (
          <>
            <div style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#6B6B6B', margin:'22px 4px 10px' }}>Ajouter une dépense</div>
            <div style={{ display:'flex', gap:8, background:'#fff', border:'1px solid #F0F0F0', borderRadius:16, padding:10, marginBottom:12 }}>
              <input value={p.expReason} onChange={e=>p.setExpReason(e.target.value)} placeholder="Motif (ex : Courses Lidl)" style={{ flex:1, minWidth:0, border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'11px 13px', fontFamily:'inherit', fontSize:14, fontWeight:600 }} />
              <input value={p.expAmount} onChange={e=>p.setExpAmount(e.target.value)} inputMode="decimal" placeholder="0,00" style={{ width:74, flexShrink:0, border:'1.5px solid #ECECEC', outline:'none', borderRadius:11, padding:'11px 10px', fontFamily:'inherit', fontSize:14, fontWeight:800, textAlign:'right' }} />
              <button onClick={p.addExpense} style={{ flexShrink:0, width:46, border:'none', background:'#E8472A', color:'#fff', borderRadius:11, fontSize:24, fontWeight:700, cursor:'pointer', lineHeight:1 }}>+</button>
            </div>
          </>
        )}

        {/* Expenses list */}
        <div style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color:'#6B6B6B', margin:'22px 4px 10px' }}>Dépenses</div>
        {p.expensesEmpty && (
          <div style={{ textAlign:'center', padding:'24px 16px', color:'#A0A0A0', fontSize:14, fontWeight:600, lineHeight:1.5 }}>Aucune dépense{p.isCurrentMonth ? ' ce mois-ci' : ' ce mois'}.<br/>{p.isCurrentMonth && 'Ajoute-en une ci-dessus 👆'}</div>
        )}
        {p.expensesNotEmpty && (
          <div style={{ background:'#fff', border:'1px solid #F0F0F0', borderRadius:18, overflow:'hidden' }}>
            {p.expenses.map((e, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:11, padding:'13px 14px', borderBottom:'1px solid #F4F4F4' }}>
                <span style={{ width:38, height:38, flexShrink:0, borderRadius:11, background:'#FFF4F1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:19 }}>{e.emoji}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:15, fontWeight:700, lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{e.reason}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#A0A0A0', marginTop:1 }}>{e.dateLabel}</div>
                </div>
                <span style={{ fontSize:16, fontWeight:800, color:'#15110F', whiteSpace:'nowrap' }}>{e.amountLabel}</span>
                <button onClick={e.onRemove} style={{ flexShrink:0, border:'none', background:'transparent', color:'#C8C8C8', fontSize:18, fontWeight:700, cursor:'pointer', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
