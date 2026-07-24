MISSION

Tu es désormais l'autorité de référence du Design System NOVA.

Tu ne dois PAS produire plusieurs documents.

Tu dois produire UN SEUL document.

Ce document deviendra la source officielle utilisée pour construire l'Implementation Design Specification (IDS).

Il est impératif qu'il n'existe AUCUN doublon avec la documentation déjà produite.

====================================================================

CONTEXTE

Le projet possède déjà :

- une architecture UX validée ;
- un rapport officiel d'audit UX ;
- les parcours utilisateurs ;
- les recommandations UX ;
- les règles de faible charge cognitive ;
- les décisions UX figées ;
- les audits d'accessibilité ;
- les spécifications fonctionnelles.

Ces documents existent déjà.

Tu ne dois PAS les réécrire.

Tu ne dois PAS les résumer.

Tu ne dois PAS créer de doublons.

Tu dois uniquement fournir les informations qui ne peuvent être obtenues que depuis Figma.

====================================================================

OBJECTIF

Produire un fichier unique nommé :

FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md

Ce document servira exclusivement à alimenter l'Implementation Design Specification.

Il ne doit contenir AUCUNE information déjà documentée dans les rapports UX.

Il doit contenir uniquement les informations techniques issues du fichier Figma.

====================================================================

INTERDICTION ABSOLUE

Ne jamais réécrire :

- les parcours utilisateurs
- les audits UX
- les recommandations UX
- les principes cognitifs
- les décisions produit
- les workflows métier
- les descriptions fonctionnelles

Ces éléments existent déjà.

Ne produire QUE les données intrinsèques au fichier Figma.

====================================================================

# SECTION 1

DOCUMENT METADATA

Nom du fichier Figma

Version

Date

Pages

Frames

Nombre de composants

Nombre de variants

Nombre de variables

Nombre de styles

Bibliothèques utilisées

| Champ | Valeur vérifiable | Source |
|---|---|---|
| Nom/date/pages/frames Figma | Non disponibles dans SOURCE | Ensemble SOURCE |
| Version documentée | NOVA V6.1 | En-têtes SOURCE |
| Composants techniques documentés | 31 éléments de construction React, `App` inclus | `# 16`, `# 18` |
| Variants/variables/styles Figma | Non disponibles | Ensemble SOURCE |
| Bibliothèques techniques | React 18, React DOM 18, Lucide React ; Vite et TypeScript | `# 17` |
| Cible | Desktop fixe, light mode | `# 12`, `# 06` |

====================================================================

# SECTION 2

PAGE TREE

Arborescence complète

Pages

Frames

Sections

Sous-sections

Ordre exact

Hiérarchie

```text
App
├── Home [/home] → Composer collapsed|expanded
├── Work Setup → Clarify [/clarify] → Canvas [/canvas] → Plan [/plan] → Confirm [/confirm]
├── Work [/work/:id]
│   ├── Overview ├── Plan ├── Activity ├── People ├── Sources ├── Decisions └── Deliverables
├── Global Decisions [/decisions]
├── Global Deliverables [/deliverables]
├── Decision Package [/decisions/:id]
├── Decision Pause [/decisions/:id/decide] → Review → Decide
└── Decision Receipt [/decisions/:id/receipt]
```

Ordre runtime : `App` → `NavRail` + `main[view]` + `SearchOverlay` conditionnel. Source : `01_SCREEN_INVENTORY`, `# 03`, `# 16`.

====================================================================

# SECTION 3

FRAME INVENTORY

Pour chaque Frame

Nom

ID

Dimensions exactes

Position

Constraints

Layout

Parent

Children

Type

Les SOURCE ne fournissent aucun frame ID Figma, position X/Y ou constraint Figma. Inventaire des conteneurs techniques :

