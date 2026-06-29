export const CATS = [
  { id:'fl',    emoji:'🥦', name:'Fruits & Légumes',     short:'Fruits & Lég.', color:'#EAF7EC' },
  { id:'fec',   emoji:'🍞', name:'Féculents & Céréales', short:'Féculents',     color:'#FBF1E3' },
  { id:'lait',  emoji:'🥛', name:'Produits Laitiers',    short:'Laitiers',      color:'#EAF2FB' },
  { id:'vp',    emoji:'🥩', name:'Viandes & Poissons',   short:'Viandes',       color:'#FBEBEC' },
  { id:'mg',    emoji:'🧈', name:'Matières Grasses',     short:'Mat. Grasses',  color:'#FCF6E3' },
  { id:'surg',  emoji:'🧊', name:'Surgelés',             short:'Surgelés',      color:'#E7F6FB' },
  { id:'bois',  emoji:'🥤', name:'Boissons',             short:'Boissons',      color:'#F0EBFB' },
  { id:'suc',   emoji:'🍫', name:'Produits Sucrés',      short:'Sucrés',        color:'#FBEDF4' },
  { id:'apero', emoji:'🍿', name:'Apéro',                short:'Apéro',         color:'#FCF0E5' },
  { id:'soin',  emoji:'🧴', name:'Soin & Santé',         short:'Soin',          color:'#E6F6F3' },
  { id:'men',   emoji:'🧹', name:'Produit Ménager',      short:'Ménager',       color:'#EFF7E4' },
  { id:'foyer', emoji:'🏠', name:'Foyer',                short:'Foyer',         color:'#F0F1F3' },
]

export const CATALOG = {
  fl:[['Bananes',1.20],['Pommes',2.10],['Tomates',1.95],['Salade',0.99],['Oignons',1.10],['Carottes',1.30],['Citrons',1.45],['Avocat',1.60],['Pommes de terre',2.50]],
  fec:[['Pâtes',0.95],['Riz',1.40],['Pain de mie',1.15],['Semoule',1.20],['Quinoa',2.80],['Lentilles',1.50],['Tortillas',1.90]],
  lait:[['Lait',0.89],['Yaourts',1.85],['Œufs',2.10],['Fromage râpé',1.95],['Crème fraîche',1.10],['Camembert',1.70],['Mozzarella',1.30]],
  vp:[['Poulet',5.40],['Steak haché',4.20],['Jambon',2.30],['Lardons',1.80],['Thon en boîte',1.60],['Saumon',6.50],['Saucisses',2.90]],
  mg:[['Beurre',1.95],["Huile d'olive",4.50],['Huile de tournesol',1.80],['Margarine',1.40]],
  surg:[['Pizzas',2.50],['Glace',2.90],['Légumes surgelés',1.95],['Frites',1.70],['Nuggets',3.10],['Poisson pané',3.40]],
  bois:[['Coca',1.50],["Jus d'orange",1.80],['Eau',0.40],['Bière',4.20],['Café',3.50],['Thé',2.10],['Sirop',2.30]],
  suc:[['Chocolat',1.65],['Biscuits',1.40],['Céréales',2.60],['Confiture',1.90],['Bonbons',1.50],['Nutella',3.20]],
  apero:[['Chips',1.80],['Cacahuètes',1.60],['Olives',1.95],['Crackers',1.70],['Saucisson',2.80],['Houmous',2.10]],
  soin:[['Dentifrice',2.20],['Gel douche',2.50],['Shampoing',2.90],['Déodorant',2.30],['Coton-tiges',1.20],['Mouchoirs',1.40]],
  men:[['Liquide vaisselle',1.30],['Éponges',1.50],['Lessive',5.20],['Sacs poubelle',2.40],['Nettoyant',2.10],['Sopalin',2.60]],
  foyer:[['Piles',4.50],['Ampoules',3.20],['Bougies',2.80],['Scotch',1.60],['Croquettes chat',6.90]],
}

