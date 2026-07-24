# PROGRAM-036 — LOT 004A — HOME PIXEL PERFECT CONVERGENCE

## 1. Contrôle du document

| Champ | Valeur |
|---|---|
| Mission ID | `P36-LOT-004A-HOME-PIXEL-PERFECT-PROGRAM` |
| Mission | `PROGRAM-036 — LOT 004A — Home Pixel Perfect Convergence` |
| Type | Architecture de programme et plan d'exécution |
| Priorité | CRITICAL |
| Référentiel visuel | `Docs/24_MODULES/0-UI-DESIGN/NOVA-DESIGN-V7/NOVA-HOME-V7.png` |
| Viewport de certification | `1920 × 1080` CSS pixels, zoom 100 %, device scale factor 1 |
| Statut de la Home actuelle | `NOT PIXEL PERFECT / NOT CERTIFIED` |
| Statut du présent programme | `APPROVED — READY FOR SEQUENTIAL EXECUTION` |
| Mode de création | Documentation uniquement ; aucune correction de code |

## 2. Décision d'architecture

LOT 004A devient le programme officiel de convergence Pixel Perfect de la Home NOVA. Il est inséré entre LOT 004 et LOT 005 sans modifier le périmètre fonctionnel de PROGRAM-036.

La convergence est exécutée au moyen de **10 mini-chantiers strictement séquentiels**, chacun porté par un Mission Order distinct et certifié avant l'ouverture du suivant. Aucun mini-chantier ne peut être regroupé, anticipé ou exécuté en parallèle. La Home actuelle ne peut pas devenir baseline officielle par déclaration : elle doit satisfaire les mesures, captures, overlays, tests et sept Gates définis dans ce document.

Décisions normatives :

- la référence visuelle principale et unique est Home V7 ; aucune Home V6, V5, V4, V3 ou V2 ne peut servir à arbitrer un écart ;
- le code n'est pas une source visuelle normative ; il constitue seulement l'état NOVA observé ;
- les valeurs de la référence sont mesurées sur l'image V7 ou sur une source Figma V7 autorisée, jamais estimées à l'œil ;
- les valeurs de NOVA sont mesurées dans le DOM rendu et dans la capture, jamais déduites uniquement d'une déclaration CSS ;
- les conflits documentaires ne sont ni moyennés ni résolus implicitement ; Home V7 observée tranche uniquement la géométrie visible de Home ;
- le Design System certifié reste protégé ; les corrections de LOT 004A sont locales à la Home et au Shell réellement visible sur Home ;
- aucune fonction, donnée métier, route, API, dépendance, logique de navigation ou règle produit n'entre dans LOT 004A ;
- LOT 005 reste fermé jusqu'à certification finale de MC-010.

## 3. Sources consultées et autorité

### 3.1 Corpus normatif lu intégralement

1. `Docs/10_NOVA/00_UX_AUDIT/NOVA_UX_AUDIT_REPORT.md`
2. `Docs/24_MODULES/0-UI-DESIGN/SOURCE/FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md`
3. `Docs/10_NOVA/01_IMPLEMENTATION/NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md`
4. `Docs/10_NOVA/02_DEVELOPMENT/NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK.md`
5. `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_PROGRAM_ARCHITECTURE.md`
6. `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_MASTER_EXECUTION_PLAN.md`
7. `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_MISSION_ORCHESTRATOR.md`
8. `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/P36-DR-002_LOT_EXECUTION_POLICY.md`

### 3.2 Sources d'implémentation lues intégralement

Tous les fichiers présents au moment de cette mission dans :

- `apps/nova-web/src/components/shell/` ;
- `apps/nova-web/src/features/home/` ;
- `apps/nova-web/src/components/surfaces/` ;
- `apps/nova-web/src/styles/`.

### 3.3 Sources visuelles observées

- référence officielle : `NOVA-HOME-V7.png`, image native `1920 × 995`, sans mise à l'échelle ;
- Home locale : application servie sur `http://127.0.0.1:5173/`, réponse HTTP 200 ; état technique relevé dans le DOM/CSS source et à certifier par capture runtime `1920 × 1080` au début de MC-001.

