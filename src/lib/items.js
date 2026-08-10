// Un article peut être sur la liste de courses (inList) et/ou au frigo
// (inFridge) indépendamment l'un de l'autre — ex: un basique qu'on vient de
// racheter reste visible au frigo (grisé) tant qu'il est encore sur la liste.
// Anciens documents n'ayant que le champ `place` sont interprétés à la volée
// pour rester compatibles sans script de migration.
export const isInList   = (a) => a.inList   !== undefined ? a.inList   : a.place === 'liste'
export const isInFridge = (a) => a.inFridge !== undefined ? a.inFridge : a.place === 'frigo'