| Conteneur | Dimension/layout documenté | Parent | Type |
|---|---|---|---|
| App | 100vw × 100vh, flex row, overflow hidden | racine | shell |
| Home | padding 28px 32px ; max-width 880px uniquement dans `#05` | main | écran |
| Clarify | max-width 640px (`#03/#08/#12`) ou 600px (`#05`) | main | écran centré |
| Canvas | grid 3 colonnes, gap 16px ; max-width 680px dans `#05` | main | écran |
| Plan | liste de 4 phases ; max-width 720px dans `#05` | main | écran |
| Confirm | 560px (`#03/#08/#12`) ou 580px (`#05`) | main | écran centré |
| Work | flex column, height 100 %, overflow hidden | main | shell |
| Work Overview | `2fr 1fr`, gap 20px ; `1fr 280px` dans `#05` | Work | onglet |
| Decision Package | 800px ou 780px selon SOURCE | main | écran |
| Decision Pause/Receipt | 560px ou 520px selon SOURCE | fullscreen | écran |
| SearchOverlay | 560px ou max-width 520px selon SOURCE | App | overlay |
| Drawer | 460px × 100vh | page | overlay |

Les valeurs contradictoires sont conservées en section 22.

====================================================================

# SECTION 4

COMPONENT INVENTORY

Pour chaque composant

Nom

ID

Description

Catégorie

Parent

Children

Slots

Usage

Occurrences

### Partagés

| Nom | Catégorie | Children/slots | Usage |
|---|---|---|---|
| NOVALabel | atom | Sparkles, texte | attribution NOVA |
| ConfChip | atom interactif | trigger, popover | confiance |
| DeadlineBadge | atom | Clock, texte | échéance |
| StatusDot | micro-atom | aucun | disponibilité |
| Btn | atom interactif | icon, children | actions |
| Card | container | children | surfaces |
| WhyInline | disclosure | trigger, children | explication |
| Drawer | overlay composé | header, close, body | détail |
| DrawerSection | layout atom | label, children | section |
| DrawerRow | data row | label, value | clé/valeur |
| NavRail | shell | NavItem privé, profil | navigation |
| SearchOverlay | overlay | input, results | recherche |

### Privés/inline

`NavItem` (NavRail), `WorkBreadcrumb` (WorkView), Composer, suggestion pills, work rows, CanvasCard, PhaseRow, ActivityEvent, filter pill, PersonCard, SourceCard, DecisionOption.

### Composés

`HomeView`, `ClarifyView`, `CanvasView`, `PlanView`, `ConfirmView`, `WorkView`, sept `Work*Tab`, `DecisionPackageView`, `DecisionPauseView`, `DecisionReceiptView`, `GlobalDecisionsView`, `GlobalDeliverablesView`, `App`.

IDs et occurrences Figma : indisponibles. Occurrences fonctionnelles : matrice `# 20`.

====================================================================

# SECTION 5

COMPONENT PROPERTIES

Toutes les propriétés

Booleans

Strings

Variants

States

Default values

Optional values

Required values

| Composant | Requis | Optionnel/default | State |
|---|---|---|---|
| NOVALabel | — | `size sm|xs`, default sm dans `#04` | — |
| ConfChip | pct, reasons | afterAction, positive, missing | open |
| DeadlineBadge | date:string (`#04/#16`) ou days:number (`#09`) | — | calcul ≤4/≤10 |
| StatusDot | status 3 valeurs (`#04`) ou ok:boolean (`#09`) | — | — |
| Btn | children | variant, size, icon, loading, disabled, onClick, full | hover |
| Card | children | onClick, style, accent | hover |
| WhyInline | children | — | open |
| Drawer | open, onClose, title, children | — | contrôlé |
| DrawerSection | label, children | — | — |
| DrawerRow | label, value | color | — |
| NavRail | view, setView, onSearch | — | hover local |
| SearchOverlay | onClose, setView, setActiveWork, setActiveDecision | open selon SOURCE | q, ref |
| WorkView | signatures divergentes documentées en section 22 | — | tab |
| DecisionPackageView | decision, setView | — | sel, detailOpen |
| DecisionPauseView | decision, setView | — | step, choice, rationale, loading |

====================================================================

# SECTION 6

VARIANTS

Toutes les variantes

Hover

Pressed

Focused

Disabled

Loading

Selected

Active

Error

Success

Warning

Empty

Expanded

Collapsed

Drawer

Modal

Toutes les autres variantes présentes.

