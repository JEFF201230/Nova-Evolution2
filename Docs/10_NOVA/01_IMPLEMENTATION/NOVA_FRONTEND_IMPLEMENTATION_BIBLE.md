# NOVA FRONTEND IMPLEMENTATION BIBLE

Mission : `NOVA-NFIB-001`  
Statut : Référence d’implémentation frontend consolidée  
Portée : NOVA frontend V6.1 / décisions UX officielles  

Convention normative :

- `MUST` : exigence d’implémentation obligatoire issue de l’audit UX.
- `CURRENT` : état ou valeur technique réellement documenté dans la référence Figma.
- `CONFLICT` : valeurs officielles divergentes, sans arbitrage dans ce document.
- `UNAVAILABLE` : information absente des deux sources officielles.

# 1 Objet

Ce manuel organise les règles nécessaires à l’implémentation quotidienne du frontend NOVA. Il consolide les deux références officielles sans les remplacer, sans refaire l’audit UX et sans constituer une nouvelle spécification Figma.

Toute règle technique de ce document doit être reliée à une section d’une source officielle. Une donnée non sourcée est interdite.

Source : `NOVA_UX_AUDIT_REPORT.md`, sections 1, 29–30 ; `FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md`, préambule et sections 1, 23.

# 2 Références officielles

| ID | Document | Rôle |
|---|---|---|
| UX | `Docs/10_NOVA/00_UX_AUDIT/NOVA_UX_AUDIT_REPORT.md` | décisions UX, charge cognitive, hiérarchie, accessibilité cible, règles d’implémentation |
| FIGMA | `Docs/24_MODULES/0-UI-DESIGN/SOURCE/FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md` | architecture technique, composants, tokens, dimensions, styles, interactions et limites documentées |

Aucune autre source n’est normative dans le NFIB.

Source : UX sections 1–2 ; FIGMA sections 1 et 23.

# 3 Gouvernance documentaire

- `MUST` : toute modification du frontend vérifie sa conformité aux deux sources et au Conflict Registry.
- `MUST` : une règle UX ne peut être annulée par une valeur visuelle.
- `MUST` : une valeur technique ne peut être inventée lorsque FIGMA la marque indisponible.
- `MUST` : un conflit reste ouvert jusqu’à décision documentaire externe ; le NFIB ne l’arbitre pas.
- `MUST` : toute nouvelle règle ajoute une entrée à la matrice de traçabilité.
- `MUST` : les documents sources restent conservés.

Source : UX sections 1, 29–30 ; FIGMA préambule, sections 22–23.

# 4 Hiérarchie documentaire

```text
NOVA UX AUDIT REPORT
        ↓ fixe l’intention, la hiérarchie et les règles UX
FIGMA IMPLEMENTATION MASTER REFERENCE
        ↓ fournit les données techniques disponibles et leurs conflits
NOVA FRONTEND IMPLEMENTATION BIBLE
        ↓ normalise le travail d’ingénierie sans arbitrer
CODE
```

En cas de divergence UX/technique : la divergence est enregistrée en section 51. En cas d’absence : section 52. Le code ne devient pas une source normative par lui-même.

Source : UX sections 1, 29–30 ; FIGMA préambule et section 22.

# 5 Architecture Frontend

`CURRENT` : application React 18 et TypeScript, shell `App`, navigation interne par état `view`, données de prototype au module scope, styles inline, icônes Lucide React.

```text
App (100vw × 100vh)
├── NavRail
├── main (vue active)
└── SearchOverlay conditionnel
```

Écrans : Home ; Clarify ; Canvas ; Plan ; Confirm ; Work et ses sept onglets ; Global Decisions ; Global Deliverables ; Decision Package ; Decision Pause ; Decision Receipt.

Source : FIGMA sections 1–3, 19–21 ; UX sections 6–7.

# 6 Arborescence React

```text
App
├── NavRail
├── HomeView | ClarifyView | CanvasView | PlanView | ConfirmView
├── WorkView
│   ├── WorkOverviewTab
│   ├── WorkPlanTab
│   ├── WorkActivityTab
│   ├── WorkPeopleTab
│   ├── WorkSourcesTab
│   ├── WorkDecisionsTab
│   └── WorkDeliverablesTab
├── DecisionPackageView | DecisionPauseView | DecisionReceiptView
├── GlobalDecisionsView | GlobalDeliverablesView
└── SearchOverlay
```

Source : FIGMA sections 4, 19–20.

# 7 Arborescence des composants

