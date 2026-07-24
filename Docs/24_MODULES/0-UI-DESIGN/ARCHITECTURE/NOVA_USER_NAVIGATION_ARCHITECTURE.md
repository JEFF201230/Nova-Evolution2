# NOVA — Architecture de navigation utilisateur

**Programme :** PROGRAM-037

**Mission :** P37-MO-001_NOVA_UX_ARCHITECTURE_RECONSTRUCTION

**Statut du document :** Livrable n°1 produit — en attente de validation

**Périmètre :** architecture fonctionnelle et navigation uniquement

**Référentiel analysé :** documents SOURCE NOVA V6.1 et captures NOVA-DESIGN-V7 disponibles au 19 juillet 2026

---

## 1. Rôle et règle d'autorité

Ce document reconstruit le parcours utilisateur démontrable de NOVA. Il devient, après validation, la source de vérité de la navigation à laquelle les documentations d'écran devront se référer avant toute implémentation.

Il ne décrit ni une proposition d'interface, ni une architecture technique cible. Il ne complète pas les sources par intuition.

### 1.1 Légende de preuve

| Marqueur | Signification |
|---|---|
| `DOC` | Relation explicitement décrite dans un ou plusieurs fichiers de `SOURCE` |
| `UX` | Relation ou état directement visible dans une capture NOVA-DESIGN-V7 |
| `DOC+UX` | Relation décrite et confirmée visuellement |
| `ND` | Non déterminé : les sources ne permettent pas de conclure |
| `CONFLIT` | Deux sources de vérité donnent des informations incompatibles |

Une capture prouve un état visible, mais pas une interaction ou une destination qui n'y est pas montrée. Un libellé ressemblant à un lien ne suffit donc pas à prouver sa transition.

### 1.2 Limites du corpus

- Les documents structurants s'identifient comme **NOVA V6.1**, alors que les captures sont rangées sous **NOVA-DESIGN-V7**. Aucun document ne fournit une règle générale de priorité de version. `CONFLIT`
- Aucun identifiant de fichier, page, frame, node ou prototype Figma exploitable n'est fourni. Les enchaînements proviennent donc des textes et des états visibles, pas d'un prototype cliquable. `ND`
- `15_JSX_REFERENCE.md` ne contient pas de référence JSX NOVA : il contient une consigne de rapport CEREBRAU sans description de navigation. Il est recensé, mais ne démontre aucune relation NOVA.
- Certaines captures Activity et Decisions incluent du chrome de l'éditeur Figma (`ORCHESTRATOR`, partage, etc.). Ce chrome est exclu de l'architecture applicative.
- Le dossier demandé `DELIVERABLES` existe dans le corpus sous le nom `DELIVBERABLES`. Les deux captures qu'il contient représentent l'onglet Deliverables d'un Work, pas une preuve suffisante de la vue globale Deliverables.

---

## 2. Modèle de navigation reconstruit

NOVA combine cinq niveaux fonctionnels :

1. **Shell applicatif global** : NavRail et zone de contenu.
2. **Navigation primaire** : Home, Work, Decisions, Deliverables.
3. **Navigation de contexte Work** : sept onglets partageant le même Work actif.
4. **Navigation locale** : étapes, filtres, accordéons, disclosures, sélections et modes d'édition.
5. **Surfaces temporaires ou transactionnelles** : Search Overlay, drawer droit, popover de confiance, expansion Why et parcours de décision plein écran.

### 2.1 Carte générale

```text
NOVA
├── Shell global
│   ├── Nav primaire
│   │   ├── Home
│   │   ├── Work
│   │   ├── Decisions
│   │   └── Deliverables
│   ├── Utilitaires
│   │   ├── Search → Search Overlay
│   │   ├── Notifications → destination ND
│   │   ├── Help → destination ND
│   │   ├── Settings / Preferences → destination ND
│   │   └── Profil → destination ND
│   └── Search Overlay, disponible globalement
├── Home [/home]
│   ├── Composer replié / développé
│   ├── Situation Details Drawer
│   ├── → Clarify
│   ├── → Work actif
│   └── → Decision Package
├── Work Setup
│   ├── Clarify [/clarify]
│   │   └── étapes internes 1 → 2 → 3
│   ├── Canvas [/canvas]
│   │   └── cartes en lecture / édition locale
│   ├── Plan [/plan]
│   │   └── phases dépliées / repliées
│   └── Confirm [/confirm]
│       └── sélection d'autonomie A0–A3
├── Work [/work/:id]
│   ├── Overview
│   │   ├── disclosures Why / Later & Background
│   │   ├── Full Analysis Drawer
│   │   └── → Decision Package
│   ├── Plan
│   ├── Activity
│   │   └── filtres All / Human / AI / Critical / Sources
│   ├── People
│   │   └── Person Detail Drawer
│   ├── Sources
│   │   └── Source Detail Drawer
│   ├── Decisions
│   │   ├── Why inline
│   │   └── → Decision Package
│   └── Deliverables
│       └── Deliverable Detail Drawer
├── Global Decisions [/decisions]
│   ├── filtres de décision
│   └── → Decision Package
├── Global Deliverables [/deliverables]
│   └── filtres de livrable
└── Parcours de décision
    ├── Decision Package [/decisions/:id]
    │   ├── Why inline
    │   ├── Full Package Drawer
    │   └── → Decision Pause
    ├── Decision Pause [/decisions/:id/decide]
    │   ├── Review
    │   └── Decide
    └── Decision Receipt [/decisions/:id/receipt]
        └── → Work
```

