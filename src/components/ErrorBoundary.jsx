import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { crashed: false }

  static getDerivedStateFromError() {
    return { crashed: true }
  }

  componentDidCatch(error, info) {
    console.error('Crash rendu React :', error, info)
  }

  render() {
    if (!this.state.crashed) return this.props.children
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100svh', gap:20, padding:32, background:'#F2F2F2', fontFamily:"'Plus Jakarta Sans', -apple-system, system-ui, sans-serif", textAlign:'center' }}>
        <div style={{ fontFamily:"'Fredoka', sans-serif", fontSize:48, fontWeight:600, color:'#E8472A', letterSpacing:-1 }}>frigoo</div>
        <div style={{ fontSize:16, fontWeight:700, color:'#15110F' }}>Oups, une erreur est survenue</div>
        <div style={{ fontSize:14, color:'#9A9A9A', maxWidth:280 }}>Recharge la page pour continuer. Si ça se reproduit, dis-le à Martin.</div>
        <button
          onClick={() => window.location.reload()}
          style={{ background:'#E8472A', color:'#fff', border:'none', borderRadius:16, padding:'14px 28px', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}
        >
          Recharger
        </button>
      </div>
    )
  }
}
