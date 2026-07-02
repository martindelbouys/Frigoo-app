function TabBtn({ active, color, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{ color: active ? color : '#A6A6A6' }}>
      {icon}
      <span className="label">{label}</span>
    </button>
  )
}

function IconListe({ active }) {
  const c = active ? '#E8472A' : '#A6A6A6'
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active?2.5:2.1} strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1.3"/><circle cx="4.5" cy="12" r="1.3"/><circle cx="4.5" cy="18" r="1.3"/></svg>
}
function IconCuisine({ active }) {
  const c = active ? '#E8472A' : '#A6A6A6'
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active?2.5:2.1} strokeLinecap="round" strokeLinejoin="round"><path d="M5 14h14l-1.2 6.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 14z"/><path d="M12 14a5 5 0 0 0 5-5 5 5 0 0 0-10 0 5 5 0 0 0 5 5z"/><line x1="12" y1="2.5" x2="12" y2="4"/></svg>
}
function IconDepenses({ active }) {
  const c = active ? '#E8472A' : '#A6A6A6'
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active?2.5:2.1} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.3" fill={c} stroke="none"/></svg>
}
function IconParams({ active }) {
  const c = active ? '#E8472A' : '#A6A6A6'
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active?2.5:2.1} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L16.2 3H11.8l-.4 2.5a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.5h4.4l.4-2.5a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5A7 7 0 0 0 19 12z"/></svg>
}

// Nav du bas — classe fg-nav : grid CSS pur, safe-area géré sans conflit inline
export default function BottomNav({ tab, goListe, goCuisine, goDepenses, goParams }) {
  return (
    <nav className="fg-nav">
      <TabBtn active={tab==='liste'}    color="#E8472A" onClick={goListe}    icon={<IconListe    active={tab==='liste'} />}    label="Liste" />
      <TabBtn active={tab==='cuisine'}  color="#E8472A" onClick={goCuisine}  icon={<IconCuisine  active={tab==='cuisine'} />}  label="Recettes" />
      <TabBtn active={tab==='depenses'} color="#E8472A" onClick={goDepenses} icon={<IconDepenses active={tab==='depenses'} />} label="Dépenses" />
      <TabBtn active={tab==='params'}   color="#E8472A" onClick={goParams}   icon={<IconParams   active={tab==='params'} />}   label="Réglages" />
    </nav>
  )
}