La référence V7 native est plus courte de 85 px que le viewport de certification. Elle reste immuable. Pour les overlays, elle doit être placée à l'origine `(0,0)` d'un canevas `1920 × 1080`, à échelle 1:1. La bande `(y=995..1079)` est masquée comme `NO_SOURCE_DATA`, exclue du score visuel et ne peut justifier aucune correction. Aucune interpolation, extension générative, mise à l'échelle ou utilisation d'une ancienne Home n'est autorisée.

## 4. Baseline mesurée et protocole de mesure

### 4.1 Repères V7 observés sur la référence native

Les repères ci-dessous constituent la baseline initiale. Le Mission Order de chaque mini-chantier doit les confirmer par mesure instrumentée avant toute correction.

| Repère | Home V7 observée |
|---|---:|
| Canevas source | 1920 × 995 px |
| Sidebar | x=0, y=0, largeur 176 px, hauteur 995 px |
| Début de la zone principale | x=176 px |
| Barre supérieure Home | absente, hauteur cible 0 px |
| Axe gauche de la colonne Home | x=738 px |
| Largeur dominante de colonne/cartes | 620 px |
| Home header | x=738 px, début vertical voisin de y=51 px |
| Objective Composer | x=738 px, y=120 px, largeur 620 px, hauteur 68 px |
| Priority Insight | x=738 px, y=280 px, largeur 620 px, hauteur 198 px |
| Pending Decision | x=738 px, y=498 px, largeur 620 px, hauteur 85 px |
| Active Work — ligne 1 | x=738 px, y=625 px, largeur 620 px, hauteur 54 px |
| Active Work — ligne 2 | x=738 px, y=684 px, largeur 620 px, hauteur 54 px |
| Active Work — ligne 3 | x=738 px, y=744 px, largeur 620 px, hauteur 54 px |
| Background Work | x=738 px, y=814 px, largeur 620 px, hauteur 39 px |

### 4.2 État NOVA initial relevé

| Repère | État NOVA avant LOT 004A |
|---|---:|
| Sidebar déclarée | 160 px |
| Top bar Home | présente ; minimum structurel 53 px (logo 32 + paddings 20 + bordure 1) |
| Conteneur Home déclaré | max-width 880 px, padding horizontal 16 px |
| Largeur utile de `.page` | 848 px lorsque le conteneur atteint 880 px |
| Axe gauche calculé à 1920 px | voisin de x=616 px |
| Largeur attendue V7 | 620 px |
| Libellés techniques | `Primary`, `Structure only.`, `Utilities`, `Source-only shell utilities.` présents |
| Rôle profil | `Program owner` présent au lieu de `Standard` |
| Logo de top bar | présent alors qu'absent de Home V7 |
| Pending Decision | bouton `Open decision` présent au lieu de la flèche V7 |
| Background Work | deux items secondaires visibles alors que V7 montre un bandeau compact |

Ces dimensions NOVA sont une baseline technique préalable, pas une certification de capture. MC-001 est bloqué avant modification tant que la capture initiale 1920 × 1080 et les `getBoundingClientRect()` correspondants n'ont pas confirmé les valeurs runtime.

### 4.3 Méthode obligatoire

Pour chaque mini-chantier :

1. verrouiller fenêtre et viewport à `1920 × 1080`, zoom 100 %, device scale factor 1, même navigateur, même OS, mêmes polices et mêmes données ;
2. attendre la fin du chargement des polices et deux frames de rendu stables ;
3. capturer la page entière visible sans DevTools, scrollbar forcée ou redimensionnement automatique ;
4. relever `x`, `y`, `width`, `height`, padding, gap, border, radius, font-size, font-weight, line-height, letter-spacing et couleur calculée des éléments du mini-chantier ;
5. mesurer la référence V7 par coordonnées de pixels et bords visibles, sans redimensionnement ;
6. inscrire avant/cible/après et delta dans le Mission Order ;
7. produire un overlay à 50 % et un diff absolu/heatmap sur le masque comparable ;
8. classer chaque écart : `BLOCKING`, `MAJOR`, `MINOR`, `ANTIALIASING_ONLY` ;
9. exécuter les validations automatiques ;
10. prononcer `CERTIFIED`, `FAILED` ou `BLOCKED` avec preuve.

Tolérance : aucune tolérance n'est admise sur la présence/absence, l'ordre ou la structure visibles. Pour la géométrie, tout delta supérieur à 1 px doit être corrigé ou formellement classé et accepté ; aucun delta bloquant ou majeur ne peut subsister. Les seules différences admissibles sans correction sont les variations d'anticrénelage démontrées, sans déplacement de boîte ni changement de métrique.