### 2.2 Nature des surfaces

| Surface | Nature démontrée | Contexte sous-jacent |
|---|---|---|
| Home, Work Setup, Work, vues globales, Decision Package | Page / vue principale | Remplace le contenu principal |
| Work Overview à Deliverables | Sous-écrans par onglet | Conserve le Work actif, son header et ses onglets |
| Decision Pause Review/Decide | Étapes internes | Conserve le contexte du flux courant |
| Search Overlay | Overlay modal global | Recouvre la page courante puis la restaure à la fermeture |
| Six familles de drawers | Overlay + panneau latéral droit | Conservent la page et son état sous-jacents |
| ConfChip | Popover ancré | Conserve l'écran courant |
| WhyInline, Later & Background | Disclosure inline | Modifie seulement la hauteur/contenu local |
| Decision Pause et Receipt | Pages transactionnelles plein écran | Le shell visible est retiré selon App et les captures |
| Modale applicative distincte | Aucune autre modale démontrée | `ND` |

---

## 3. Arborescence des écrans et sous-écrans

### 3.1 Catalogue canonique

| ID | Écran / sous-écran | Route documentée | Parent logique | Entrées démontrées | Sorties démontrées | Preuve |
|---|---|---|---|---|---|---|
| H01 | Home | `/home` | Shell | Point d'entrée initial ; nav Home ; retours du setup | Clarify, Work, Decision Package, drawer Home | `DOC` |
| H01.1 | Composer replié | état local | Home | Chargement Home ; Cancel du composer | Composer développé | `DOC` |
| H01.2 | Composer développé | état local | Home | Clic composer ; suggestion | Clarify si objectif valide ; retour replié | `DOC` |
| S01 | Clarify | `/clarify` | Work Setup | Composer Continue / Cmd+Enter | Canvas ; étape précédente ; Home | `DOC` |
| S01.1–3 | Questions Clarify | index local | Clarify | Continue ou Skip | Étape suivante ; précédente | `DOC` |
| S02 | Canvas | `/canvas` | Work Setup | Fin de Clarify | Plan ; Clarify | `DOC` |
| S02.x | Carte Canvas en édition | état local | Canvas | Edit d'une carte | Save vers lecture | `DOC` |
| S03 | Plan de préparation | `/plan` | Work Setup | Prepare a plan | Confirm ; Canvas | `DOC` |
| S03.x | Phase ouverte/repliée | état local | Plan | Clic phase | Autre état local | `DOC` |
| S04 | Confirm | `/confirm` | Work Setup | Review and start | Work Overview ; Plan | `DOC` |
| W01 | Work | `/work/:id` | Shell | Nav Work ; Home ; Confirm ; Search ; Receipt | Onglets ; Decision Package ; drawers | `DOC+UX` |
| W01.1 | Overview | onglet | Work | Entrée Work par défaut | autres onglets ; Decision Package ; Full Analysis Drawer | `DOC` |
| W01.2 | Plan | onglet | Work | Clic onglet Plan | autres onglets | `DOC+UX` |
| W01.3 | Activity | onglet | Work | Clic onglet Activity | autres onglets ; filtres locaux | `DOC+UX` |
| W01.4 | People | onglet | Work | Clic onglet People | autres onglets ; Person Drawer | `DOC+UX` |
| W01.5 | Sources | onglet | Work | Clic onglet Sources | autres onglets ; Source Drawer | `DOC+UX` |
| W01.6 | Decisions | onglet | Work | Clic onglet Decisions | autres onglets ; Decision Package | `DOC+UX` |
| W01.7 | Deliverables | onglet | Work | Clic onglet Deliverables | autres onglets ; Deliverable Drawer | `DOC+UX` |
| G01 | Global Decisions | `/decisions` | Shell | Nav Decisions | Decision Package ; filtres | `DOC` |
| G02 | Global Deliverables | `/deliverables` | Shell | Nav Deliverables | filtres ; autres sorties `ND` | `DOC` |
| D01 | Decision Package | `/decisions/:id` | Parcours décision | Work, Global Decisions, Home, Search | Decision Pause ; Full Package Drawer ; Work | `DOC+UX` |
| D02.1 | Decision Pause — Review | `/decisions/:id/decide` + état | Decision Pause | Review and decide | Decide ; Decision Package | `DOC+UX` |
| D02.2 | Decision Pause — Decide | même route + état | Decision Pause | Continue depuis Review | Receipt ; Review | `DOC+UX` |
| D03 | Decision Receipt | `/decisions/:id/receipt` | Parcours décision | Enregistrement réussi | Work ; Share/Export sans destination démontrée | `DOC` |
| O01 | Search Overlay | état global | Shell | Search ; Cmd/Ctrl+K | Fermer ; Work ; Decision Package | `DOC` |

### 3.2 Navigation primaire

La NavRail expose quatre destinations principales :