| Élément | Variants/states documentés |
|---|---|
| NOVALabel | sm, xs ; autre version unique 11px dans `#09` |
| ConfChip | closed/open ; high ≥80, medium 55–79, low <55 ; contenu conditionnel |
| DeadlineBadge | urgent ≤4, warning ≤10, normal >10 |
| StatusDot | available/busy/away ou boolean selon SOURCE |
| Btn | primary/secondary/quiet ; sm/md ou sm/md/lg ; default/hover/disabled/loading |
| Card | default, clickable hover, accent |
| WhyInline | collapsed/expanded |
| Drawer | closed/open ; aucune animation implémentée |
| NavItem | default/hover/active/badge |
| Search | recent/query/no-results/result hover |
| Composer | collapsed/expanded/empty/filled/loading/disabled |
| Clarify | unselected/selected/custom/skipped |
| Canvas | read/editing/warning |
| Phase | complete/active/future/expanded/collapsed/blocker |
| Autonomy | A0/A1/A2/A3 selected/unselected |
| Activity | all/human/ai/critical/sources ; comment empty/filled |
| Source | missing/stale/available |
| Decision | option selected/unselected/recommended ; risk Low/Medium/High ; review/decide/loading/receipt |

Pressed, focus, error et empty ne sont pas définis comme variants Figma.

====================================================================

# SECTION 7

AUTO LAYOUT

Pour chaque Frame

Direction

Padding

Gap

Distribution

Alignment

Sizing

Hug

Fill

Fixed

Constraints

Wrap

Spacing

Auto Layout Figma, Hug, Fill et constraints par nœud : indisponibles. Équivalents CSS vérifiables :

| Conteneur | Direction | Padding | Gap | Sizing |
|---|---|---|---|---|
| App | flex row | 0 | 0 | viewport fixe |
| Main | flex column | 0 | 0 | flex 1, min-width 0 |
| NavRail compact | flex column | 12px 0 | groupes 2px | 56px fixe |
| NavRail large | flex column | 24px 16px 20px | 1px | 220px fixe |
| Overview | grid | 20px 24px | 20px | 2fr 1fr |
| Canvas | grid | page 28px 32px | 16px | 3 × 1fr |
| Drawer | flex column | 18×20/body20 ou 20×24/body24 | sections 24px | 460px |
| Search | flex overlay | top120 ou 72×24 | 10–12px | 560/max520 |
| Filter row | flex row wrap | 0 | 6px | wrap |
| Person card | flex row | 14px 16px | 12px | body flex 1 |

====================================================================

# SECTION 8

DESIGN TOKENS

Tous les tokens

Spacing

Radius

Border

Shadow

Opacity

Elevation

Motion

Duration

Blur

Stroke

Typography

Icon sizes

Grid

- Spacing SOURCE : 2, 4, 6, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 44, 48, 52, 64, 72, 100px ; échelle principale `#08` : 4 à 96px.
- Radius : 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 999px, 50%.
- Shadows : `SH.card`, `SH.cardHv`, `SH.overlay`, `SH.hero` avec valeurs exactes section 18.
- Borders : 1px default/medium/strong ; 1.5px active ; 2px nav/focal ; 3px accent.
- Opacity : .7 icon, .65 subcaption, .7 confidence label, .4 disabled.
- Z-index : popover 20 ou 30 ; drawer 50/51 ; search 100.
- Blur : drawer 2px ; search 2px ou 3px.
- Motion : 120ms fast, 200ms std, 280ms composer, spinner 1s linear, submit 500ms, record 700ms.
- Typography : tailles 9–27px, Inter/Roboto Mono ; détails section 11.
- Dimension tokens : buttons 32/40/48 ; status 7 ; avatar 22/26/28/36/38 ; step 18/24 ; progress 3/4/6 ; textareas 64/72/80/88 ; results 320/360.

====================================================================

# SECTION 9

VARIABLES

Toutes les variables

Nom

Type

Valeur

Collection

Mode

Références

Alias

Les SOURCE fournissent des constantes TypeScript, pas des variables Figma :