## 5. Registre officiel des anomalies

| ID | Zone | Anomalies recensées |
|---|---|---|
| A-001 | Sidebar | largeur ; logo taille/position ; densité verticale ; labels `PRIMARY`/`UTILITIES` ; textes techniques ; icônes ; gaps ; profil ; rôle ; séparateurs ; alignements ; footer trop haut/dense |
| A-002 | Barre supérieure | logo NOVA dupliqué ; bandeau inexistant en V7 ; hauteur inutile ; contenu Home repoussé vers le bas |
| A-003 | Colonne centrale | largeur, centrage, axe horizontal, marges latérales, position verticale et alignement global non conformes |
| A-004 | Home Header | y, taille/graisse du titre, espacement titre/sous-titre et largeur du bloc |
| A-005 | Objective Composer | hauteur, largeur, padding, icône/fond, visibilité du secondaire, dimensions et gaps des chips, ombre et bordure |
| A-006 | Priority Insight | hauteur, padding, badges, intro, titre/line-height, CTA, `Why?`, `Details`, radius, border et shadow |
| A-007 | Decision Card | hauteur excessive ; bouton absent de V7 ; flèche droite manquante ; icône ; badges ; alignement ; bordure rouge ; radius ; densité secondaire |
| A-008 | Active Work | lignes trop hautes ; secondaires trop visibles ; indicateurs ; scores ; dates ; gaps ; borders et radius |
| A-009 | Background Work | bloc trop haut ; `Details` mal placé ; disposition ; items secondaires trop visibles ; densité, gaps et hauteur totale |
| A-010 | Typographie | tailles, graisses, line-height, letter-spacing, secondaires, contrastes, badges et auxiliaires |
| A-011 | Grille/espacements | axes, largeur cartes, marges, paddings, gaps, rythme vertical, CTA, scores, dates et hauteurs |

## 6. Règle d'exécution et machine d'état

Ordre unique :

`MC-001 → MC-002 → MC-003 → MC-004 → MC-005 → MC-006 → MC-007 → MC-008 → MC-009 → MC-010`

Règles :

- un Mission Order porte exactement un mini-chantier ;
- un seul mini-chantier peut être `IN_PROGRESS` ;
- le mini-chantier suivant reste `LOCKED` tant que le précédent n'est pas `CERTIFIED` ;
- `FAILED`, `BLOCKED`, `WAITING_REVIEW` ou `WAITING_GATE` n'autorise pas l'ouverture du suivant ;
- aucune exécution parallèle, même si deux fichiers ne se chevauchent pas ;
- toute reprise reste dans le même Mission Order ou dans un ordre correctif explicitement rattaché au même mini-chantier ;
- toute extension de périmètre exige une décision d'architecture préalable ;
- l'état initial des dix mini-chantiers est `NOT_STARTED` ; seul MC-001 est autorisé à être préparé.

États autorisés : `NOT_STARTED`, `READY`, `IN_PROGRESS`, `WAITING_REVIEW`, `WAITING_GATE`, `CERTIFIED`, `FAILED`, `BLOCKED`, `ROLLED_BACK`.

## 7. Contrat obligatoire de chaque Mission Order

Chaque Mission Order doit contenir, sans omission :

1. anomalie exacte et identifiant du registre ;
2. référence Figma Home V7 observée, avec coordonnées et extrait de capture ;
3. état NOVA observé, avec DOM/CSS calculé et extrait de capture ;
4. fichiers autorisés, listés individuellement ;
5. propriétés CSS autorisées, listées explicitement ;
6. propriétés JSX autorisées : composition, nœuds, attributs, classes et contenu strictement visuel ;
7. éléments interdits et fichiers hors scope ;
8. dimensions avant ;
9. dimensions cibles ;
10. méthode de mesure et environnement de capture ;
11. capture avant 1920 × 1080 ;
12. capture après 1920 × 1080 ;
13. tests obligatoires et résultats réels ;
14. overlay/diff, anomalies résiduelles et classification ;
15. décision de certification signée : `CERTIFIED`, `FAILED` ou `BLOCKED`.

Un Mission Order sans une de ces rubriques est invalide et ne peut autoriser aucune modification.

## 8. Programme des 10 mini-chantiers