export const EMOJI_MAP = {
  'Bananes':'🍌','Pommes':'🍎','Tomates':'🍅','Salade':'🥬','Oignons':'🧅','Carottes':'🥕','Citrons':'🍋','Avocat':'🥑','Pommes de terre':'🥔',
  'Pâtes':'🍝','Riz':'🍚','Pain de mie':'🍞','Semoule':'🌾','Quinoa':'🌾','Lentilles':'🫘','Tortillas':'🌮',
  'Lait':'🥛','Yaourts':'🥛','Œufs':'🥚','Fromage râpé':'🧀','Crème fraîche':'🥛','Camembert':'🧀','Mozzarella':'🧀','Parmesan':'🧀',
  'Poulet':'🍗','Steak haché':'🥩','Jambon':'🍖','Lardons':'🥓','Thon en boîte':'🐟','Thon':'🐟','Saumon':'🐟','Saucisses':'🌭',
  'Beurre':'🧈',"Huile d'olive":'🫒','Huile de tournesol':'🛢️','Margarine':'🧈',
  'Pizzas':'🍕','Glace':'🍦','Légumes surgelés':'🥦','Frites':'🍟','Nuggets':'🍗','Poisson pané':'🐟',
  'Coca':'🥤',"Jus d'orange":'🧃','Eau':'💧','Bière':'🍺','Café':'☕','Thé':'🍵','Sirop':'🧃','Lait de coco':'🥥',
  'Chocolat':'🍫','Biscuits':'🍪','Céréales':'🥣','Confiture':'🍓','Bonbons':'🍬','Nutella':'🍫',
  'Chips':'🥔','Cacahuètes':'🥜','Olives':'🫒','Crackers':'🍘','Saucisson':'🥓','Houmous':'🥣','Maïs':'🌽',
  'Dentifrice':'🪥','Gel douche':'🧴','Shampoing':'🧴','Déodorant':'🧴','Coton-tiges':'🧶','Mouchoirs':'🤧',
  'Liquide vaisselle':'🧴','Éponges':'🧽','Lessive':'🧺','Sacs poubelle':'🗑️','Nettoyant':'🧴','Sopalin':'🧻',
  'Piles':'🔋','Ampoules':'💡','Bougies':'🕯️','Scotch':'📏','Croquettes chat':'🐱',
  'Curry':'🍛','Pois chiches':'🫘','Sauce':'🥫','Cheddar':'🧀','Pesto':'🌿',
}

export const STORES = [
  { name:'Lidl',        emoji:'🟡', factor:0.88, tag:'Discount' },
  { name:'Aldi',        emoji:'🔵', factor:0.86, tag:'Discount' },
  { name:'Carrefour',   emoji:'🔴', factor:1.00, tag:'Hyper' },
  { name:'Intermarché', emoji:'🟠', factor:0.97, tag:'Super' },
  { name:'Leclerc',     emoji:'🔵', factor:0.93, tag:'Hyper' },
  { name:'Auchan',      emoji:'🟢', factor:0.98, tag:'Hyper' },
  { name:'Monoprix',    emoji:'🟣', factor:1.24, tag:'Ville' },
  { name:"Bio c'Bon",   emoji:'🟢', factor:1.42, tag:'Bio' },
]