| Niveau | Composants |
|---|---|
| Racine | App |
| Shells | NavRail, WorkView, SearchOverlay, Drawer |
| Shared | NOVALabel, ConfChip, DeadlineBadge, StatusDot, Btn, Card, WhyInline, DrawerSection, DrawerRow |
| Setup | HomeView, ClarifyView, CanvasView, PlanView, ConfirmView |
| Work | WorkOverviewTab, WorkPlanTab, WorkActivityTab, WorkPeopleTab, WorkSourcesTab, WorkDecisionsTab, WorkDeliverablesTab |
| Decision | DecisionPackageView, DecisionPauseView, DecisionReceiptView |
| Global | GlobalDecisionsView, GlobalDeliverablesView |
| Private/inline | NavItem, WorkBreadcrumb, Composer, pills, PhaseRow, ActivityEvent, PersonCard, SourceCard, DecisionOption |

Source : FIGMA section 4.

# 8 Shared Components

| Composant | Responsabilité | Variants/states | Source |
|---|---|---|---|
| NOVALabel | attribuer un contenu à NOVA | `sm/xs` ou version 11px en conflit | FIGMA 4–6, 22 |
| ConfChip | afficher et expliquer une confiance | open/closed, high/medium/low | FIGMA 4–6, 10 |
| DeadlineBadge | coder une échéance | urgent/warning/normal | FIGMA 4–6, 10 |
| StatusDot | disponibilité | contrat en conflit | FIGMA 4–6, 22 |
| Btn | action générique | primary/secondary/quiet, sizes, disabled/loading | FIGMA 4–6 |
| Card | surface statique ou cliquable | default/hover/accent | FIGMA 4–6 |
| WhyInline | explication progressive | collapsed/expanded | FIGMA 4–6 |
| Drawer | détail contextuel | open/closed | FIGMA 4–7, 21 |
| DrawerSection | section narrative | présentatif | FIGMA 4–5 |
| DrawerRow | paire clé/valeur | color optionnelle | FIGMA 4–5 |
| NavRail | navigation globale | default/hover/active | FIGMA 4–7 |
| SearchOverlay | recherche globale | recent/query/no-results | FIGMA 4–7, 21 |

# 9 Feature Components

| Feature | Composants | Responsabilité technique | Source |
|---|---|---|---|
| Work setup | HomeView, ClarifyView, CanvasView, PlanView, ConfirmView | création et préparation d’un Work | FIGMA 2–6, 19–21 |
| Work | WorkView + sept onglets | shell, contexte et rendu d’un domaine | FIGMA 2–7, 19–20 |
| Decision | Package, Pause, Receipt | comparaison, saisie et reçu prototype | FIGMA 2–6, 19–21 |
| Global | GlobalDecisions, GlobalDeliverables | agrégation transversale | FIGMA 2–6, 19–20 |

# 10 Routing

`CURRENT` : aucune bibliothèque de routing ; navigation via `setView()`.

| Vue | Route documentaire |
|---|---|
| Home | `/home` |
| Clarify / Canvas / Plan / Confirm | `/clarify`, `/canvas`, `/plan`, `/confirm` |
| Work | `/work/:id` |
| Global Decisions / Deliverables | `/decisions`, `/deliverables` |
| Decision Package / Decide / Receipt | `/decisions/:id`, `/decisions/:id/decide`, `/decisions/:id/receipt` |

`CONFLICT` : les routes sont documentaires alors que l’implémentation décrite n’utilise ni router ni URL. Le breadcrumb Work → Home est également signalé par l’audit UX.

Source : FIGMA sections 2, 21–22 ; UX sections 6, 24.

# 11 Layout System

- `CURRENT` : root flex row ; main flex column ; overflow root hidden.
- `CURRENT` : page padding principal `28px 32px` ; vue centrée `48px 24px`.
- `CURRENT` : Overview grid `2fr 1fr`, gap 20px ; une autre source donne `1fr 280px`.
- `CURRENT` : Drawer 460px ; Search 560px ou max 520px selon conflit.
- `MUST` : les détails secondaires restent en drawer/disclosure et ne remontent pas au premier niveau.

Source : FIGMA sections 3, 7–8, 13–15, 18, 22 ; UX sections 5, 9, 19.

# 12 State Management

| State | Owner | Usage |
|---|---|---|
| view, activeWork, activeDecision, searchOpen | App | navigation et sélection globale |
| composerOpen, val, loading, detailOpen | HomeView | composer et drawer |
| step, current | ClarifyView | étape et réponse |
| editing | CanvasView | édition locale |
| exp | PlanView / WorkPlanTab | accordéon |
| aut | ConfirmView | autonomie |
| tab | WorkView | onglet actif |
| filter, comment | Activity / Global Decisions | filtrage et saisie |
| drawer | People/Sources/Deliverables | objet détaillé |
| sel, detailOpen | DecisionPackage | option et package |
| step, choice, rationale, loading | DecisionPause | review/decide |
| open | ConfChip/WhyInline | disclosure |
| q | SearchOverlay | requête |

`CURRENT` : aucun store, context ou persistance documenté. `MUST` : une mutation critique ne peut produire de faux succès.

Source : FIGMA sections 5–6, 19–21 ; UX sections 18, 30.