### MC-001 — Shell Technical Chrome Removal

**Anomalie exacte.** A-002 et partie technique de A-001 : barre supérieure Home, logo dupliqué, labels de démonstration, descriptions techniques et rôle `Program owner` absents de V7.

**Référence V7.** Aucun bandeau horizontal au-dessus de Home ; un seul logo dans la Sidebar ; aucun label `PRIMARY`/`UTILITIES`, aucun texte de démonstration ; profil `Sarah Chen / Standard`.

**État NOVA.** Top bar structurelle présente, hauteur initiale minimale 53 px ; `NavigationSection` rend quatre textes techniques ; profil `Program owner`.

**Fichiers autorisés.** `NavigationShell.tsx`, `AppShell.tsx`, `AppShell.module.css`, `TopBar.tsx`, `TopBar.module.css`, `NavigationSection.tsx`, `NavigationSection.module.css`. Aucun autre fichier.

**CSS autorisé.** `display`, `grid-template-rows`, `height`, `min-height`, `padding`, `margin`, `gap`, `border`, `background`, `visibility` uniquement sur le chrome concerné.

**JSX autorisé.** Retrait conditionnel du slot TopBar sur Home ; retrait des headings/descriptions techniques visibles ; remplacement du seul libellé de rôle par `Standard`. Aucun handler ou contrat de navigation modifié.

**Interdits.** Suppression des quatre entrées métier, modification des routes, nouveaux contrôles, nouvelles données, nouvelle dépendance, changement des contenus Home.

**Dimensions.** Avant : TopBar ≥53 px. Cible : 0 px sur Home. Avant profil : rôle `Program owner`. Cible : `Standard`. Les autres boîtes doivent être mesurées dans le MO avant correction.

**Mesure/captures.** Capture baseline obligatoire avant tout edit ; rectangles de `header.topBar`, `main`, logo sidebar et profil ; capture après ; overlay global et masque Shell.

**Tests/certification.** Tests Shell/Home ciblés mis à jour uniquement pour refléter la V7, puis suite complète. Certification si aucune chrome technique visible, contenu Home remonté sans rupture, navigation inchangée et Gates applicables PASS.

### MC-002 — Sidebar Pixel Perfect

**Anomalie exacte.** A-001 restant : largeur, logo, icônes, navigation haute/basse, actif, séparateurs, profil et densité.

**Référence V7.** Sidebar 176 px ; logo unique en haut ; quatre entrées principales compactes avec icônes ; quatre utilities en bas ; profil bas compact ; actif bleu clair ; rôle `Standard`.

**État NOVA.** Sidebar 160 px ; icônes principales absentes ; glyphes utilities non conformes ; groupes non ancrés en haut/bas ; gaps et profil différents.

**Fichiers autorisés.** `AppShell.module.css`, `NavigationShell.tsx`, `NavigationShell.module.css`, `SideNavigation.tsx`, `SideNavigation.module.css`, `ShellLogo.tsx`, `ShellLogo.module.css`, `NavigationItem.tsx`, `NavigationItem.module.css`, `NavigationSection.tsx`, `NavigationSection.module.css`.

**CSS autorisé.** largeur/hauteur, grid/flex, alignement, position, padding, margin, gap, border, radius, font metrics, couleurs, background, taille icône/avatar.

**JSX autorisé.** Icônes décoratives/nommées sans dépendance nouvelle ; regroupement visuel principal/utility/profil ; conservation exacte des liens, handlers et `aria-current`.

**Interdits.** Route/History API, nouvelles entrées, changement d'ordre métier, fonctionnalité Search/Notifications/Help/Preferences, modification de la colonne Home.

**Dimensions.** Avant sidebar 160 px ; cible 176 px. Hauteurs, coordonnées du logo, entrées, séparateur et profil : valeurs avant/cible mesurées et inscrites dans le MO depuis V7.

**Mesure/captures.** Rectangles de chaque ligne et calcul des deltas verticaux ; scan des axes gauche/centre ; capture et overlay limités à x=0..175 puis global.

**Tests/certification.** Navigation Shell, clavier, `aria-current`, Home, suite complète. Certification si largeur 176 px, densité/alignements V7, aucune chrome technique et aucune régression.

### MC-003 — Home Grid and Viewport Alignment