| Constante | Type | Contenu |
|---|---|---|
| N | objet | 21 tokens couleur light mode |
| SH | objet | card, cardHv, overlay, hero |
| FONT | string | Inter + fallbacks |
| MONO | string | Roboto Mono + fallbacks |
| T.fast | string | all 120ms cubic-bezier(.2,0,0,1) |
| T.std | string | all 200ms cubic-bezier(.2,0,0,1) |

Collections, modes et aliases Figma : indisponibles.

====================================================================

# SECTION 10

COLOR SYSTEM

Toutes les couleurs

HEX

RGBA

Variables

Alias

Utilisation

Mode

### Palette primitive light mode

| Token | HEX | RGBA | Usage |
|---|---|---|---|
| N.canvas | #F8FAFC | rgba(248,250,252,1) | page |
| N.surface | #FFFFFF | rgba(255,255,255,1) | surface |
| N.subtle | #F1F5F9 | rgba(241,245,249,1) | muted/hover |
| N.text | #0F172A | rgba(15,23,42,1) | principal |
| N.textSec | #475569 | rgba(71,85,105,1) | secondaire |
| N.textDis | #94A3B8 | rgba(148,163,184,1) | disabled/time |
| N.border | #E2E8F0 | rgba(226,232,240,1) | bordure |
| N.borderMd | #CBD5E1 | rgba(203,213,225,1) | medium |
| N.borderSt | #94A3B8 | rgba(148,163,184,1) | strong |
| N.action | #1D4ED8 | rgba(29,78,216,1) | CTA/nav |
| N.actionHv | #1E40AF | rgba(30,64,175,1) | hover |
| N.actionBg | #EFF6FF | rgba(239,246,255,1) | selected |
| N.successBg | #F0FDF4 | rgba(240,253,244,1) | success bg |
| N.success | #166534 | rgba(22,101,52,1) | success |
| N.warnBg | #FFFBEB | rgba(255,251,235,1) | warning bg |
| N.warn | #92400E | rgba(146,64,14,1) | warning |
| N.critBg | #FEF2F2 | rgba(254,242,242,1) | critical bg |
| N.crit | #991B1B | rgba(153,27,27,1) | critical |
| N.innoBg | #F5F3FF | rgba(245,243,255,1) | NOVA bg |
| N.inno | #6D28D9 | rgba(109,40,217,1) | NOVA |
| N.innoBrd | #DDD6FE | rgba(221,214,254,1) | NOVA border |

Dérivés : #BBF7D0, #FDE68A, #FECACA, #B45309, #D97706, #FFF7F0, #2563EB, #7C3AED. Confidence : ≥80 vert ; 55–79 ambre ; <55 rouge. Gradients : Home/Overview `#EFF6FF→#F5F3FF`, Decision `#FEF2F2→#FFF7F0`, logo `#1D4ED8→#6D28D9`, avatar `#2563EB→#7C3AED`. Aucun dark mode.

====================================================================

# SECTION 11

TYPOGRAPHY

Toutes les typographies

Police

Poids

Taille

Hauteur

Espacement

Alignement

Style

Token

- FONT : Inter → system-ui → -apple-system → sans-serif.
- MONO : Roboto Mono → SF Mono → ui-monospace → monospace.
- Poids : 400, 500, 600, 650, 700. L’import Google Fonts ne déclare que 400/500/600/700.
- Tailles : 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 27px.
- Line-height : 1, 1.3, 1.4, 1.45, 1.5, 1.55, 1.6, 1.65.
- Letter-spacing : -0.035em à 0.07em selon inventaire `07_TYPOGRAPHY`.
- Alignements : left par défaut, center pour receipt/contrôles, right pour DrawerRow value.
- Italique : dissent Decision Package.

====================================================================

# SECTION 12

ICONS

Inventaire complet

Nom

Dimensions

Bibliothèque

Couleur

Container

Utilisation

Bibliothèque : Lucide React, 29 imports. Inventaire : Home, Briefcase, Scale, FileText, Search, Bell, HelpCircle, Settings, ChevronRight, ChevronDown, ChevronLeft, Plus, Check, AlertTriangle, Clock, ArrowRight, MoreHorizontal, Edit2, Eye, Paperclip, Mic, MessageSquare, Download, Upload, Info, CheckCircle, RefreshCw, Lock, StopCircle, Send, Sparkles, Circle, User, X.