| Entrée | Destination documentée | Effet de contexte |
|---|---|---|
| Home | Home | Remplace la vue principale |
| Work | Work actif | Utilise `activeWork`; aucun écran de liste Work distinct n'est documenté |
| Decisions | Global Decisions | Affiche les décisions transverses |
| Deliverables | Global Deliverables | Affiche les livrables transverses |

La destination de **Work lorsqu'aucun Work actif n'existe** n'est pas définie. Les données de référence initialisent un Work par défaut (`w1`), mais cela ne définit pas le comportement produit en absence de Work. `ND`

### 3.3 Navigation secondaire Work

Les sept onglets sont des sous-écrans partageant :

- le même identifiant de Work ;
- le breadcrumb Work ;
- le header de Work (confiance, phase, échéance, titre, Pause, More) ;
- la barre d'onglets ;
- la zone de contenu scrollable.

Ordre démontré : **Overview → Plan → Activity → People → Sources → Decisions → Deliverables**. `DOC+UX`

Les onglets ne possèdent pas de sous-routes explicites dans le corpus. Ils sont décrits comme un état local `tab`. La persistance d'un onglet dans l'URL, l'historique navigateur ou un deep link est donc `ND`.

### 3.4 Navigation tertiaire et états locaux

| Contexte | États / commandes locales | Changement de page ? |
|---|---|---|
| Clarify | question 1/2/3, suggestion, texte libre, Why | Non, sauf fin vers Canvas |
| Canvas | lecture/édition par carte | Non |
| Plan de préparation | phase ouverte/repliée | Non |
| Confirm | autonomie A0/A1/A2/A3 | Non |
| Work Activity | All/Human/AI/Critical/Sources | Non |
| Global Decisions | All/Pending/Waiting/Decided ou libellés équivalents | Non |
| Global Deliverables | All/Drafts/In review/Published | Non |
| Decision Package | option sélectionnée, Why ouvert | Non |
| Decision Pause | Review/Decide | Même route documentée, étape interne |

---

## 4. Parcours utilisateur complets

## 4.1 Parcours A — Créer un nouveau Work

```text
Home
  → ouvrir le Composer
  → saisir/sélectionner un objectif
  → Clarify 1
  → Clarify 2
  → Clarify 3
  → Canvas
  → Plan de préparation
  → Confirm
  → Work / Overview
```

| Étape source | Action / condition | Destination | Retour démontré |
|---|---|---|---|
| Home, composer replié | Clic dans le composer | Composer développé | Cancel → replié |
| Home, composer | Suggestion | Composer développé et prérempli | Cancel → replié |
| Home, composer | Continue ou Cmd/Ctrl+Enter avec objectif non vide | Clarify étape 1 | Back → Home |
| Clarify étape 1 | Continue ou Skip | étape 2 | Back → étape 1 |
| Clarify étape 2 | Continue ou Skip | étape 3 | Back → étape 1 |
| Clarify étape 3 | Continue ou Skip | Canvas | Back depuis Canvas → Clarify |
| Canvas | Prepare a plan | Plan de préparation | Back → Clarify |
| Plan de préparation | Review and start | Confirm | Back → Canvas |
| Confirm | Start work | Work actif, Overview | Back → Plan avant démarrage |

Conditions documentées :

- Le CTA du composer est désactivé tant que l'objectif est vide.
- Clarify accepte une suggestion ou un texte libre ; Skip avance.
- Canvas permet la correction locale avant génération du plan.
- Confirm met à jour la fiche d'autonomie avant Start work.

Ambiguïté : le User Flow et l'inventaire décrivent **3 questions Clarify**, tandis qu'une structure de données statique en contient **4**. Aucune autorité ne tranche. Le parcours canonique reste donc « 3 étapes documentées », avec conflit ouvert sur une quatrième éventuelle. `CONFLIT`

## 4.2 Parcours B — Ouvrir un Work existant

Entrées démontrées :

1. Home, hero **Open presentation** → Work `w1`. `DOC`
2. Home, clic sur une ligne Active work → Work correspondant. `DOC`
3. Confirm, **Start work** → Work `w1` / Work créé. `DOC`
4. Search, résultat Work → définit le Work actif puis ouvre Work. `DOC`
5. Nav primaire **Work** → Work actif. `DOC`
6. Decision Receipt, **Return to work** → Work. `DOC`

À l'entrée, Overview est l'onglet de référence. La conservation du dernier onglet lors d'un retour n'est pas explicitement définie. `ND`

## 4.3 Parcours C — Explorer et agir dans un Work

```text
Work
├── Overview
│   ├── Next action / Open → destination ND (placeholder)
│   ├── Why → contenu inline
│   ├── Later & Background → disclosure natif
│   ├── Pending decision → Decision Package
│   └── Full analysis → Full Analysis Drawer
├── Plan → consultation
├── Activity → filtres + commentaire
├── People → Details → Person Drawer
├── Sources → Add/Refresh + Details → Source Drawer
├── Decisions → Why inline + Review & decide → Decision Package
└── Deliverables → Eye + Details → Deliverable Drawer
```

Actions sans navigation démontrée :