**Anomalie exacte.** A-003 et A-011 global : colonne trop large et trop à gauche, marges et rythme global non conformes.

**Référence V7.** axe gauche x=738 px ; largeur dominante 620 px ; contenu démarrant près de y=51 px ; Sidebar 176 px ; aucun header supérieur.

**État NOVA.** conteneur 880 px, largeur utile 848 px, axe gauche calculé voisin de x=616 px ; paddings imbriqués de ContentArea et PageContainer.

**Fichiers autorisés.** `ContentArea.module.css`, `ContentViewport.module.css`, `PageContainer.module.css`, `HomePage.module.css`, et leurs composants TSX uniquement si une classe/prop de layout Home doit être ciblée.

**CSS autorisé.** `width`, `max-width`, `min-width`, `margin`, `padding`, `gap`, `grid-template-columns`, `justify-*`, `align-*` et positionnement statique du conteneur.

**JSX autorisé.** Classe ou prop de portée Home uniquement ; aucune modification d'ordre ou de contenu.

**Interdits.** Changement global non mesuré des autres routes, media query nouvelle, transform visuel compensatoire, position absolue de la page entière.

**Dimensions.** Avant max-width 880/utile 848/axe ≈616. Cible largeur visible 620/axe x=738. Les positions y de chaque zone doivent être enregistrées avant et après ; seules les règles globales de grille sont corrigées ici.

**Mesure/captures.** Rectangles du conteneur, `.page` et des cinq surfaces ; lignes guides x=176, 738, 1358 ; overlay global.

**Tests/certification.** Home nominale et états alternatifs, absence d'overflow à 1920 × 1080, suite complète. Certification si axe et largeur respectent V7 à ±1 px sans régression hors Home.

### MC-004 — Home Header and Objective Composer

**Anomalie exacte.** A-004, A-005 et leurs éléments A-010/A-011.

**Référence V7.** header à x=738, y voisin de 51 ; composer x=738, y=120, 620 × 68 ; suggestions hors du rectangle principal, compactes sur deux lignes ; icône bleue claire.

**État NOVA.** titre et sous-titre décalés ; composer plus haut/dense, icône en gradient, description trop visible ; chips rendues dans le Card et dimensions/gaps différents.

**Fichiers autorisés.** `HomeHeader.tsx`, `ObjectiveComposer.tsx`, `HomePage.module.css`. `homeFixture.ts` lecture seule.

**CSS autorisé.** dimensions, padding, margin, gap, flex/grid, font metrics, couleurs, opacity, border, radius, shadow, background, icon box.

**JSX autorisé.** Composition visuelle du composer et emplacement du groupe `Try`; classements/containers ; aucune nouvelle interaction ou modification de texte.

**Interdits.** Composer interactif nouveau, handler, champ de saisie, modification de fixture, dépendance d'icône, changement de Priority Insight.

**Dimensions.** Avant : rectangles runtime à mesurer. Cible composer 620 × 68 à (738,120) ; header et chips selon coordonnées pixel V7 confirmées dans le MO.

**Mesure/captures.** Bounding boxes du titre, sous-titre, card, icône, deux textes, label Try et chaque chip ; overlay de y=40..260.

**Tests/certification.** Home test, ordre sémantique des headings, lisibilité, suite complète. Certification si géométrie et style du header/composer correspondent et aucun CTA n'est ajouté.

### MC-005 — Priority Insight Pixel Perfect

**Anomalie exacte.** A-006 et usages A-010/A-011 du bloc prioritaire.

**Référence V7.** bloc x=738, y=280, 620 × 198 ; deux badges compacts ; intro discrète ; titre principal sur lignes V7 ; CTA bleu ; `Why?` près du CTA ; `Details` aligné à droite.

**État NOVA.** bloc plus dense/dimension différente ; badges génériques ; intro trop forte ; trois boutons regroupés ; radius, border, padding et shadow non calibrés.

**Fichiers autorisés.** `PriorityInsight.tsx`, `NextBestAction.tsx`, `HomePage.module.css`.

**CSS autorisé.** layout, dimensions, padding, gaps, font metrics, couleurs, border, radius, shadow, background et alignement des actions.

**JSX autorisé.** Wrappers et ordre visuel des actions ; conservation des handlers et du disclosure `Why?` ; attributs accessibles.

**Interdits.** Changement de texte, nouvelle recommandation, nouveau score, suppression du comportement Why/Details, logique métier.

