export function fmt(n) { return n.toFixed(2).replace('.', ',') + ' €' }

export function tileStyle(size, fs, color) {
  return { width:size, height:size, flexShrink:0, borderRadius:Math.round(size*0.29), display:'flex', alignItems:'center', justifyContent:'center', fontSize:fs, background:color }
}