- Pause et More dans le header Work ;
- Open sur Next Best Action ;
- Post dans Activity ;
- Invite dans People ;
- Add et Refresh dans Sources ;
- Create et Eye dans Deliverables.

Les spécifications les identifient comme placeholders ou ne donnent aucune destination. Elles ne doivent pas être transformées en routes par déduction. `ND`

## 4.4 Parcours D — Prendre une décision

### Entrées vers le Decision Package

| Origine | Déclencheur | Effet |
|---|---|---|
| Home | carte de décision urgente | Définit la décision active puis ouvre Decision Package |
| Work Overview | carte de décision en attente | Même effet |
| Work Decisions | Review & decide | Même effet |
| Global Decisions | carte pending/waiting cliquable | Même effet |
| Search Overlay | résultat Decision | Même effet et ferme Search |

### Enchaînement transactionnel

```text
Decision Package
  ├── Why → expansion inline
  ├── Full package → Full Package Drawer → fermeture → Decision Package
  └── Review and decide
        → Decision Pause / Review
            ├── Cancel ou Back → Decision Package
            └── I have reviewed — continue
                  → Decision Pause / Decide
                      ├── Back → Review
                      └── choix + rationale requis
                            → état d'enregistrement (~700 ms documentés)
                            → Decision Receipt
                                  └── Return to work → Work
```

Règles démontrées :

- Une option peut être sélectionnée dans Decision Package, mais cette sélection n'est pas requise pour ouvrir Review. `DOC`
- L'étape Decide propose Approve, Request changes, Reject et Defer dans le User Flow et les captures. `DOC+UX`
- L'enregistrement exige à la fois un choix et une rationale non vide. `DOC+UX`
- Le reçu est décrit comme permanent/immutable. `DOC+UX`
- Share receipt et Export sont visibles/documentés, mais leur destination ou résultat n'est pas défini. `ND`

Retour d'origine : Decision Package possède un retour libellé **Back to work**, et Receipt retourne vers Work. Aucun mécanisme de retour différencié vers Global Decisions ou Home n'est décrit lorsque le parcours a commencé dans ces vues. La conservation d'une origine de navigation n'est donc pas démontrée. `ND`

## 4.5 Parcours E — Recherche globale

```text
Écran quelconque du shell
  → Search ou Cmd/Ctrl+K
  → Search Overlay
      ├── query < 2 caractères → éléments récents
      ├── query ≥ 2 caractères → résultats Work + Decisions filtrés
      ├── résultat Work → Work correspondant
      ├── résultat Decision → Decision Package correspondant
      └── Escape / backdrop → écran sous-jacent inchangé
```

La recherche ne démontre pas de résultats People, Sources ou Deliverables. Elle ne démontre pas non plus de page de résultats complète. `ND`

## 4.6 Parcours F — Drawers contextuels

Tous les drawers démontrés sont de premier niveau et recouvrent le contexte courant. Le système est explicitement décrit comme **un seul drawer à la fois**. Aucun drawer ouvrant un autre drawer ou un détail secondaire n'est démontré.

```text
Page sous-jacente
  → déclencheur Details / Full analysis / Full package
  → backdrop + panneau droit
  → X ou backdrop
  → même page sous-jacente, même contexte
```

La fermeture par Escape et la restauration du focus ne sont pas définies dans le corpus V6.1 des drawers ; elles ne peuvent pas être déclarées comme architecture démontrée ici. `ND`

---

## 5. Inventaire des drawers, overlays et panneaux

### 5.1 Drawers

| Drawer | Contexte parent | Déclencheur(s) documenté(s) | Contenu / relation | Capture |
|---|---|---|---|---|
| Home Detail / Situation Details | Home | Details du hero ; Details du strip NOVA selon Interaction Specs | Summary → Why → Blocking → Later → Technical | Aucune capture Home dans les dossiers imposés |
| Work Full Analysis | Work Overview | Full analysis | Analyse détaillée du Work | Aucune capture imposée dédiée |
| Person Detail | Work People | Details d'une personne | Détails de la personne sélectionnée ; variantes humain/NOVA | 4 captures de drawer isolé |
| Source Detail | Work Sources | Details d'une source | Détails de la source sélectionnée | Capture avec Work grisé sous-jacent |
| Deliverable Detail | Work Deliverables | Details d'un livrable | Détails du livrable sélectionné | Capture avec Work grisé sous-jacent |
| Full Package | Decision Package | Full package | Détail narratif de la décision | 2 captures, dont une avec contexte grisé |

Structure commune démontrée : backdrop plein écran, panneau droit, header avec titre et X, body scrollable, sections narratives. `DOC+UX`

Les liens de preuve visibles dans le Full Package Drawer (noms de sources) ne possèdent pas de destination démontrée. Ils ne prouvent pas l'ouverture d'un Source Drawer depuis le drawer de décision. `ND`

### 5.2 Search Overlay

Search est la seule surface explicitement modale et globale. Elle possède son propre backdrop et un panneau centré. Elle ferme après choix d'un résultat et peut être fermée sans changer la vue sous-jacente. `DOC`

### 5.3 Popovers et disclosures

