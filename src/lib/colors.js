export function accColor(id) {
  const seed = typeof id === 'string' ? id.charCodeAt(0)*17+id.length*31 : id
  const pal = [{bg:'#E7F7EC',fg:'#1F9D55'},{bg:'#FFF4DA',fg:'#B8860B'},{bg:'#FCEBEA',fg:'#D64535'}]
  return pal[Math.abs((seed*2654435761)>>>0) % 3]
}
