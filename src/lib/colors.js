// Le fond du prix reflète directement la fiabilité de la donnée partout dans l'app (Liste, Panier).
const RELIABILITY_COLORS = {
  green:  {bg:'#E7F7EC',fg:'#219653'}, // prix live, > 3 relevés pour cette enseigne/ville
  yellow: {bg:'#FEF9E7',fg:'#C9A227'}, // prix live, 1 à 3 relevés
  red:    {bg:'#FCEBEA',fg:'#D64535'}, // tag OFF existant mais 0 relevé pour cette enseigne/ville, prix estimé
  // Pas de donnée Open Food Facts pour ce produit (hors périmètre de l'API, ou recherche jamais
  // lancée — pas de magasin/ville défini, hors-ligne) — prix fixe du catalogue.
  grey:   {bg:'#EFEDE9',fg:'#8A8478'},
}

export function reliabilityColor(level) {
  return RELIABILITY_COLORS[level] || RELIABILITY_COLORS.red
}