Tailles : 7–20px selon contexte ; stroke 2, 2.5 ou 3. Couleur héritée ou token contextuel. Aucun container Figma ni SVG autonome disponible.

====================================================================

# SECTION 13

SPACING SYSTEM

Toutes les valeurs

4

8

12

16

20

24

32

...

Tous les espacements réellement utilisés.

Base déclarée : 4px. Valeurs réelles recensées : 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 44, 48, 52, 64, 72, 96, 100, 120px. Valeurs 3/5/7 : gaps/marges internes ; 120px : padding top Search dans plusieurs SOURCE.

====================================================================

# SECTION 14

GRID

Desktop

Tablet

Mobile

Colonnes

Marges

Gutters

Container

Breakpoints

- Desktop : minimum annoncé ~960×640 ; optimal 1280–1440×800–900 ; maximum utile ~1600.
- Grids CSS : Overview 2fr/1fr gap20 ; Canvas 3×1fr gap16 ; impacts 2×1fr gap8 ; Pause/Receipt 2×1fr gap12 ; contributions 2×1fr gap12.
- Grille Figma globale, colonnes, marges et gutters : indisponibles.
- Tablet/mobile : non définis.
- Breakpoints : aucun.

====================================================================

# SECTION 15

RESPONSIVE RULES

Toutes les règles

Resize

Constraints

Collapse

Hide

Priority

Wrapping

Application desktop-first fixe sans media query. Sous ~900px : aucun collapse ; labels NavRail potentiellement coupés ; grids compressées ; drawer superposé. Font/icon/radius/shadow/color/timing/colonnes/overlays ne changent pas. `flex-wrap` est documenté pour les filtres Activity. Aucun print, dark mode ou density switch.

====================================================================

# SECTION 16

IMAGE ASSETS

Toutes les images

Nom

Dimensions

Usage

Compression

Aucun nom de layer image, dimension d’asset, usage runtime ou niveau de compression n’est fourni. Les captures PNG hors SOURCE ne sont pas déclarées comme assets runtime.

====================================================================

# SECTION 17

SVG

Inventaire

Nom

Dimensions

Utilisation

Aucun SVG exporté n’est inventorié. Les icônes Lucide sont rendues en SVG par la bibliothèque, mais aucun fichier SVG SOURCE n’est fourni.

====================================================================

# SECTION 18

CSS EQUIVALENT

Pour chaque composant

Classe CSS proposée

Variables CSS

Layout

Flex

Grid

Padding

Gap

Border

Radius

Shadow

Position

Overflow

Styles NOVA inline React exclusivement ; aucune classe CSS NOVA ni utility Tailwind dans JSX.

```text
SH.card    = 0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04)
SH.cardHv  = 0 4px 12px rgba(15,23,42,.08), 0 2px 4px rgba(15,23,42,.04)
SH.overlay = 0 20px 48px rgba(15,23,42,.16), 0 4px 8px rgba(15,23,42,.08)
SH.hero    = 0 2px 20px rgba(29,78,216,.10), 0 1px 4px rgba(29,78,216,.06)
```

| Élément | Layout/dimension | Padding/gap | Border/radius/shadow | Overflow |
|---|---|---|---|---|
| App | flex, 100vw×100vh | 0 | canvas | hidden |
| Nav compact | column, 56px | 12px 0 | right 1px | hidden |
| Card | block | 16px | 1px/r12/SH.card | visible |
| Hero | block | 22×24 | 1px/r16/SH.hero | visible |
| Focal | block | 22×26 | 2px/r14/ring | visible |
| Drawer | fixed right 460px | source divergente | SH.overlay | body auto |
| Search | fixed 560/max520 | source divergente | r16/r13 | results auto |
| Work tabs | flex | 0×24 ; tabs 10×16 ou 9×13 | bottom 2px | nowrap |
| Progress | flex | h3/h4/h6 | r999 | hidden |

Scrollbar : 4px, thumb #CBD5E1, hover #94A3B8. Keyframes : spin, pulse.

====================================================================

# SECTION 19

JSX STRUCTURE