**Dimensions.** Avant à mesurer. Cible surface 620 × 198 à (738,280) ; CTA, Why, Details et textes mesurés depuis V7 et inscrits au MO.

**Mesure/captures.** Rectangles de surface, badges, intro, titre, CTA, Why, Details ; contrôle du wrapping ; overlay y=270..488.

**Tests/certification.** Interactions Open/Why/Details, clavier/focus, Home, suite complète. Certification si la hiérarchie NOVA et l'unique CTA primaire correspondent à V7.

### MC-006 — Pending Decision Card Pixel Perfect

**Anomalie exacte.** A-007 et usages A-010/A-011 de la décision.

**Référence V7.** carte x=738, y=498, 620 × 85 ; icône décision à gauche ; badges compacts en ligne ; flèche de navigation à droite ; pas de bouton `Open decision`.

**État NOVA.** carte verticale plus haute ; pas d'icône dédiée ; bouton secondaire visible ; badges grands ; bordure rouge et radius non conformes.

**Fichiers autorisés.** `PendingDecisionCard.tsx`, `HomePage.module.css`. `homeFixture.ts` lecture seule.

**CSS autorisé.** grid/flex, dimensions, padding, gap, alignement, font metrics, border-left, border, radius, shadow, couleurs et icon box.

**JSX autorisé.** Remplacer la présentation du bouton par une affordance flèche conforme tout en conservant `onOpenDecision`, le nom accessible et une cible clavier valide ; ajouter le container d'icône sans dépendance.

**Interdits.** Suppression du handler, nouvelle route, changement de décision/confiance/date, CTA texte visible non présent en V7.

**Dimensions.** Avant à mesurer. Cible 620 × 85 à (738,498) ; positions icône, badges, texte et flèche mesurées dans le MO.

**Mesure/captures.** Rectangles, baseline texte, épaisseur/hauteur de bord rouge, cible interactive ; overlay y=490..592.

**Tests/certification.** Navigation de la décision, clavier/nom accessible, Home, suite complète. Certification si bouton visible absent, flèche présente et carte V7 reproduite.

### MC-007 — Active Work Pixel Perfect

**Anomalie exacte.** A-008 et usages A-010/A-011 des trois lignes.

**Référence V7.** trois lignes de 620 × 54 px aux y=625, 684 et 744 ; indicateurs fins à gauche ; secondaires discrets ; confiance et dates alignées à droite.

**État NOVA.** hauteur/densité, points, badges de confiance, dates, gaps, border et radius différents.

**Fichiers autorisés.** `ActiveWorkSection.tsx`, `ActiveWorkCard.tsx`, `HomePage.module.css`. `homeFixture.ts` lecture seule.

**CSS autorisé.** dimensions, padding, margin, gap, grid/flex, alignment, font metrics, couleurs/opacity, border, radius, shadow et indicateurs.

**JSX autorisé.** Wrappers visuels, structure de meta et indicateur ; conservation des trois items, textes, dates, scores et handler.

**Interdits.** Tri, filtrage, changement de données, suppression de ligne, logique de confiance, nouvelle interaction.

**Dimensions.** Avant à mesurer pour chaque ligne. Cible : 620 × 54 aux coordonnées V7 indiquées ; intervalles verticaux cibles mesurés au pixel.

**Mesure/captures.** Rectangles des trois lignes et sous-éléments ; tableau des axes score/date ; overlay y=600..805.

**Tests/certification.** Trois items, handler de chaque ligne, clavier, Home, suite complète. Certification si les trois lignes sont alignées, compactes et sans surcharge secondaire.

### MC-008 — Background Work Pixel Perfect

**Anomalie exacte.** A-009 et usages A-010/A-011 du bandeau final.

**Référence V7.** bandeau NOVA compact x=738, y=814, 620 × 39 ; résumé sur une ligne ; `Details` à droite ; aucun item secondaire visible au premier niveau.

**État NOVA.** bandeau plus haut et deux items secondaires visibles sous lui ; Details positionné dans un bloc générique.

**Fichiers autorisés.** `BackgroundWorkSection.tsx`, `BackgroundWorkItem.tsx`, `NovaSuggestionCard.tsx`, `HomePage.module.css`. `homeFixture.ts` lecture seule.