| Élément | Type | Fermeture / retour | Relation de navigation |
|---|---|---|---|
| ConfChip | Popover ancré | X documenté ; outside-click non géré dans la checklist | Aucun changement de page |
| WhyInline | Expansion inline | Second clic / toggle | Aucun changement de page |
| Later & Background | Disclosure natif | Toggle | Aucun changement de page |
| Plan phase | Accordion dans le setup selon docs | Toggle, une phase ouverte à la fois selon checklist | Aucun changement de page |

### 5.4 Modales et sous-menus

- Aucune modale métier distincte de Search Overlay n'est démontrée.
- Aucun menu primaire ouvrant un sous-menu, puis un autre sous-menu, n'est démontré.
- Les onglets Work sont une navigation secondaire directe, pas un sous-menu en cascade.
- Le bouton More (`…`) est visible, mais son menu et ses entrées ne sont pas documentés. `ND`
- Aucun drawer imbriqué n'est démontré.

---

## 6. Composants persistants et changements de contexte

### 6.1 Persistance par famille d'écran

| Contexte | NavRail | Breadcrumb | Header Work | Onglets Work | Overlay possible |
|---|---:|---:|---:|---:|---:|
| Home | Oui selon shell | Non | Non | Non | Search, Home Drawer |
| Work Setup | Oui selon arbre App, mais visibilité UX non confirmée ici | Non | Non | Non | Search |
| Work | Oui | Oui | Oui | Oui | Search, drawer contextuel, popover |
| Global Decisions | Oui | Non | Non | Non | Search |
| Global Deliverables | Oui | Non | Non | Non | Search |
| Decision Package | Oui dans captures | Back to work au lieu du breadcrumb Work standard | Non | Non | Search, Full Package Drawer |
| Decision Pause | Non dans les captures fullscreen et dans la description App | Non | Non | Non | Aucun overlay démontré |
| Decision Receipt | Non selon description fullscreen | Non | Non | Non | Aucun overlay démontré |

Une matrice d'implémentation indique par ailleurs NavRail sur Decision Pause/Receipt, en contradiction avec l'arbre App et les captures Decision Pause. Ce point reste `CONFLIT`; la reconstruction ne fusionne pas les deux états.

### 6.2 Changements de contexte

| Transition | Changement de contexte |
|---|---|
| Home → Clarify | Démarre le contexte Work Setup à partir de l'objectif |
| Clarify → Canvas → Plan → Confirm | Enrichit le même objectif sans changer de Work affiché |
| Confirm → Work | Crée/sélectionne le Work actif et quitte Work Setup |
| Home/Search/Nav → Work | Change `activeWork`, puis affiche Work |
| Home/Work/Global Decisions/Search → Decision Package | Change `activeDecision`, puis entre dans le parcours décision |
| Work tab → Work tab | Conserve `activeWork`, change seulement l'onglet |
| Page → Drawer | Conserve la page, le Work/la décision et les états locaux sous-jacents |
| Page → Search | Conserve la page jusqu'au choix éventuel d'un résultat |
| Decide → Receipt | Ajoute le choix et la rationale à la décision active |
| Receipt → Work | Quitte le contexte transactionnel et réouvre Work |

### 6.3 Dépendances d'état documentées

```text
App state
├── view
├── activeWork
├── activeDecision
└── searchOpen

WorkView local state
└── tab

Écrans locaux
├── composerOpen / objective
├── clarifyStep / answers
├── canvas editing card
├── plan expanded phase
├── confirm autonomy
├── activity filter
├── global list filters
├── drawer selected entity
├── confidence popover
├── why disclosure
└── decision review step / choice / rationale
```

Les documents associent aussi des routes à chaque vue, tout en prescrivant un routeur interne `setView()` sans liens `href`. La synchronisation URL ↔ état, l'historique navigateur, les deep links et le bouton Back du navigateur ne sont pas spécifiés. `CONFLIT/ND`

---

## 7. Matrice des transitions démontrées

