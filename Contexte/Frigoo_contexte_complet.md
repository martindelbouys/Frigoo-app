# Frigoo — Contexte complet de l'application

Document unique à donner à Claude Code en début de session. Il remplace les deux fichiers précédents (`contexte_application_frigoo.md` et `prompt_claude_code_onglet_liste.md`), fusionnés et détaillés ici.

---

## 1. Contexte général

### Positionnement & cibles

Frigoo est une appli mobile de liste de courses + budget, pensée pour les budgets serrés : étudiants et jeunes actifs, jeunes couples qui font leurs prévisions de budget ensemble, familles qui suivent leurs dépenses de près. La liste étant partagée, elle marche aussi bien en colocation (chacun a accès et ajoute ce qu'il veut) que ponctuellement pour un voyage ou des vacances entre amis — mutualiser une liste de courses avant de partir, ou avant d'arriver dans un Airbnb par exemple.

### Stack technique

React + Vite, Firebase (Auth Google via `signInWithRedirect`, pas `signInWithPopup` — la popup cassait sur mobile — + Firestore), déployé sur Netlify (`lovely-biscotti-d1cdc0.netlify.app`), repo GitHub `martindelbouys/Frigoo-app`. Firestore : collections `users` et `lists`, sous-collection `lists/{id}/items`, règles de sécurité qui vérifient le `uid` contre un tableau `members`. Packaging futur prévu via Capacitor pour App Store / Google Play (pas de réécriture en React Native).

### Navigation

4 onglets en bas : **Liste**, **Cuisine** (= Recettes), **Dépenses**, **Réglages**. Pas d'onglet "Partage" séparé : le partage est une propriété par liste, accessible via un bottom sheet.

### Maquette de référence

Un fichier `Frigoo.html` (export de l'outil de design de Claude) existe comme référence. **Important : ce n'est pas du HTML/JSX à copier tel quel.** Il utilise une syntaxe propriétaire (`sc-if`, `sc-for`, `{{ }}`, `x-import`...) qui ne s'exécute pas dans une vraie app React — ignore ces balises. Utilise-le comme référence visuelle (styles inline, couleurs, textes exacts) et comme référence de logique : tout en bas du fichier, dans la balise `<script type="text/x-dc">`, il y a un vrai pseudo-code JS (state, handlers de swipe, calculs de prix) qui décrit fidèlement le comportement attendu — traduis-le en composants React/hooks standards, sans copier la syntaxe de classe `DCLogic`. Place ce fichier dans le repo (ex. `design/Frigoo-reference.html`) avant de commencer.

### Identité visuelle

Accent `#E8472A`, texte `#15110F`, police Plus Jakarta Sans (graisses 400 à 800), fond blanc, cartes blanches, une seule couleur d'accent. Inspiration : la structure d'Uber Eats + la chaleur de Duolingo.

### Mascotte

Un pingouin dodu, corps bleu marine, ventre et masque autour des yeux blanc cassé, bec et pattes orange-rouge. Personnalité "étudiant stressé", avec des expressions qui changent selon les moments de l'app (ex. liste vide, frigo vide). Chantier pas encore fait : produire un jeu d'illustrations 2D **fixes** de la mascotte (pas d'animation, pas de mouvement) dans différentes poses/actions associées à des moments précis de l'app — c'est ce qui doit apporter le côté rigolo. Ne génère pas ces illustrations sans validation du design, ce point se travaille à part.

*Note : tu l'as appelée "Fribourg" dans un message — je suppose une coquille de dictée vocale pour "Frigo". À confirmer avant que ça se retrouve dans du code ou des textes.*

### Logique d'estimation des prix (encore en réflexion — ne pas figer en dur)

Le prix affiché doit venir d'une base de données externe interrogée via une clé API, qui référence des prix par marque de produit, enseigne (magasin) et localisation. Le badge couleur sur le prix doit refléter la qualité de la correspondance trouvée, sur trois critères : marque, enseigne, localisation.

Hypothèse de travail actuelle (à affiner, pas définitive) :
- vert : la donnée trouvée correspond bien sur les critères qui comptent (même marque, même enseigne, à proximité)
- orange : correspondance partielle (ex. même marque et même zone, mais enseigne différente, ou un peu loin)
- rouge : un seul critère correspond, ou aucun, ou la donnée la plus proche est trop loin géographiquement

Code ça comme une fonction de scoring isolée et facile à modifier, pas une règle figée dans l'affichage — les seuils et la pondération des critères vont bouger. Dans l'écran Liste actuel, le badge couleur est un simple placeholder pseudo-aléatoire en attendant ce travail.

Limites déjà identifiées (Open Prices / Open Food Facts) : la densité de données par enseigne est inégale en France ; un simple facteur multiplicateur par type de magasin (discount/hyper/bio...) est trop imprécis pour être généralisé ; les produits non-alimentaires (hygiène, entretien) sont hors du périmètre de cette base et relèveraient d'Open Products Facts à la place.

---

## 2. Onglet Liste

### 2.1 En-tête

Bandeau supérieur (fond pêche `#FFE7DF`) avec le logo "frig" + icône, puis une carte blanche flottante affichant :
- l'emoji de la liste active + son nom (gros, 21px/800)
- en dessous, les membres séparés par des virgules (gris, 11.5px)
- à droite, le badge "Liste partagée" (texte accent, majuscules, 9px)

Boutons de cette zone :
- **bouton "Changer"** (pilule, icône + texte, fond `#FFF4F1`, couleur accent) → ouvre l'overlay **Gestion des listes** (section 2.7)

### 2.2 Recherche / ajout d'article

Barre de recherche séparée (fond blanc, toujours visible, pas dans la zone scrollable) : pilule grise `#F1F1F2`, icône loupe, placeholder *"Rechercher ou ajouter un article…"*.

Boutons de cette zone :
- **bouton croix** dans le champ → efface la saisie
- quand le champ contient du texte, chaque résultat affiché a un **bouton "+"** → ajoute l'article à la liste
- une ligne *"Ajouter « {texte saisi} »"* est toujours affichée sous les résultats → ajoute un article libre (catégorie par défaut Foyer, prix par défaut 1,50 € si inconnu)

Logique de recherche : filtre le catalogue sur les noms contenant la saisie (insensible à la casse, dédupliqué, max ~14 résultats).

### 2.3 Magasin de la liste (estimation de prix)

Hors mode recherche, juste sous la barre de recherche : un bouton affichant l'enseigne + la ville actuelles (ex. *📍 Carrefour · Villeurbanne*, ou *"Aucun magasin"* si non défini). Ce bloc fait partie du contenu scrollable et disparaît au scroll (contrairement à la barre de catégories, sticky).

Boutons de cette zone :
- **bouton "Changer"** → ouvre l'overlay **Magasin** (section 2.8)

Chaque magasin a un facteur multiplicateur appliqué au prix catalogue de chaque article (ex. Lidl ×0.88, Carrefour ×1.00, Monoprix ×1.24...) — estimation simple en attendant Open Prices.

### 2.4 Barre de catégories

Rangée horizontale scrollable et **sticky** (reste collée en haut pendant le scroll de la liste), avec les 12 catégories fixes sous forme de chips (emoji + nom court).

Boutons de cette zone :
- **chip de catégorie** (×12, tap) → ouvre un bottom sheet listant les articles courants de cette catégorie (nom, prix, et soit "déjà dans la liste" soit un **bouton "+"**), plus un champ de saisie libre pour ajouter un article non listé

**Les 12 catégories sont fixes et à plat — ce ne sont pas des sous-catégories, n'introduis pas de hiérarchie à deux niveaux :**

```js
const categories = [
  { id: 'fl',    emoji: '🥦', name: 'Fruits & Légumes',     short: 'Fruits & Lég.', color: '#EAF7EC' },
  { id: 'fec',   emoji: '🍞', name: 'Féculents & Céréales', short: 'Féculents',     color: '#FBF1E3' },
  { id: 'lait',  emoji: '🥛', name: 'Produits Laitiers',    short: 'Laitiers',      color: '#EAF2FB' },
  { id: 'vp',    emoji: '🥩', name: 'Viandes & Poissons',   short: 'Viandes',       color: '#FBEBEC' },
  { id: 'mg',    emoji: '🧈', name: 'Matières Grasses',     short: 'Mat. Grasses',  color: '#FCF6E3' },
  { id: 'surg',  emoji: '🧊', name: 'Surgelés',             short: 'Surgelés',      color: '#E7F6FB' },
  { id: 'bois',  emoji: '🥤', name: 'Boissons',             short: 'Boissons',      color: '#F0EBFB' },
  { id: 'suc',   emoji: '🍫', name: 'Produits Sucrés',      short: 'Sucrés',        color: '#FBEDF4' },
  { id: 'apero', emoji: '🍿', name: 'Apéro',                short: 'Apéro',         color: '#FCF0E5' },
  { id: 'soin',  emoji: '🧴', name: 'Soin & Santé',         short: 'Soin',          color: '#E6F6F3' },
  { id: 'men',   emoji: '🧹', name: 'Produit Ménager',      short: 'Ménager',       color: '#EFF7E4' },
  { id: 'foyer', emoji: '🏠', name: 'Foyer',                short: 'Foyer',         color: '#F0F1F3' },
];
```

### 2.5 Liste des articles + swipe

Les articles sont regroupés par catégorie (uniquement celles qui ont des articles, dans l'ordre fixe ci-dessus), chaque groupe = petit titre (emoji + nom catégorie en gris) + carte blanche arrondie contenant les lignes.

Chaque ligne affiche : tuile emoji (couleur = couleur de la catégorie), nom, badge prix (pastille vert/orange/rouge — placeholder pour l'instant, voir section 1).

Boutons / gestes de chaque ligne :
- **stepper quantité (− / qty / +)** à droite → décrémenter à 1 supprime la ligne
- **swipe vers la droite** (de gauche à droite) → révèle un panneau rouge "Supprimer" (icône poubelle) ; au-delà d'un seuil de drag (~72px), la ligne part vers la droite et l'article est supprimé de la liste
- **swipe vers la gauche** (de droite à gauche) → révèle un panneau bleu "Frigo" (icône frigo) ; au-delà du même seuil, l'article passe en statut "frigo" (quitte la liste de courses, apparaît dans l'overlay Frigo)
- sous le seuil de drag, la ligne revient à sa position (animation spring-back)
- si le mouvement est plus vertical qu'horizontal (>8px), le swipe est annulé pour laisser le scroll vertical se faire normalement

### 2.6 Boutons flottants (FAB) et comportement de scroll

Deux boutons ronds flottants, superposés en bas de l'écran, au-dessus du contenu scrollable :
- **FAB bleu, bas gauche** (54×54, icône frigo) → ouvre l'overlay **Frigo** (section 2.9), badge = nombre d'articles déjà au frigo
- **FAB accent, bas droite** (62×62, icône caddie) → ouvre l'overlay **Panier** (section 2.10), badge = nombre d'articles dans la liste active

Comportement de scroll : au scroll vers le bas, le bandeau du haut (logo + carte liste active) **rétrécit progressivement** (hauteur ~130px → ~46px, contenu qui se fade en opacité) sur les premiers ~190px de scroll, plutôt que de disparaître brutalement. La barre de recherche et les deux FAB restent fixes et visibles en permanence. La barre de catégories devient sticky en haut de la zone de liste une fois le bouton "magasin" scrollé hors champ. Si l'animation progressive est trop coûteuse dans un premier temps, une version simplifiée (masquage brut sans interpolation) est acceptable, mais la version progressive donne le rendu "premium" de la maquette.

### 2.7 Overlay Gestion des listes

Ouvert par le bouton "Changer" de l'en-tête. Bottom sheet, titre *"Mes listes 👥"* + sous-titre *"Choisis, rejoins ou crée une liste partagée."*

Contenu et boutons :
- cartes de listes existantes (emoji, nom, sous-titre "{membres} · 📍 {magasin}", nombre d'articles, pastille "ACTIVE" sur la liste courante) — **tap sur une carte** → l'active
- **bouton "Quitter"** sur les listes non actives (visible seulement s'il reste plus d'une liste)
- bloc "Rejoindre avec un code" : champ + **bouton "Rejoindre"**
- bloc "Créer une nouvelle liste" : photo optionnelle, nom, ville, select magasin (défaut "Carrefour") + **bouton "Créer la liste"**
- **bouton "Inviter sur « {nom} »"** → ouvre un partage simple (code + lien à copier)

### 2.8 Overlay Magasin

Ouvert par le bouton "Changer" du bloc magasin. Bottom sheet, titre *"Magasin & localisation 📍"* + sous-titre *"Les prix de « {nom liste} » s'ajustent selon l'enseigne."*

Contenu et boutons :
- champ ville/code postal
- **raccourci "Autour de moi"**
- **cartes d'enseignes proches** (emoji, nom, "{tag} · prix bas/moyens/élevés"), enseigne active surlignée avec un check — **tap sur une carte** → définit le magasin de la liste active et recalcule immédiatement tous les prix affichés

Magasins de référence (à reprendre tel quel) :
```js
const stores = [
  { name: 'Lidl',        emoji: '🟡', factor: 0.88, tag: 'Discount' },
  { name: 'Aldi',        emoji: '🔵', factor: 0.86, tag: 'Discount' },
  { name: 'Carrefour',   emoji: '🔴', factor: 1.00, tag: 'Hyper' },
  { name: 'Intermarché', emoji: '🟠', factor: 0.97, tag: 'Super' },
  { name: 'Leclerc',     emoji: '🔵', factor: 0.93, tag: 'Hyper' },
  { name: 'Auchan',      emoji: '🟢', factor: 0.98, tag: 'Hyper' },
  { name: 'Monoprix',    emoji: '🟣', factor: 1.24, tag: 'Ville' },
  { name: 'Bio c’Bon',   emoji: '🟢', factor: 1.42, tag: 'Bio' },
];
// priceLevel : factor < 0.92 → "prix bas" · factor > 1.1 → "prix élevés" · sinon "prix moyens"
```

### 2.9 Overlay Frigo

Ouvert par le FAB bleu. En-tête : **bouton retour**, dégradé bleu pâle → blanc, titre *"Dans mon frigoo, il y a..."*.

Corps : si vide, illustration mascotte + texte *"Il faut que je rachète des sardines moi ..."* ; sinon, une carte listant chaque article au statut "frigo" avec, par ligne :
- **bouton "Racheter"** → remet l'article dans la liste de courses (statut "liste")
- **bouton "✕"** → supprime définitivement l'article du frigo

### 2.10 Overlay Panier (= le "caddie")

Ouvert par le FAB accent. En-tête : **bouton retour**, titre *"Dans ma liste, il y a..."*, barre de progression + label *"{coché}/{total} pris"*.

Corps : mêmes groupes/catégories que la liste principale, mais chaque ligne est un bouton avec une **case à cocher ronde** (pas de swipe, pas de stepper) — cocher applique un style barré + grisé sur le nom.

Pied de page :
- **bouton "Vider la liste"** → ouvre une confirmation (*"🧹 Vider la liste ? Seule la liste de « {nom liste} » sera vidée. Ton frigo reste intact."*) avec **bouton "Oui, tout vider"** / **bouton "Annuler"**

Confirmer supprime tous les articles au statut "liste" de la liste active, **qu'ils soient cochés ou non** — la case à cocher est un repère visuel pendant les courses, elle ne déplace rien vers le frigo.

---

## 3. Onglet Recettes (= "Cuisine" dans la nav)

Header "Recettes". Liste défilante de recettes en cartes : emoji ou photo du plat, nom, nombre d'ingrédients.

Boutons de l'écran principal :
- **tap sur une carte** → ouvre le détail de la recette (plein écran)
- **bandeau "Tout ajouter à la liste"** sur la carte elle-même (raccourci, sans ouvrir le détail) → lance directement le flux d'ajout (voir double confirmation ci-dessous)
- **bouton flottant "+ Nouvelle"** (bas droite) → ouvre un bottom sheet de création

### Bottom sheet "Nouvelle recette"

- champ photo du plat (optionnel, remplace l'emoji si renseigné)
- champ nom de la recette
- ajout d'ingrédients un par un : saisie libre + **bouton "+"** par ingrédient → chaque ingrédient ajouté devient une chip avec un **bouton de retrait**
- **bouton "Enregistrer la recette"** (désactivé si le nom ou les ingrédients manquent)

### Détail d'une recette (overlay plein écran)

- **bouton retour**
- photo/emoji + nom + nombre d'ingrédients
- **bouton supprimer la recette** → suppression directe, sans confirmation
- corps : liste des ingrédients (emoji + nom), avec un petit badge "déjà dans la liste" sur ceux déjà présents dans la liste active
- **bouton "Tout ajouter à la liste"** (pied de page)

### Double vérification à l'ajout des ingrédients

1. confirmation d'intention — *"Ajouter les ingrédients de « {recette} » à « {liste active} » ?"* avec **bouton "Oui"** / **bouton "Non"**
2. si une partie des ingrédients est déjà dans la liste active — *"Des ingrédients sont déjà dans votre liste, voulez-vous les ajouter de nouveau ?"* avec **bouton "Oui, tout ajouter"** (incrémente la quantité des doublons) ou **bouton "Non, ignorer les doublons"** (n'ajoute que les ingrédients manquants)

---

## 4. Onglet Dépenses

Header "Dépenses".

### Carte budget mensuel (en haut, fond accent)

- *"Il te reste ce mois-ci"* + montant restant en grand (vire vers une teinte claire si négatif) + "/ {budget mensuel}"
- barre de progression du budget consommé
- *"{dépensé} dépensés"* en dessous
- ligne "Budget mensuel" avec un **stepper −/+** (pas de 10 €, minimum 10 €) pour ajuster le budget

### Carte "Panier en cours"

Affichage informatif (pas de bouton) : nombre d'articles dans la liste active + estimation du total. C'est le lien direct entre l'onglet Liste et l'onglet Dépenses — changer de liste active changera ce qui s'affiche ici.

### Section "Dépenses du mois"

- formulaire rapide : champ motif, champ montant, **bouton "+"** → ajoute une dépense au mois en cours
- liste des dépenses du mois (emoji, motif, date, montant), chacune avec un **bouton de suppression**
- état vide si aucune dépense : *"Aucune dépense ce mois-ci. Ajoute-en une ci-dessus 👆"*

À noter : tel que conçu actuellement, il n'y a qu'un seul mois actif, pas d'historique mois par mois ni de défilement vers les mois précédents. Voir section 6 (points ouverts).

---

## 5. Onglet Réglages

Header "Paramètres".

### Carte profil

- avatar emoji avec **bouton (caméra)** pour passer à une photo
- nom ("Toi"), email
- **bouton "Modifier"** (pas encore câblé)

### Section "Mes listes partagées"

- mêmes cartes de liste que l'overlay Gestion des listes (emoji, nom, membres + magasin, nombre d'articles, pastille ACTIVE sur la liste courante) — **tap** → active la liste
- **bouton "Quitter"** sur les listes non actives
- **bouton "+ Rejoindre ou créer une liste"** → ouvre l'overlay Gestion des listes (section 2.7), pas une interface dupliquée

### Section "Préférences"

- **interrupteur "Afficher les prix"** → active/désactive l'affichage des prix dans toute l'application (badges, totaux, etc.)
- deux lignes pas encore fonctionnelles, **tap** → toast "Bientôt disponible" : "Catégories personnalisées", "Magasins à proximité"

### Section "À propos"

Logo Frigoo, numéro de version, accroche du type *"La liste de courses pensée pour les budgets serrés 🐧"*. Pas de bouton interactif dans cette section.

---

## 6. Modèle de données minimal

- **liste** : `{ id, emoji, name, members: string[], store, city }`
- **article** : `{ id, name, cat (id de catégorie), price, qty, place: 'liste' | 'frigo', listId, checked?: boolean }`
  - `checked` ne sert que pour l'affichage dans l'overlay Panier pendant les courses ; un state local suffit, pas besoin de le persister dans Firestore si ça complique les choses.

## 7. Hors scope actuel & points ouverts

- **Onglet Recettes / Dépenses / Réglages** : décrits ci-dessus tels qu'ils existent dans la maquette de référence ; pas encore implémentés dans l'app — à construire onglet par onglet.
- **Mascotte** : nom à confirmer ("Frigo" supposé, dicté comme "Fribourg"), illustrations 2D fixes par pose/moment encore à produire.
- **Logique de prix** : la fonction de scoring marque/enseigne/localisation décrite en section 1 est une hypothèse de travail, pas une version finale — coder en composant isolé et modifiable.
- **Historique des dépenses** : la maquette ne gère qu'un mois actif, sans navigation vers les mois précédents. Si tu veux cet historique, c'est une extension à spécifier, pas encore décidée.
- **Lien Liste ↔ Dépenses** : changer de liste active impactera plus tard le total affiché dans Dépenses (carte "Panier en cours") — ne pas câbler ce lien avant que l'onglet Dépenses soit lui-même construit.
- **Panier (caddie) → Frigo** : dans la maquette, cocher un article dans le Panier ne le fait **pas** passer automatiquement au frigo — seul le swipe vers la gauche sur l'écran Liste principal le fait. Si on coche tout pendant les courses puis qu'on vide la liste, ces articles disparaissent sans jamais passer par le frigo, sauf à les avoir swipés avant de vider. Comportement à reproduire tel quel pour l'instant ; à signaler si ça semble être un trou dans le parcours, mais sans improviser une logique différente sans validation.