# 13 Component Contracts

## 13.1 Shared contracts

| Nom | Responsabilité | Parent | Children | Props/entrées | Events/sorties | Dependencies | Source |
|---|---|---|---|---|---|---|---|
| NOVALabel | attribution NOVA | multiples | Sparkles, text | size optionnelle | aucune | N, Lucide | FIGMA 4–6, 10, 12 |
| ConfChip | expliquer confiance | cards/headers | popover | pct, reasons ; afterAction/positive/missing opt. | toggle, close | confColor, ChevronDown, X | FIGMA 4–6, 10, 21 |
| DeadlineBadge | échéance | cards | Clock, text | date ou days — conflit | aucune | N, Clock | FIGMA 5–6, 22 |
| StatusDot | disponibilité | PersonCard | aucun | status ou ok — conflit | aucune | N | FIGMA 5–6, 22 |
| Btn | déclencher action | multiples | icon, children | variant/v, size, loading, disabled, full, onClick | onClick | N, SH, T | FIGMA 4–6, 18 |
| Card | surface | multiples | children | onClick, style, accent opt. | onClick/hover | N, SH, T | FIGMA 4–6, 18 |
| WhyInline | détail inline | cards | children | children | toggle | N, ChevronDown | FIGMA 4–6, 21 |
| Drawer | détail overlay | pages | sections | open, onClose, title, children | backdrop/X close | N, SH, X | FIGMA 4–7, 18, 21 |
| DrawerSection | grouper détail | Drawer | children | label, children | aucune | typography | FIGMA 4–5 |
| DrawerRow | paire data | Section | label/value | label, value, color opt. | aucune | typography | FIGMA 4–5 |
| NavRail | navigation | App | NavItems/profile | view, setView, onSearch | setView/onSearch | Lucide, N, T | FIGMA 4–7, 21 |
| SearchOverlay | recherche | App | input/results | onClose, setView, setters actifs | input/result/Escape/backdrop | WORK_ITEMS, DECISIONS | FIGMA 4–7, 20–21 |

## 13.2 Feature contracts

| Nom | Responsabilité | Parent | Children | Props | Events | Dependencies | Source |
|---|---|---|---|---|---|---|---|
| HomeView | accueil/composer | App | shared + inline | setView, active setters | composer, open Work/Decision/drawer | WORK_ITEMS, DECISIONS | FIGMA 4–6, 19–21 |
| ClarifyView | qualification | App | Btn/inline | setView | next/back/skip/input | CLARIFY_QS | FIGMA 4–6, 20–21 |
| CanvasView | revue inline | App | Btn/cards | setView | edit/save/next | CANVAS_ITEMS | FIGMA 4–6, 20–21 |
| PlanView | phases setup | App | Btn/PhaseRows | setView | expand/back/next | PLAN_PHASES | FIGMA 4–6, 20–21 |
| ConfirmView | autonomie | App | ConfChip/Btn | setView, setActiveWork | select/start | AUTONOMY_LEVELS | FIGMA 4–6, 20–21 |
| WorkView | shell Work | App | tabs | signature en conflit | setTab/onDecision/onBack | WorkItem | FIGMA 5, 19–22 |
| WorkOverviewTab | synthèse/action | WorkView | cards/drawer | item, onDecision | Why, drawer, decision | WorkItem | FIGMA 4, 19–21 |
| WorkPlanTab | plan read-only | WorkView | phases | phases | expand selon sources | PLAN_PHASES | FIGMA 4, 19–21 |
| WorkActivityTab | activité | WorkView | filters/events/form | events | filter/input/Post placeholder | ActivityEvent | FIGMA 4, 19–21 |
| WorkPeopleTab | contributeurs | WorkView | cards/drawer | people | open/close drawer | PersonData | FIGMA 4, 19–21 |
| WorkSourcesTab | sources | WorkView | cards/drawer | sources | Add/Refresh placeholder, drawer | SourceData | FIGMA 4, 19–21 |
| WorkDecisionsTab | décisions Work | WorkView | cards/CTA | decisions,onDecision | Review & decide | DecisionData | FIGMA 4, 19–21 |
| WorkDeliverablesTab | livrables | WorkView | cards/drawer | deliverables | preview placeholder, drawer | DeliverableData | FIGMA 4, 19–21 |
| DecisionPackageView | package | App | shared/options/drawer | decision,setView | select/toggle/full/review | DecisionData | FIGMA 4–6, 19–21 |
| DecisionPauseView | review/decide | App | Btn/form | decision,setView | choice/rationale/record/back | DecisionData | FIGMA 4–6, 19–21 |
| DecisionReceiptView | reçu | App | Btn | decision,setView | return ; share/export placeholders | DecisionData | FIGMA 4, 19–21 |
| GlobalDecisionsView | liste transverse | App | cards/filters | setters | filter/open | DECISIONS | FIGMA 4, 19–21 |
| GlobalDeliverablesView | liste transverse | App | deliverables | aucune documentée | placeholder partiel | WORK_ITEMS | FIGMA 4, 19–21 |