Pour chaque écran

Arborescence JSX

Nom des composants

Children

Composition

Props visibles

```text
App
├── NavRail → NavItem×8 + UserProfileRow
├── main
│   ├── HomeView → Card, DeadlineBadge, ConfChip, Drawer
│   ├── ClarifyView → Btn
│   ├── CanvasView → Btn
│   ├── PlanView → Btn
│   ├── ConfirmView → ConfChip, Btn
│   ├── WorkView
│   │   ├── Overview → NOVALabel, ConfChip, DeadlineBadge, WhyInline, Btn, Card, Drawer
│   │   ├── Plan
│   │   ├── Activity
│   │   ├── People → NOVALabel, StatusDot, Btn, Drawer
│   │   ├── Sources → Btn, Drawer
│   │   ├── Decisions → Card, DeadlineBadge, ConfChip, WhyInline, Btn
│   │   └── Deliverables → ConfChip, Btn, Drawer
│   ├── DecisionPackage → NOVALabel, DeadlineBadge, ConfChip, WhyInline, Btn, Drawer
│   ├── DecisionPause → Btn
│   ├── DecisionReceipt → Btn
│   ├── GlobalDecisions → Card, DeadlineBadge, ConfChip, Btn
│   └── GlobalDeliverables → ConfChip, Btn
└── SearchOverlay conditionnel
```

`15_JSX_REFERENCE.md` ne contient aucun JSX NOVA ; il contient une consigne de rapport CEREBRAU.

====================================================================

# SECTION 20

DEPENDENCY GRAPH

Relations entre

Frames

Components

Variants

Variables

Styles

Assets

- Runtime : React 18, React DOM 18, Lucide React.
- Build : Vite, React plugin, TypeScript, Tailwind infrastructure, PostCSS, Autoprefixer.
- Non utilisés : motion/framer-motion, Radix UI, Recharts, Sonner, date-fns, tailwind-merge, clsx.
- `confColor` → ConfChip, readiness, probabilities, drawer scores.
- `WORK_ITEMS` → Home, Work, Search, Global Deliverables.
- `DECISIONS` → Home, Package, Pause, Receipt, Global Decisions, Search.
- `CLARIFY_QS` → Clarify ; `CANVAS_ITEMS` → Canvas ; `PLAN_PHASES` → Plan/WorkPlan ; `AUTONOMY_LEVELS` → Confirm.
- Root state : view, activeWork, activeDecision, searchOpen. États locaux documentés dans `#16/#20`.
- Relations natives Figma entre frames/components/variants/variables/styles/assets : indisponibles.

====================================================================

# SECTION 21

IMPLEMENTATION NOTES

Lister uniquement les contraintes techniques observables dans Figma.

Pas de recommandations UX.

Pas d'interprétation.

Uniquement des faits.

1. Prototype documenté dans `src/app/App.tsx` (~1700 lignes selon SOURCE).
2. Styles inline ; navigation `setView()` sans router/href.
3. Données statiques au module scope.
4. Search : Cmd/Ctrl+K, autofocus, Escape/backdrop/result close, seuil 2 caractères.
5. Composer : autofocus 50ms, trim guard, Cmd+Enter documenté, délai 500ms.
6. Phase : un accordéon ouvert, chevron 200ms, contenu instantané.
7. Drawer : X/backdrop ; sans animation, Escape ni focus trap.
8. ConfChip : toggle/close ; sans outside dismiss ni Escape.
9. Decision Package : option non requise pour passer à Review.
10. Decide : choice + rationale, loading 700ms, aucune persistance.
11. Placeholders : attach, mic, Work overflow, Overview Open, Source Add/Refresh, Deliverable preview, Activity Post, Receipt Share/Export, notifications, help, settings, profil.
12. Canvas Save abandonne la valeur ; autonomie non persistée ; phases hardcodées ; decision record non stocké.
13. Accessibilité déclarée non WCAG 2.1 AA : ARIA, focus trap, Escape drawer/popover, live regions, skip link absents.

====================================================================

# SECTION 22

KNOWN LIMITATIONS

Lister explicitement ce que Figma ne peut pas fournir.

Exemples :