| Source | Déclencheur | Destination / effet | Retour / fermeture | Preuve |
|---|---|---|---|---|
| NavRail | Home | Home | — | `DOC` |
| NavRail | Work | Work actif | — | `DOC` |
| NavRail | Decisions | Global Decisions | — | `DOC` |
| NavRail | Deliverables | Global Deliverables | — | `DOC` |
| NavRail / clavier | Search / Cmd-Ctrl+K | Search Overlay | Escape/backdrop | `DOC` |
| Home | Composer click | Composer développé | Cancel | `DOC` |
| Home | Composer submit valide | Clarify 1 | Back → Home | `DOC` |
| Home | Open presentation | Work `w1` | navigation primaire | `DOC` |
| Home | Active work row | Work sélectionné | navigation primaire | `DOC` |
| Home | Decision card | Decision Package `d1` | Back to work documenté | `DOC` |
| Home | Details | Home Drawer | X/backdrop | `DOC` |
| Clarify | Continue/Skip | étape suivante / Canvas | Back | `DOC` |
| Canvas | Edit/Save | état local | Save | `DOC` |
| Canvas | Prepare a plan | Plan setup | Back → Canvas depuis Plan | `DOC` |
| Plan setup | phase toggle | état local | toggle | `DOC` |
| Plan setup | Review and start | Confirm | Back → Plan | `DOC` |
| Confirm | autonomie | état local | nouvelle sélection | `DOC` |
| Confirm | Start work | Work Overview | — | `DOC` |
| Work | onglet | autre sous-écran Work | autre onglet | `DOC+UX` |
| Work Overview | Why | expansion inline | toggle | `DOC` |
| Work Overview | Later & Background | disclosure | toggle | `DOC` |
| Work Overview | décision | Decision Package | Back to work | `DOC` |
| Work Overview | Full analysis | Drawer | X/backdrop | `DOC` |
| Activity | filtre | liste filtrée | autre filtre | `DOC+UX` |
| People | Details | Person Drawer | X/backdrop | `DOC+UX` |
| Sources | Details | Source Drawer | X/backdrop | `DOC+UX` |
| Decisions tab | Why | expansion inline | toggle | `DOC+UX` |
| Decisions tab | Review & decide | Decision Package | Back to work | `DOC+UX` |
| Deliverables tab | Details | Deliverable Drawer | X/backdrop | `DOC+UX` |
| Global Decisions | filtre | liste filtrée | autre filtre | `DOC` |
| Global Decisions | carte pending/waiting | Decision Package | retour d'origine `ND` | `DOC` |
| Global Deliverables | filtre | liste filtrée | autre filtre | `DOC` |
| Decision Package | option | sélection locale | autre option | `DOC+UX` |
| Decision Package | Why | expansion inline | toggle | `DOC+UX` |
| Decision Package | Full package | Drawer | X/backdrop | `DOC+UX` |
| Decision Package | Review and decide | Pause Review | Cancel/Back → Package | `DOC+UX` |
| Pause Review | Continue | Pause Decide | Back → Review | `DOC+UX` |
| Pause Decide | Record valide | Receipt après enregistrement | — | `DOC` |
| Receipt | Return to work | Work | — | `DOC` |
| Search | Work result | Work sélectionné, overlay fermé | — | `DOC` |
| Search | Decision result | Package sélectionné, overlay fermé | — | `DOC` |

---

## 8. Réutilisation entre parcours

### 8.1 Pages utilisées par plusieurs parcours

| Page | Parcours entrants |
|---|---|
| Work | création de Work, reprise Home, nav primaire, recherche, retour après décision |
| Decision Package | Home, Work Overview, Work Decisions, Global Decisions, Search |
| Search Overlay | toutes les pages conservant le shell global |
| Decision Pause / Receipt | toutes les origines de Decision Package convergent vers le même flux |

### 8.2 Structures partagées

- Le shell NavRail est commun aux vues non transactionnelles.
- Work Plan réutilise la structure de phases du Plan de préparation, en lecture seule selon Interaction Specifications.
- Les cartes de décision sont réutilisées entre Home, Work et Global Decisions avec des variantes de densité.
- Les cartes Deliverable sont partagées entre Work Deliverables et Global Deliverables selon l'Information Architecture.
- Les drawers partagent backdrop, panneau, header, body, sections et lignes clé/valeur.
- WhyInline et ConfChip sont transverses à plusieurs écrans.
- Le flux Review → Decide → Receipt est partagé quelle que soit l'origine de la décision.
- Les mêmes entités sélectionnées (`activeWork`, `activeDecision`) alimentent Work, Package, Pause, Receipt et Search.

### 8.3 Réutilisations non prouvées

- Un clic sur une source dans le Full Package Drawer n'est pas prouvé comme ouvrant le Source Drawer.
- Un clic sur une personne dans un drawer ou un reçu n'est pas prouvé comme ouvrant Person Drawer.
- Global Deliverables n'est pas prouvé comme ouvrant Deliverable Drawer, même si le composant de carte est partagé.
- Aucun flux générique de drawer vers détail secondaire n'est prouvé.

---

## 9. Points d'entrée et de sortie

### 9.1 Points d'entrée

| Portée | Point d'entrée démontré |
|---|---|
| Application | Home comme `view` initiale |
| Work Setup | Composer Home soumis |
| Work | Home, Confirm, Search, Nav Work, Receipt |
| Decision flow | Home, Work Overview, Work Decisions, Global Decisions, Search |
| Search | Nav Search ou Cmd/Ctrl+K |
| Drawers | Bouton/lien Details, Full analysis ou Full package du contexte parent |

Les entrées directes par URL, authentification, notification, e-mail ou deep link ne sont pas décrites. `ND`

### 9.2 Points de sortie fonctionnels

- Work Setup sort vers Work après Confirm.
- Decision flow sort vers Work via Receipt.
- Un drawer ou Search fermé restitue le contexte sous-jacent.
- La sortie de l'application, la déconnexion et la fermeture de session ne sont pas décrites. `ND`

---

## 10. Responsive et continuité de navigation

Les Responsive Specifications décrivent des adaptations de disposition, mais pas de nouvelles destinations. La hiérarchie fonctionnelle reste donc identique.

- Desktop : NavRail fixe et drawers latéraux.
- Largeurs plus faibles : réduction des colonnes/grilles, scroll horizontal possible pour les onglets Work.
- Mobile : le comportement exact de remplacement de la NavRail et du drawer n'est pas suffisamment relié à des captures du corpus imposé. Les destinations restent connues, mais leur mécanisme de présentation est `ND` lorsque les spécifications se contredisent.
- Les onglets Work doivent rester accessibles ; aucune navigation mobile alternative nommée n'est démontrée.
- La préservation d'état lors d'un breakpoint ou d'une rotation n'est pas spécifiée. `ND`