## 13.3 Conditions communes des contrats

- Responsive : desktop fixe ; aucun breakpoint.
- Accessibilité courante : partielle ; exigences cibles en sections 24–28.
- Acceptance : props conformes, event réel ou explicitement placeholder, état conditionnel conforme, valeur visuelle issue des tokens, aucune valeur inventée.

Source : FIGMA sections 12, 15, 21–22 ; UX sections 20, 23, 30–32.

# 14 Design Tokens

`CURRENT` : spacing, radius, shadows, borders, opacity, z-index, blur, motion, typography et dimensions listés dans FIGMA section 8.

`MUST` : aucune création de token hors décision documentaire. Les variantes en conflit restent dans section 51.

Source : FIGMA section 8 ; UX sections 29–30, 32.

# 15 Variables

`CURRENT` : constantes TypeScript `N`, `SH`, `FONT`, `MONO`, `T.fast`, `T.std`. Aucune variable Figma, collection, mode ou alias Figma.

Source : FIGMA section 9.

# 16 Typography

`CURRENT` : Inter avec fallbacks pour UI ; Roboto Mono avec fallbacks pour pourcentages, codes et deltas. Tailles 9–27px ; poids 400/500/600/650/700 ; import disponible uniquement pour 400/500/600/700. Line-height 1–1.65 et letter-spacing -0.035em à 0.07em.

`MUST` : le microtexte ne porte pas seul une information critique ; contraste informatif AA.

Source : FIGMA section 11 ; UX sections 21, 23, 32.

# 17 Color System

| Rôle | Token/valeur |
|---|---|
| Canvas/surface | `#F8FAFC` / `#FFFFFF` |
| Textes | `#0F172A`, `#475569`, `#94A3B8` |
| Borders | `#E2E8F0`, `#CBD5E1`, `#94A3B8` |
| Action | `#1D4ED8`, hover `#1E40AF`, bg `#EFF6FF` |
| Success | `#166534`, bg `#F0FDF4` |
| Warning | `#92400E`, bg `#FFFBEB` |
| Critical | `#991B1B`, bg `#FEF2F2` |
| NOVA | `#6D28D9`, bg `#F5F3FF`, border `#DDD6FE` |

`MUST` : rouge risque/erreur/blocage ; orange attention/incertitude ; vert validé/favorable ; bleu action/navigation ; violet NOVA ; jamais couleur seule. Aucun dark mode.

Source : FIGMA section 10 ; UX sections 21, 29.

# 18 Icons

`CURRENT` : 29 imports Lucide React ; tailles 7–20px ; strokes 2/2.5/3 ; couleur héritée ou token contextuel. Inventaire exhaustif dans FIGMA section 12.

`MUST` : boutons icône nommés et icônes décoratives masquées aux technologies d’assistance.

Source : FIGMA section 12 ; UX section 23.

# 19 Assets

`UNAVAILABLE` : aucun asset image runtime, compression, layer image ou SVG exporté n’est inventorié. Les icônes proviennent de Lucide React.

Source : FIGMA sections 16–17, 22.

# 20 CSS Rules

- `CURRENT` : styles de composants inline React exclusivement.
- `CURRENT` : scrollbar 4px ; thumb `#CBD5E1`, hover `#94A3B8`.
- `CURRENT` : shadows exactes `SH.card`, `SH.cardHv`, `SH.overlay`, `SH.hero` dans FIGMA section 18.
- `CURRENT` : transitions 120/200/280ms ; keyframes spin/pulse.
- `MUST` : aucune valeur visuelle non issue des règles techniques officielles.

Source : FIGMA sections 8, 18, 21 ; UX sections 30, 32.

# 21 Tailwind Mapping

`CURRENT` : Tailwind existe dans l’infrastructure, mais aucune utility Tailwind n’est utilisée dans le JSX NOVA. Aucun mapping Tailwind normatif disponible.

Source : FIGMA sections 1, 18, 20–21.

# 22 JSX Structure

La structure consolidée est celle de la section 6 et des contrats section 13. `15_JSX_REFERENCE.md` ne contient aucun JSX NOVA. L’application documentée est regroupée dans `App.tsx`.

Source : FIGMA sections 19–21.

# 23 Responsive

`CURRENT` : desktop-first fixe, sans media query. Minimum annoncé ~960×640 ; optimal 1280–1440×800–900 ; sous ~900px aucune recomposition, grids compressées et drawer superposé.

`CONFLICT` : UX demande un fallback responsive et propose un drawer plein écran sous breakpoint ; FIGMA déclare mobile non supporté et aucun breakpoint. Aucun arbitrage.

Source : FIGMA sections 14–15, 22 ; UX sections 19, 23, 28, 32.