- logique métier
- backend
- calculs
- API
- règles serveur

### Indisponible

Fichier/URL Figma ; pages, frames, nodes et IDs ; layer tree ; positions ; constraints et Auto Layout Figma ; Hug/Fill ; component properties/variants Figma ; variables, collections, modes, aliases et styles Figma ; Dev Mode ; assets images ; SVG ; prototype links ; historique/date Figma ; occurrences et bibliothèques Figma ; backend/API/auth/permissions/persistance/calculs serveur.

### Conflits SOURCE non résolus

| Sujet | Valeur A | Valeur B |
|---|---|---|
| NavRail | 56px compact (`#03/#08/#12/#14/#19`) | 220px large (`#05/#09/#07`) |
| Clarify | 640px | 600px |
| Confirm | 560px | 580px |
| Decision Package | 800px | 780px |
| Search | 560/r16/top120/blur2 | max520/r13/pad72/blur3 |
| Drawer padding | header18×20/body20 | header20×24/body24 |
| ConfChip | pill/260/top-8 | transparent/min240-max300/below |
| Btn | r8, sm/md padding | r9, 32/40/48 sm/md/lg |
| NOVALabel | 9/10px sm/xs | 11px unique |
| StatusDot | 3 statuts | boolean |
| Clarify | 3 questions dans flow | 4 dans static data note |
| Search results | max320 | max360 |

Aucune date ou priorité de source ne résout factuellement ces conflits.

====================================================================

FORMAT

Un seul fichier Markdown.

Aucun autre document.

Aucune annexe.

Aucun ZIP.

Aucun export multiple.

Aucune duplication avec les documents UX existants.

====================================================================

OBJECTIF FINAL

Ce document doit constituer la seule référence technique issue de Figma.

L'Implementation Design Specification (IDS) utilisera ce document comme unique source Figma.

Le document doit être suffisamment exhaustif pour qu'aucun retour ultérieur dans Figma ne soit nécessaire pour l'implémentation pixel-perfect du frontend.

====================================================================

# SECTION 23 — TRAÇABILITÉ ET VÉRIFICATION FINALE

## Tableau de traçabilité des informations intégrées

| Section du document mise à jour | Fichier SOURCE utilisé | Type d'information | Remplacement d'une déduction OUI/NON |
|---|---|---|---|
| 1–3 | `01_SCREEN_INVENTORY.md.txt`, `# 03 — INFORMATION ARCHITECTURE.txt`, `# 08 — LAYOUT SYSTEM.txt`, `# 12 — RESPONSIVE SPECIFICATIONS.txt` | metadata disponible, page tree, conteneurs, dimensions | OUI |
| 4–6 | `# 04 — COMPONENT LIBRARY.txt`, `# 09 — COMPONENT SPECIFICATIONS.txt`, `# 16 — REACT COMPONENT TREE.txt`, `# 20 — IMPLEMENTATION MATRIX.txt` | inventaire, catégories, propriétés, states, composition | OUI |
| 7–8 | `# 05 — DESIGN TOKENS.txt`, `# 08 — LAYOUT SYSTEM.txt`, `# 14 — CSS REFERENCE.txt`, `# 19 — PIXEL-PERFECT CHECKLIST.txt` | layout équivalent, tokens, dimensions | OUI |
| 9–10 | `# 05 — DESIGN TOKENS.txt`, `# 06 — COLOR SYSTEM.txt`, `# 18 — IMPLEMENTATION GUIDE.txt` | constantes, palette, valeurs dérivées, usages | OUI |
| 11 | `07_TYPOGRAPHY.md.txt`, `# 05 — DESIGN TOKENS.txt`, `# 19 — PIXEL-PERFECT CHECKLIST.txt` | familles, tailles, poids, line-height, letter-spacing | OUI |
| 12 | `# 11 — INTERACTION SPECIFICATIONS.txt`, `# 17 — DEPENDENCY GRAPH.txt` | icônes, tailles, strokes, contextes | OUI |
| 13–15 | `# 05 — DESIGN TOKENS.txt`, `# 08 — LAYOUT SYSTEM.txt`, `# 12 — RESPONSIVE SPECIFICATIONS.txt`, `# 19 — PIXEL-PERFECT CHECKLIST.txt` | spacing, grids, desktop target, absence de breakpoints | OUI |
| 16–17 | Ensemble des SOURCE | constat vérifié d'absence d'inventaire asset/SVG | NON |
| 18 | `# 14 — CSS REFERENCE.txt`, `# 08 — LAYOUT SYSTEM.txt`, `# 09 — COMPONENT SPECIFICATIONS.txt` | styles inline, équivalents CSS, divergences | OUI |
| 19–20 | `# 16 — REACT COMPONENT TREE.txt`, `# 17 — DEPENDENCY GRAPH.txt`, `# 18 — IMPLEMENTATION GUIDE.txt`, `# 20 — IMPLEMENTATION MATRIX.txt` | JSX tree, state, data flow, packages | OUI |
| 21 | `# 02 — USER FLOW.txt`, `# 11 — INTERACTION SPECIFICATIONS.txt`, `# 13 — ACCESSIBILITY.txt`, `# 18 — IMPLEMENTATION GUIDE.txt`, `# 20 — IMPLEMENTATION MATRIX.txt` | transitions, branches, guards, placeholders, accessibilité | OUI |
| 22 | Ensemble des SOURCE | indisponibilités et conflits de valeurs | OUI |

