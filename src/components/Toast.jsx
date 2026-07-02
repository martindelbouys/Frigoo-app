export default function Toast({ message }) {
  if (!message) return null
  return (
    <div style={{ position:'absolute', bottom:'calc(80px + env(safe-area-inset-bottom, 0px))', left:'50%', transform:'translateX(-50%)', background:'#15110F', color:'#fff', padding:'10px 18px', borderRadius:14, fontSize:14, fontWeight:700, whiteSpace:'nowrap', zIndex:200, animation:'fgToast .2s ease forwards', pointerEvents:'none' }}>
      {message}
    </div>
  )
}