---

## 11. Ambiguïtés, conflits et informations manquantes

Ces points ne doivent pas être arbitrairement résolus dans une documentation d'écran ou une implémentation future.

| ID | Sujet | Éléments incompatibles ou manquants | Statut |
|---|---|---|---|
| A01 | Version d'autorité | Docs V6.1 vs captures V7, sans règle de priorité | `CONFLIT` |
| A02 | Routage | Routes formelles listées, mais guide imposant `setView()` sans `href` | `CONFLIT` |
| A03 | Historique navigateur | Aucun contrat URL/state, deep link ou Back navigateur | `ND` |
| A04 | NavRail | 56 px compact dans IA vs 220 px dans plusieurs specs/captures | `CONFLIT` |
| A05 | NavRail fullscreen | Matrice indique présence ; App/captures Pause indiquent absence | `CONFLIT` |
| A06 | Clarify | 3 questions dans flow/inventaire vs 4 dans données statiques | `CONFLIT` |
| A07 | Retour Decision Package | Back to work même depuis Home/Global/Search ; retour d'origine absent | `ND` |
| A08 | Nav Work sans Work actif | Aucun écran Work list ni empty state de destination | `ND` |
| A09 | Onglets Work dans URL | État local documenté, aucune sous-route | `ND` |
| A10 | Plan Work | Interaction Specs : lecture seule ; autres docs parlent de phases/accordion ; capture montre plusieurs contenus visibles | `CONFLIT` |
| A11 | Global Decisions | Libellés de filtres All/Needs my decision/Waiting/History vs All/Pending/Waiting/Decided | `CONFLIT` sémantique |
| A12 | Global Deliverables | Filtres inventoriés mais interactions/destinations de lignes incomplètes ; aucune capture globale certaine | `ND` |
| A13 | Drawer Home | Deux triggers Details documentés, aucune capture Home dans les dossiers imposés | `DOC` sans validation UX |
| A14 | Drawer Escape/focus | Non défini dans les specs V6.1 | `ND` |
| A15 | Liens dans drawers | Sources/personnes visuellement cliquables parfois, destinations absentes | `ND` |
| A16 | More/Pause | Commandes visibles sans menu/transition démontré | `ND` |
| A17 | Notifications/Help/Preferences/Profile | Entrées visibles sans écrans cibles | `ND` |
| A18 | Actions placeholder | Next action Open, Post, Invite, Add/Refresh, Create, Eye, Share, Export | `ND` |
| A19 | Search | Seulement Work et Decisions démontrés ; autres types absents | `ND` |
| A20 | Modales | Aucune modale métier autre que Search Overlay | `ND` pour toute autre modale |
| A21 | Sous-menus imbriqués | Aucun cas démontré | Non présent dans le corpus |
| A22 | Drawers imbriqués | Système « un drawer à la fois » ; aucun détail secondaire démontré | Non présent dans le corpus |
| A23 | Auth/permissions/erreurs | Aucun parcours de connexion, refus d'accès, 404, offline ou erreur réseau | `ND` |
| A24 | Responsive navigation | Mécanisme mobile précis et conservation de contexte insuffisamment démontrés | `ND` |
| A25 | Dimensions d'overlays | Search, drawer, popover et pages étroites ont plusieurs valeurs contradictoires | `CONFLIT` visuel, sans effet sur la carte fonctionnelle |
| A26 | `15_JSX_REFERENCE` | Contenu hors sujet CEREBRAU, aucune référence JSX NOVA | Source contaminée/inexploitable |
| A27 | Captures Figma | Chrome éditeur présent dans certaines images | Artefact exclu |
| A28 | Nommage Deliverables | Dossier `DELIVBERABLES`, captures montrant l'onglet Work | Ambiguïté de classement |
| A29 | Breadcrumb Work | Le libellé « Work » est documenté comme renvoyant Home, pas une liste Work | Comportement contre-intuitif mais `DOC` |
| A30 | État conservé au retour | Dernier onglet, scroll, filtres et disclosures après drawer/decision non contractualisés | `ND` |

---

## 12. Décisions architecturales factuelles

Les seules décisions que le corpus permet d'établir sans hypothèse sont :

1. Home est le point d'entrée applicatif documenté.
2. La création d'un Work est un flux linéaire Home → Clarify → Canvas → Plan → Confirm → Work.
3. Work est un contexte persistant à sept onglets, pas sept produits indépendants.
4. Global Decisions et Global Deliverables sont des vues transverses distinctes des onglets homonymes de Work.
5. Decision Package est la page de convergence de toutes les décisions nécessitant un examen.
6. Review et Decide constituent deux étapes d'une même Decision Pause transactionnelle.
7. Receipt termine le flux de décision et renvoie vers Work.
8. Search est un overlay global qui peut changer le Work ou la décision active.
9. Les drawers sont contextuels, latéraux, non routés et limités à un niveau démontré.
10. Les popovers, disclosures, filtres, accordéons et éditions inline ne créent pas de nouveaux écrans.
11. Aucun sous-menu en cascade, drawer imbriqué ou autre modale métier n'est démontré.
12. Toute relation marquée `ND` ou `CONFLIT` exige une décision produit/documentaire avant implémentation.