export const INITIAL_ARTICLES = [
  { id:1,  name:'Pâtes',             cat:'fec',  price:0.95, qty:2, place:'liste', listId:'coloc' },
  { id:2,  name:'Bananes',           cat:'fl',   price:1.20, qty:1, place:'liste', listId:'coloc' },
  { id:3,  name:'Lait',              cat:'lait', price:0.89, qty:2, place:'liste', listId:'coloc' },
  { id:4,  name:'Œufs',              cat:'lait', price:2.10, qty:1, place:'liste', listId:'coloc' },
  { id:5,  name:'Poulet',            cat:'vp',   price:5.40, qty:1, place:'liste', listId:'coloc' },
  { id:6,  name:'Coca',              cat:'bois', price:1.50, qty:1, place:'liste', listId:'coloc' },
  { id:7,  name:'Chips',             cat:'apero',price:1.80, qty:1, place:'liste', listId:'coloc' },
  { id:8,  name:'Chocolat',          cat:'suc',  price:1.65, qty:1, place:'liste', listId:'coloc' },
  { id:9,  name:'Liquide vaisselle', cat:'men',  price:1.30, qty:1, place:'liste', listId:'coloc' },
  { id:10, name:'Beurre',            cat:'mg',   price:1.95, qty:1, place:'frigo', listId:'coloc' },
  { id:11, name:'Yaourts',           cat:'lait', price:1.85, qty:1, place:'frigo', listId:'coloc' },
  { id:12, name:'Salade',            cat:'fl',   price:0.99, qty:1, place:'frigo', listId:'coloc' },
  { id:13, name:'Café',              cat:'bois', price:3.50, qty:1, place:'liste', listId:'perso' },
  { id:14, name:'Dentifrice',        cat:'soin', price:2.20, qty:1, place:'liste', listId:'perso' },
  { id:15, name:'Bananes',           cat:'fl',   price:1.20, qty:1, place:'liste', listId:'perso' },
  { id:16, name:'Riz',               cat:'fec',  price:1.40, qty:1, place:'liste', listId:'famille' },
  { id:17, name:'Poulet',            cat:'vp',   price:5.40, qty:2, place:'liste', listId:'famille' },
  { id:18, name:'Yaourts',           cat:'lait', price:1.85, qty:2, place:'liste', listId:'famille' },
  { id:19, name:'Sopalin',           cat:'men',  price:2.60, qty:1, place:'liste', listId:'famille' },
]

export const INITIAL_RECIPES = [
  { id:'r1', emoji:'🍝', name:'Pâtes carbo',          ing:[['Pâtes','fec'],['Lardons','vp'],['Crème fraîche','lait'],['Œufs','lait'],['Parmesan','lait']] },
  { id:'r2', emoji:'🍛', name:'Curry de pois chiches', ing:[['Pois chiches','fec'],['Lait de coco','bois'],['Curry','foyer'],['Riz','fec'],['Oignons','fl']] },
  { id:'r3', emoji:'🍳', name:'Omelette express',      ing:[['Œufs','lait'],['Beurre','mg'],['Fromage râpé','lait']] },
  { id:'r4', emoji:'🥗', name:'Salade composée',       ing:[['Salade','fl'],['Tomates','fl'],['Thon','vp'],['Maïs','fl'],['Œufs','lait']] },
  { id:'r5', emoji:'🌮', name:'Tacos maison',          ing:[['Tortillas','fec'],['Poulet','vp'],['Cheddar','lait'],['Sauce','foyer'],['Oignons','fl']] },
]

export const INITIAL_LISTS = [
  { id:'perso',   emoji:'🙂', name:'Perso',   members:['Toi'],                        store:'Lidl',       city:'Lyon 7ᵉ' },
  { id:'coloc',   emoji:'🏠', name:'Coloc',   members:['Toi','Léa','Tom'],            store:'Carrefour',  city:'Villeurbanne' },
  { id:'famille', emoji:'👪', name:'Famille', members:['Toi','Maman','Papa','Lucie'], store:'Leclerc',    city:'Bron' },
]

export const INITIAL_EXPENSES = [
  { id:90, reason:'Courses Lidl',       emoji:'🛒', amount:42.30, dateLabel:'22 juin' },
  { id:91, reason:'Boulangerie',        emoji:'🥐', amount:6.80,  dateLabel:'21 juin' },
  { id:92, reason:'Marché du dimanche', emoji:'🥦', amount:18.50, dateLabel:'19 juin' },
  { id:93, reason:'Pharmacie',          emoji:'💊', amount:12.90, dateLabel:'17 juin' },
  { id:94, reason:'Carrefour',          emoji:'🛒', amount:61.40, dateLabel:'14 juin' },
]