# 24 Accessibility

`CURRENT` : prototype déclaré non conforme WCAG 2.1 AA. Échecs documentés : `N.textDis` ~3.1:1 sur blanc et ~2.5:1 sur subtle ; ARIA, focus trap, annonces dynamiques et skip link incomplets.

`MUST` : contraste informatif AA, clavier complet, focus visible, labels, statuts non dépendants de la couleur, ordre logique, titres, erreurs localisées, saisie conservée.

Source : FIGMA section 21 et référence intégrée d’accessibilité ; UX section 23.

# 25 Keyboard Navigation

| Interaction | Règle |
|---|---|
| Global search | Cmd/Ctrl+K ouvre ; Escape ferme |
| Composer | Cmd+Enter documenté ; garde `trim` |
| Buttons/textarea/details | comportement natif documenté |
| Tabs | `MUST` tablist/tab/aria-selected et navigation clavier |
| Drawers/popovers | `MUST` Escape ; absent dans CURRENT |

Source : FIGMA sections 6, 21 ; UX section 23.

# 26 Focus Management

`CURRENT` : autofocus Search ; textarea Composer focus après 50ms ; pas de focus trap Drawer/Search.

`MUST` : focus visible, trap dans Drawer/Search, focus initial pertinent, restauration au déclencheur, annonces dynamiques.

Source : FIGMA section 21 ; UX sections 19, 23.

# 27 Drawers

- `CURRENT` : panel droit 460px, overlay sombre, body scrollable, sections narratives.
- `CURRENT` : fermeture X/backdrop ; pas d’animation, Escape ou focus trap.
- `MUST` : un seul drawer, aucun nesting, détail contextuel uniquement, sections vides omises.
- `MUST` : ordre Summary → Why → Blocking → Evidence → History → Technical.
- `MUST` : People, Source, Deliverable et Decision Package partagent le shell.
- `CONFLICT` : paddings et comportement mobile en section 51.

Source : FIGMA sections 3–8, 18, 21–22 ; UX sections 19, 29, 32.

# 28 Dialogs

SearchOverlay est le seul overlay assimilable à un dialog dans la référence technique. Drawer est traité séparément.

`MUST` : `role=dialog`, nom accessible, `aria-modal`, focus trap, Escape et retour focus pour Search et Drawer. Aucun autre modal n’est documenté.

Source : FIGMA sections 4–7, 21 ; UX sections 23, 30.

# 29 Cards

`CURRENT` : surface blanche, border, radius et shadow tokenisés ; hover uniquement si cliquable ; accent optionnel. Hero et focal ont leurs styles dédiés.

`MUST` : une carte représente un objet, un état et une action ; pas de cartes décoratives ou imbriquées ; maximum deux badges selon la référence technique.

Source : FIGMA sections 4–6, 8, 18, 21 ; UX sections 20, 29.

# 30 Lists

Listes documentées : Active Work, Activity events, People, Sources, Decisions, Deliverables, Search results, Drawer rows. `MUST` : listes compactes pour surveillance ; rôle list/listitem lorsque des divs sont utilisés ; filtres seulement pour densité réelle.

Source : FIGMA sections 2–4, 19, 21 ; UX sections 5, 20, 23.

# 31 Tables

`UNAVAILABLE` : aucun composant Table frontend n’est documenté dans les deux sources officielles.

Source : FIGMA sections 4, 19, 22 ; UX sections 7, 20.

# 32 Forms

Formulaires documentés : Composer, Clarify textarea, Canvas inline edit, Activity comment, Decision rationale.

`MUST` : label explicite, validation locale, erreur liée au champ, conservation de saisie après erreur récupérable, action claire. `CURRENT` : Canvas Save abandonne la valeur ; Activity Post est placeholder ; Decision rationale garde choice+rationale uniquement en state local.

Source : FIGMA sections 6, 18, 21 ; UX sections 18, 20, 23, 30.

# 33 Filters

`CURRENT` : Activity `all/human/ai/critical/sources`; Global Decisions `all/pending/waiting/decided`; états selected/unselected.

`MUST` : état sélectionné annoncé (`aria-pressed` ou sémantique tab appropriée), filtre uniquement si la liste le justifie.

Source : FIGMA sections 6, 10, 21 ; UX sections 5, 20, 23.

# 34 Search

`CURRENT` : Cmd/Ctrl+K, navigation rail, autofocus, recent si requête <2, filtrage à partir de 2, no-results, résultat ouvre Work/Decision, fermeture Escape/backdrop/résultat.

`CONFLICT` : panel 560/r16/top120/blur2 contre max520/r13/pad72/blur3.

Source : FIGMA sections 4–7, 18, 21–22 ; UX section 23.

# 35 Notifications

`CURRENT` : item Bell présent dans NavRail sans handler. `UNAVAILABLE` : modèle de notification, contenu, état, badge, permission et comportement.