**CSS autorisé.** display, dimensions, padding, gap, alignment, font metrics, couleurs, border, radius, background, shadow.

**JSX autorisé.** Retrait du premier niveau des items secondaires et composition compacte du bandeau ; conservation du résumé, de `Details` et de son handler.

**Interdits.** Suppression de données métier de la fixture, nouveau drawer, nouveau CTA, nouvelle logique de background work.

**Dimensions.** Avant à mesurer. Cible 620 × 39 à (738,814), items secondaires visibles = 0.

**Mesure/captures.** Rectangle du bandeau, axes badge/texte/Details, hauteur totale de Home ; overlay y=805..865.

**Tests/certification.** Résumé et Details, absence visuelle des items au N1, handler, Home, suite complète. Certification si le bandeau est compact et conforme à la divulgation progressive V7.

### MC-009 — Typography and Token Calibration

**Anomalie exacte.** A-010 et résidus typographiques de A-001 à A-009.

**Référence V7.** hiérarchie Inter, contrastes, line-heights, letter-spacing, badges et microcopy observés sur Home V7.

**État NOVA.** usages de tokens parfois trop grands, trop sombres, trop espacés ou trop contrastés ; badges génériques influençant les dimensions Home.

**Fichiers autorisés.** `HomePage.module.css` et les modules CSS Shell strictement touchés par les écarts Home résiduels. `designTokens.css` est lecture seule sauf Decision Record distinct démontrant qu'un token certifié est erroné et sans impact global.