---

## 13. Index exhaustif des sources lues

Tous les fichiers présents dans `Docs/24_MODULES/0-UI-DESIGN/SOURCE/` ont été lus :

1. `01_SCREEN_INVENTORY.md.txt`
2. `# 02 — USER FLOW.txt`
3. `# 03 — INFORMATION ARCHITECTURE.txt`
4. `# 04 — COMPONENT LIBRARY.txt`
5. `# 05 — DESIGN TOKENS.txt`
6. `# 06 — COLOR SYSTEM.txt`
7. `07_TYPOGRAPHY.md.txt`
8. `# 08 — LAYOUT SYSTEM.txt`
9. `# 09 — COMPONENT SPECIFICATIONS.txt`
10. `# 10 — DRAWER SPECIFICATIONS.txt`
11. `# 11 — INTERACTION SPECIFICATIONS.txt`
12. `# 12 — RESPONSIVE SPECIFICATIONS.txt`
13. `# 13 — ACCESSIBILITY.txt`
14. `# 14 — CSS REFERENCE.txt`
15. `15_JSX_REFERENCE.md`
16. `# 16 — REACT COMPONENT TREE.txt`
17. `# 17 — DEPENDENCY GRAPH.txt`
18. `# 18 — IMPLEMENTATION GUIDE.txt`
19. `# 19 — PIXEL-PERFECT CHECKLIST.txt`
20. `# 20 — IMPLEMENTATION MATRIX.txt`
21. `FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md`
22. `HOME_PIXEL_PERFECT_SPEC.txt`

Les documents de couleur, typographie, tokens et CSS ne créent pas de transition supplémentaire ; ils confirment la distinction visuelle entre shell, pages, états locaux, overlays, drawers et popovers.

---

## 14. Index exhaustif des captures analysées

### WORK

1. `DRAWER_DECISION_PACKAGE_WORK_REVIEW-V7.png` — Full Package Drawer isolé.
2. `NOVA-RECORD-YOUR-DECISION-V7.png` — Decision Pause, étape Decide, plein écran.
3. `NOVA-REVIEW-DECISION-V7.png` — Decision Pause, étape Review, plein écran.
4. `NOVA-REVIEW-V7.png` — Decision Package avec NavRail et CTA/drawer.

### PLAN

5. `NOVA-WORK-PLAN.png` — Work, onglet Plan, shell et sept onglets.

### Activity

6. `NOVA_ACTIVITY_AI.png` — Activity filtré AI.
7. `NOVA_ACTIVITY_SOURCES.png` — Activity filtré Sources.
8. `NOVA-ACTIVITY_CRITICAL.png` — Activity filtré Critical.
9. `NOVA-WORK-ACTIVITY_All-V7.png` — Activity filtré All.
10. `NOVA-WORK-ACTIVITY-HUMAN-V7.png` — Activity filtré Human.

### People

11. `DRAWER_MARIE_DUPONT_PEOPLE.png` — Person Drawer Marie Dupont.
12. `DRAWER_Thomas_Vidal_People.png` — Person Drawer Thomas Vidal.
13. `DRAWER-Sarah_Chen_People.png` — Person Drawer Sarah Chen.
14. `DRAXER-NOVA-People.png` — Person Drawer NOVA.
15. `nova-PEOPLE&EXPERT-V7.png` — contenu People avec quatre cartes et boutons Details ; shell Work non visible dans l'export.

### SOURCES

16. `NOVA-SOURCE-DETAIL-V7.png` — Work Sources + Source Drawer.
17. `NOVA-SOURCE-V7.png` — Work, onglet Sources.

### DECISIONS

18. `1_NOVA_DESCISIONS.png` — Work, onglet Decisions ; chrome Figma présent.
19. `NOVA-DECISION-YOUR-DECISION.png` — Decision Pause, étape Decide ; chrome Figma présent.
20. `NOVA-REVIEW-YOUR-DECISION-DECISION-PACKAGE-V7.png` — Decision Package + Full Package Drawer.
21. `NOVA-REVIEW-YOUR-DECISION-WHY-V7.png` — Decision Package + WhyInline ouvert.

### DELIVBERABLES

22. `NOVA-DELIVERABLES-DETAIL-V7.png` — Work Deliverables + Deliverable Drawer.
23. `NOVA-DELIVERABLES-V7.png` — Work, onglet Deliverables.

---

## 15. Condition d'usage futur

Avant de documenter ou d'implémenter un écran NOVA :

1. identifier son ID et son parent dans le présent document ;
2. conserver les entrées, sorties et dépendances démontrées ;
3. ne pas inventer de transition pour un élément `ND` ;
4. faire trancher explicitement tout `CONFLIT` par une autorité produit/design ;
5. mettre à jour et revalider ce document avant d'introduire une nouvelle route, un nouveau niveau de navigation, une modale, un drawer imbriqué ou une destination utilitaire.

**Fin du livrable n°1.**