Source : FIGMA sections 12, 21 ; UX section 24.

# 36 Loading States

`CURRENT` : Composer 500ms et Decision record 700ms simulés ; RefreshCw spinner 1s linear ; boutons disabled pendant loading.

`MUST` : tout async possède idle/loading/success/error, protège le double submit et n’affiche le succès qu’après confirmation réelle.

Source : FIGMA sections 6, 8, 21 ; UX sections 9, 18, 30.

# 37 Empty States

`CURRENT` : Search no-results documenté. Les états vides de pages ne sont pas maquettés techniquement.

`MUST` : états vides par page définis dans la hiérarchie UX ; aucun nouvel écran requis.

Source : FIGMA sections 6, 21–22 ; UX section 9, 23, 30–31.

# 38 Error States

`CURRENT` : fallbacks Work/Decision vers premier élément ; conditions d’absence masquent certains blocs. Aucun système d’erreur réseau/runtime documenté.

`MUST` : erreur compréhensible, actionnable, localisée ; données conservées ; aucun faux succès.

Source : FIGMA sections 6, 21–22 ; UX sections 9, 18, 23, 30.

# 39 Skeletons

`MUST` : skeletons à dimensions stables pour les pages critiques. `UNAVAILABLE` : géométrie exacte et composants Skeleton non fournis.

Source : UX sections 9, 30, 32 ; FIGMA sections 4, 22.

# 40 Animations

`CURRENT` : fast 120ms, std 200ms, composer 280ms ; spinner 1s ; pulse ; phase content instant ; drawer instant. Aucun motion library utilisé.

Source : FIGMA sections 8, 18, 20–21.

# 41 Performance

`CURRENT` : React state local, listes statiques et absence de charts. `UNAVAILABLE` : budgets de bundle, rendu, réseau, mémoire, Core Web Vitals, virtualisation ou stratégie de cache.

Source : FIGMA sections 20–22.

# 42 Lazy Loading

`UNAVAILABLE` : aucun lazy loading, code splitting ou chargement différé d’asset n’est documenté.

Source : FIGMA sections 19–22.

# 43 Component Dependency Graph

```text
Tokens N/SH/T + confColor + Lucide
  → Shared components
  → Feature views/tabs
  → App

Drawer → DrawerSection → DrawerRow
WorkView → 7 Work tabs
DecisionPackage → shared + Drawer
DecisionPause/Receipt → Btn
```

Source : FIGMA sections 19–20.

# 44 Screen Dependency Graph

```text
App state
├── Setup screens depend on CLARIFY_QS/CANVAS_ITEMS/PLAN_PHASES/AUTONOMY_LEVELS
├── Home/Work/Search/Global Deliverables depend on WORK_ITEMS
└── Home/Package/Pause/Receipt/Global Decisions/Search depend on DECISIONS
```

Source : FIGMA sections 19–20.

# 45 State Transition Rules

| Domaine | Transition technique consolidée | Source |
|---|---|---|
| Setup | home → clarify → canvas → plan → confirm → work | FIGMA 2, 21 |
| Work tabs | tab state, overview par défaut | FIGMA 5–6, 19–21 |
| Drawer | null/false → objet/true → close | FIGMA 5–6, 21 |
| Decision | package → review → decide → receipt → work | FIGMA 2, 6, 21 |
| Search | closed → open → query/result → closed | FIGMA 6, 21 |
| ConfChip/Why | closed ↔ open | FIGMA 5–6, 21 |

`MUST` : décision réelle persistée avant receipt ; le prototype ne le fait pas.

Source : UX section 18, 30 ; FIGMA section 21.

# 46 Interaction Rules

- `MUST` : un CTA primaire dominant par écran.
- `MUST` : CTA visible uniquement avec comportement réel ou disabled expliqué.
- `CURRENT` : 14 actions placeholder recensées en FIGMA section 21.
- `MUST` : recommandation NOVA liée à des preuves ; choix humain explicite.
- `MUST` : détails secondaires via drawer/disclosure.
- `CURRENT` : hover/selected/active/loading décrits en FIGMA sections 6 et 10.

Source : UX sections 4–5, 18, 20, 29–30 ; FIGMA sections 6, 10, 21.

# 47 Pixel Perfect Rules

| Zone | Règle vérifiable | Source |
|---|---|---|
| Canvas | #F8FAFC ; surfaces #FFF | FIGMA 10, 18 |
| Action/NOVA | #1D4ED8 / #6D28D9 | FIGMA 10 |
| Card | r12, SH.card ; hover SH.cardHv | FIGMA 8, 18 |
| Hero | gradient action→NOVA, r16, SH.hero | FIGMA 10, 18 |
| Focal | border 2px action, ring 4px | FIGMA 8, 18 |
| Work | breadcrumb 42px ; tabs bottom 2px | FIGMA 3, 18 |
| Drawer | 460px, overlay .20 blur2 | FIGMA 3, 18 |
| Progress | heights 3/4/6 selon usage/source | FIGMA 8, 18 |
| Typography | tokens section 16 | FIGMA 11 |
| Spacing | tokens section 14 et conflits section 51 | FIGMA 8, 13, 22 |