**CSS autorisé.** `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `color`, `opacity`, et dimensions locales de badge/label nécessaires au rendu Home.

**JSX autorisé.** Aucune structure ; seulement classe locale ou attribut sémantique indispensable, explicitement listé dans le MO.

**Interdits.** Mutation globale du Design System, nouveau token arbitraire, changement de texte, changement de layout destiné à masquer une erreur typographique.

**Dimensions.** Avant/cible : matrice obligatoire par style visible (logo, nav, profil, h1, sous-titre, composer, hero, decision, Active Work, Background Work). Les valeurs cibles sont relevées sur V7 et les métriques calculées après sont enregistrées.

**Mesure/captures.** Comparaison des boîtes de lignes, wrapping, couleur calculée et contraste ; overlay texte par zones puis global.

**Tests/certification.** Tests tokens existants, contraste informatif, zoom 100/200 %, Home, Shell, suite complète. Certification si aucune calibration ne fuit hors Home/Shell et si les géométries déjà certifiées restent stables.

### MC-010 — Final Visual Overlay and Certification

**Anomalie exacte.** Tous résidus A-001 à A-011 et toute régression introduite après MC-009.

**Référence V7.** `NOVA-HOME-V7.png` native 1920 × 995, utilisée à échelle 1:1 dans le canevas de certification 1920 × 1080 avec masque `NO_SOURCE_DATA` de 85 px.

**État NOVA.** État cumulé certifié de MC-001 à MC-009 ; aucune correction de production n'est autorisée dans MC-010.

**Fichiers autorisés.** Aucun fichier de code. Seuls les artefacts de preuve explicitement nommés par le futur Mission Order sont autorisés.

**CSS/JSX autorisés.** Aucun.

**Interdits.** Toute correction opportuniste, modification de tolérance, masquage d'une zone comparable, retouche de capture, changement de données ou de viewport.

**Dimensions.** Toutes les cibles des MC précédents ; tableau final avant LOT 004A / cible V7 / après MC-009 / delta.

**Mesure/captures.** Nouvelle capture propre 1920 × 1080 ; overlay 50 % ; diff absolu ; heatmap ; revue par zone ; contrôle du masque ; reproduction sur une seconde capture indépendante.

**Tests/certification.** Suite complète, Git checks, contrôle UX, revue de référence et signature finale. Si un écart bloquant/majeur subsiste, MC-010 est `FAILED` et le mini-chantier propriétaire est rouvert ; aucune correction n'est faite dans MC-010.

## 9. Gates obligatoires

| Gate | Contrôle | Preuve PASS | Échec |
|---|---|---|---|
| GATE-004A-01 — Scope Integrity | aucune fonction/logique métier, route, API, dépendance ou donnée ajoutée | diff limité au MO et à des corrections visuelles autorisées | lot arrêté et rollback du MC |
| GATE-004A-02 — Reference Integrity | Home V7 uniquement, hash/path/dimensions enregistrés, aucune ancienne Home | référence `NOVA-HOME-V7.png` native, 1920 × 995, échelle 1:1 | certification impossible |
| GATE-004A-03 — Measurement Integrity | avant/cible/après mesurés | DOM rects + pixels + environnement + delta | estimation ou valeur non traçable = FAIL |
| GATE-004A-04 — Visual Overlay | comparaison réelle au même canevas 1920 × 1080 | capture, overlay, diff, heatmap, masque 85 px explicite | capture manquante/retouchée ou viewport différent = FAIL |
| GATE-004A-05 — Regression | typecheck, tests, build et Git checks | toutes commandes PASS | un seul échec bloque la certification |
| GATE-004A-06 — UX | aucune surcharge cognitive ni CTA concurrent ajouté | revue du budget cognitif et divulgation progressive PASS | ajout de bruit ou d'action dominante = FAIL |
| GATE-004A-07 — Final Certification | aucun écart bloquant/majeur, dix MC certifiés | registre à zéro bloquant/majeur et signature finale | LOT 004A reste ouvert ; LOT 005 fermé |

## 10. Validation obligatoire par mini-chantier

Après chaque mini-chantier, exécuter depuis le workspace frontend :

```text
cd apps/nova-web
npm run typecheck
npm run test
npm run build
cd ../..
git diff --check
git status --short
```

Puis produire :

- capture avant 1920 × 1080 ;
- capture après 1920 × 1080 ;
- mesures avant/cible/après ;
- overlay et diff ;
- liste exhaustive des fichiers modifiés ;
- verdict des Gates applicables ;
- décision `CERTIFIED`, `FAILED` ou `BLOCKED`.

Un PASS antérieur ne peut pas être réutilisé : les trois commandes npm et les deux commandes Git sont rejouées après chaque MC. Le dossier `dist/` éventuellement produit par le build ne fait pas partie des livrables et doit respecter la politique Git existante.

## 11. Interdictions absolues

Il est interdit de :

- créer une fonctionnalité, un écran ou une route ;
- modifier le moteur de navigation ou les données métier ;
- ajouter une API, une dépendance ou un package ;
- modifier le kernel ou le package racine ;
- ouvrir LOT 005 avant GATE-004A-07 ;
- déclarer Pixel Perfect sans mesures et overlay ;
- modifier plusieurs mini-chantiers dans un Mission Order ;
- exécuter deux mini-chantiers en parallèle ;
- utiliser une ancienne Home comme référence principale ou secondaire d'arbitrage ;
- redimensionner, retoucher ou régénérer la référence V7 ;
- résoudre un écart par `transform`, zoom, screenshot crop trompeur ou masquage ;
- corriger du code pendant la mission de création du présent programme.

## 12. Conditions de sortie et autorisation de LOT 005

LOT 004A est `CERTIFIED` uniquement si :

- MC-001 à MC-010 sont tous `CERTIFIED` dans l'ordre ;
- la comparaison est produite dans un canevas 1920 × 1080 avec source V7 à échelle 1:1 ;
- Shell, Sidebar et Home sont conformes ;
- aucun écart visuel `BLOCKING` ou `MAJOR` ne reste ouvert ;
- typecheck, tests, build et `git diff --check` sont PASS ;
- aucune régression fonctionnelle, de navigation, d'accessibilité ou UX n'est détectée ;
- la décision finale est `CERTIFIED` ;
- la capture Home certifiée est enregistrée comme baseline officielle ;
- l'autorité de PROGRAM-036 émet explicitement `LOT 005 AUTHORIZED`.

À défaut d'une seule condition, LOT 004A reste ouvert et LOT 005 demeure `LOCKED`.

## 13. Décision finale de cette mission

Décision : **PROGRAMME APPROUVÉ, AUCUNE EXÉCUTION COMMENCÉE**.

Le premier mini-chantier autorisé à recevoir un Mission Order est **MC-001 — Shell Technical Chrome Removal**. Son exécution reste conditionnée par la capture runtime initiale 1920 × 1080, les mesures DOM initiales, le périmètre de fichiers explicite et le GO d'exécution prévu par la gouvernance PROGRAM-036.

La Home actuelle reste `NOT PIXEL PERFECT / NOT CERTIFIED`. Aucun code n'a été produit ou corrigé par la mission d'architecture.