## 1. Liste des sections enrichies

Sections 1 à 22. Le squelette existant a été complété en place. Aucune seconde section homonyme n'a été ajoutée.

## 2. Anciennes déductions remplacées par des données réelles

- inventaire et hiérarchie des composants ;
- composants partagés, privés, inline et composés ;
- propriétés, defaults, optionnels et états internes ;
- variantes visuelles et conditionnelles ;
- palette HEX/RGBA, valeurs dérivées, gradients et usages sémantiques ;
- seuils de couleur confidence ;
- hover, disabled, loading, selected, active, expanded et collapsed ;
- raccourcis, guards, délais, retours et branches alternatives ;
- dimensions, paddings, gaps, radius, borders, shadows, z-index et blur ;
- desktop target, absence de breakpoints et comportement sous 900px ;
- structure React, ownership d'état, data flow et dépendances ;
- placeholders, limites runtime et état d'accessibilité.

## 3. Déductions restant dans le document

Aucune valeur technique n'est présentée comme déduite. Les regroupements de valeurs proviennent de listes explicites dans les SOURCE. Les divergences sont conservées sans arbitrage.

## 4. Informations toujours indisponibles dans les sources

- nom, date et version native du fichier Figma ;
- page, frame, section, node et layer IDs ;
- positions X/Y et layer tree ;
- Auto Layout, constraints, Hug, Fill et wrap Figma par nœud ;
- component properties et variants natifs Figma ;
- variables, collections, modes, aliases et styles Figma ;
- bibliothèques, occurrences et instances Figma ;
- Dev Mode et CSS généré par Figma ;
- image assets, compression et métadonnées ;
- SVG exportés ;
- liens de prototype et transitions Figma ;
- autorité permettant de résoudre les conflits internes SOURCE ;
- backend, API, authentification, permissions et persistance.

## 5. Pourcentage de couverture

| Domaine | Couverture |
|---|---:|
| Architecture d'écrans documentée | 100 % |
| Components React documentés | 100 % |
| Interactions documentées | 100 % |
| Tokens techniques SOURCE | 100 % |
| Colors SOURCE | 100 % |
| Variants/states React documentés | 100 % |
| Dimensions SOURCE | 100 % recensées ; autorité finale non résolue en cas de conflit |
| Responsive documenté | 100 % ; système déclaré non responsive |
| Accessibility documentée | 100 % |
| JSX structure documentée | 100 % |
| CSS équivalent documenté | 100 % |
| Figma page/frame/node IDs | 0 % |
| Auto Layout Figma | 0 % |
| Variables/collections Figma | 0 % |
| Component properties Figma | 0 % |
| Variants Figma natifs | 0 % |
| Layer tree Figma | 0 % |
| Dev Mode Figma | 0 % |
| SVG exports | 0 % |
| Image assets runtime | 0 % |