`MUST` : les conflits ne sont pas résolus par le développeur.

# 48 Acceptance Criteria

- Toutes les pages de section 5 sont atteignables selon le modèle documenté.
- Tous les composants de sections 8–9 respectent leur contrat.
- Chaque action non placeholder déclenche l’événement documenté.
- Aucun placeholder n’est présenté comme fonctionnel en production.
- Tokens et couleurs correspondent aux valeurs officielles non conflictuelles.
- Drawers, Search, tabs, forms et décision respectent les règles d’accessibilité cible.
- États loading/empty/error/blocked/done sont couverts selon UX.
- Tous les conflits rencontrés renvoient à section 51.
- Aucune information technique absente n’est inventée.

Source : UX sections 29–32 ; FIGMA sections 21–23.

# 49 Definition of Done

- Code conforme aux contrats de section 13.
- Aucune action critique sans confirmation/persistance vérifiée.
- Aucun CTA no-op non explicitement désactivé.
- Vérifications clavier, focus, contraste et états non nominaux effectuées.
- Comparaison pixel-perfect effectuée sur les règles non conflictuelles.
- Conflict Registry consulté et conflits ouverts non arbitrés localement.
- Matrice de traçabilité mise à jour pour toute règle ajoutée.

Source : UX sections 18, 23, 30–32 ; FIGMA sections 21–23.

# 50 QA Checklist

- [ ] 17 surfaces/écrans de la matrice technique vérifiés.
- [ ] Sept onglets Work présents dans l’ordre officiel.
- [ ] Home, Work, Decisions, Deliverables accessibles.
- [ ] Tous les shared/feature components couverts.
- [ ] Cmd/Ctrl+K, Escape Search, filters, disclosures et tabs vérifiés.
- [ ] Drawers People, Source, Deliverable, Overview/Home et Package vérifiés.
- [ ] Choice + rationale + loading Decision vérifiés.
- [ ] Placeholders absents de la production ou clairement désactivés.
- [ ] Focus, clavier, ARIA, contraste et couleur non exclusive vérifiés.
- [ ] Loading, empty, error, blocked, done vérifiés.
- [ ] Dimensions et tokens non conflictuels comparés.
- [ ] Aucun conflit arbitré sans décision externe.
- [ ] `git diff --check` et contrôles automatiques applicables réussis.

Source : UX sections 23, 31–32 ; FIGMA sections 21–23.

# 51 Conflict Registry

| ID | Source A | Source B | Description | Traitement NFIB |
|---|---|---|---|---|
| C-01 | FIGMA §3/7/15/18 : NavRail 56px compact | FIGMA §3/5/11/22 : NavRail 220px large | largeur et structure | Aucun arbitrage |
| C-02 | FIGMA §3/22 : Clarify 640px | FIGMA §3/22 : 600px | max-width | Aucun arbitrage |
| C-03 | FIGMA §3/22 : Confirm 560px | FIGMA §3/22 : 580px | max-width | Aucun arbitrage |
| C-04 | FIGMA §3/22 : Decision Package 800px | FIGMA §3/22 : 780px | max-width | Aucun arbitrage |
| C-05 | FIGMA §22 : Search 560/r16/top120/blur2 | FIGMA §22 : max520/r13/pad72/blur3 | géométrie overlay | Aucun arbitrage |
| C-06 | FIGMA §22 : Drawer header 18×20/body20 | FIGMA §22 : header20×24/body24 | padding | Aucun arbitrage |
| C-07 | FIGMA §22 : ConfChip pill 260/top-8 | FIGMA §22 : transparent min240-max300/below | structure/position | Aucun arbitrage |
| C-08 | FIGMA §22 : Btn r8 sm/md padding | FIGMA §22 : r9 fixed sm/md/lg | dimensions/variants | Aucun arbitrage |
| C-09 | FIGMA §22 : NOVALabel 9/10 sm/xs | FIGMA §22 : 11 unique | typographie/variant | Aucun arbitrage |
| C-10 | FIGMA §22 : StatusDot 3 statuts | FIGMA §22 : boolean | contrat | Aucun arbitrage |
| C-11 | FIGMA §22 : Clarify 3 questions | FIGMA §22 : static data note 4 | cardinalité | Aucun arbitrage |
| C-12 | FIGMA §22 : Search results max320 | FIGMA §22 : max360 | hauteur | Aucun arbitrage |
| C-13 | FIGMA §3/22 : Overview 2fr 1fr | FIGMA §3 : 1fr 280px | colonnes | Aucun arbitrage |
| C-14 | UX §19/28/32 : drawer mobile plein écran à tester/fallback responsive | FIGMA §15 : aucun breakpoint, mobile non supporté | responsive cible vs état technique | Aucun arbitrage |
| C-15 | UX §18/30 : décision persistée avant reçu | FIGMA §21 : délai simulé, décision non stockée | cible critique vs prototype | Aucun arbitrage ; CURRENT non conforme à MUST |
| C-16 | UX §23 : Escape/focus trap/ARIA requis | FIGMA §21 : absents | cible accessibilité vs prototype | Aucun arbitrage ; CURRENT non conforme à MUST |

# 52 Missing Technical Information

- fichier, URL, version et date Figma natifs ;
- page/frame/node/layer IDs et positions ;
- layer tree ;
- Auto Layout, constraints, Hug/Fill et wrap Figma par nœud ;
- component properties et variants Figma natifs ;
- variables, collections, modes, aliases, styles et libraries Figma ;
- Dev Mode et CSS Figma généré ;
- image assets runtime, compression et SVG exports ;
- autorité documentaire permettant de résoudre les conflits de section 51 ;
- router final et stratégie URL ;
- backend, API, auth, permissions et contrats de persistance ;
- modèle réel de notifications ;
- géométrie exacte des skeletons ;
- budgets de performance et stratégie lazy loading ;
- tests automatisés, framework de test et navigateurs supportés ;
- stratégie responsive finale ;
- comportement réel des 14 placeholders.

Source : FIGMA sections 16–17, 21–23 ; UX sections 23–25, 30–31.

# 53 Traceability Matrix

## 53.1 Matrice des règles

| Domaine NFIB | Source | Section | Origine |
|---|---|---|---|
| Gouvernance/hiérarchie | UX | 1, 29–30 | décisions et règles figées |
| Architecture/pages | UX | 6–7 | architecture validée |
| Architecture React | FIGMA | 2–5, 19–20 | structure technique |
| Routing | FIGMA + UX | FIGMA 2,21–22 ; UX 6,24 | état technique + incohérence |
| Layout | FIGMA + UX | FIGMA 3,7–8,18,22 ; UX 5,19 | valeurs + charge cognitive |
| State | FIGMA + UX | FIGMA 5–6,19–21 ; UX 18,30 | state prototype + contraintes critiques |
| Contracts | FIGMA | 4–6,19–21 | props/events/dependencies |
| Tokens/variables | FIGMA | 8–9 | valeurs techniques |
| Typography/colors/icons | FIGMA + UX | FIGMA 10–12 ; UX 21,23 | valeurs + sémantique/accessibilité |
| Assets | FIGMA | 16–17,22 | absence vérifiée |
| CSS/Tailwind/JSX | FIGMA | 18–21 | état d’implémentation |
| Responsive | FIGMA + UX | FIGMA 14–15,22 ; UX 19,28,32 | conflit cible/état |
| Accessibility/focus/keyboard | FIGMA + UX | FIGMA 21 ; UX 19,23 | lacunes + exigences |
| Drawers/dialogs | FIGMA + UX | FIGMA 3–7,18,21–22 ; UX 19,29,32 | shell + gouvernance |
| Cards/lists/forms/filters/search | FIGMA + UX | FIGMA 4–7,18–21 ; UX 5,20,23 | comportements + règles |
| États | FIGMA + UX | FIGMA 6,21–22 ; UX 9,18,23,30 | CURRENT + MUST |
| Motion | FIGMA | 8,18,21 | timings/keyframes |
| Performance/lazy | FIGMA | 20–22 | limites |
| Graphes | FIGMA | 19–20 | dépendances/state/data |
| Interactions | FIGMA + UX | FIGMA 6,10,21 ; UX 4–5,18,20,29–30 | états + gouvernance |
| Pixel perfect/QA | FIGMA + UX | FIGMA 8,10–11,18,22 ; UX 31–32 | valeurs + validation |
| Conflicts/missing | FIGMA + UX | FIGMA 22–23 ; UX 23–25 | divergences et absences |

## Verdict final

| Indicateur | Valeur |
|---|---|
| Couverture documentaire | 100 % des 53 sections demandées |
| Couverture implémentation | Partielle : architecture et règles documentées ; backend, persistance et placeholders manquants |
| Couverture composants | 100 % des composants référencés par FIGMA |
| Couverture interactions | 100 % des interactions documentées ; 14 placeholders restent non implémentés |
| Couverture accessibilité | Règles cibles couvertes ; implémentation CURRENT déclarée non WCAG 2.1 AA |
| Couverture pixel-perfect | Valeurs recensées ; conflits dimensionnels ouverts |
| Conflits restants | 16 entrées, sans arbitrage |
| Informations techniques manquantes | 16 catégories listées en section 52 |
| Niveau de confiance global | MOYEN — élevé sur les règles sourcées non conflictuelles, non déterminable sur les conflits et informations absentes |
