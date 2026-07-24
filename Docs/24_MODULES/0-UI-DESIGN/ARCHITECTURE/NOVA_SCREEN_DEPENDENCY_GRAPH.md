# NOVA — Screen Dependency Graph

**Autorité de navigation :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](./NOVA_USER_NAVIGATION_ARCHITECTURE.md)

Ce graphe décrit les dépendances fonctionnelles démontrées. Les noms de composants proviennent de `D04`, `D09` et `D16`; ils ne prescrivent pas une future structure de fichiers.

## 1. Graphe racine

```text
App
├── état global : view, activeWork, activeDecision, searchOpen
├── NavRail
│   └── appelle Home, Work, GlobalDecisions, GlobalDeliverables, SearchOverlay
├── HomeView
│   └── appelle Clarify, Work, DecisionPackage, Home Drawer
├── Work Setup
│   └── Clarify → Canvas → Plan → Confirm → Work
├── WorkView
│   ├── dépend de activeWork / WorkItem
│   ├── appelle 7 Work tabs
│   ├── appelle DecisionPackage
│   └── héberge 4 familles de drawers
├── GlobalDecisionsView
│   └── appelle DecisionPackage
├── GlobalDeliverablesView
├── DecisionPackageView
│   └── appelle DecisionPause et Full Package Drawer
├── DecisionPauseView
│   └── appelle DecisionReceipt
├── DecisionReceiptView
│   └── appelle Work
└── SearchOverlay
    └── appelle Work ou DecisionPackage
```

## 2. Dépendances transverses

```text
activeWork ─────→ WorkView ─────→ Work tabs / Work drawers
activeDecision ─→ DecisionPackage ─→ DecisionPause ─→ DecisionReceipt
view ───────────→ écran principal
searchOpen ─────→ SearchOverlay

WORK_ITEMS ─────→ Home, Work, GlobalDeliverables, Search
DECISIONS ──────→ Home, Work Overview, Work Decisions,
                  GlobalDecisions, DecisionPackage, Pause, Receipt, Search
CLARIFY_QS ─────→ Clarify
CANVAS_ITEMS ───→ Canvas
PLAN_PHASES ────→ Plan Setup + Work Plan
AUTONOMY_LEVELS → Confirm
```

## 3. Matrice exhaustive par écran

| Écran | Dépendances données/état | Composants majeurs | Drawers | Overlays/popovers | CTA | Pages appelées | Pages appelantes |
|---|---|---|---|---|---|---|---|
| App/Shell | `view`, `activeWork`, `activeDecision`, `searchOpen` | NavRail, NavItem, SearchOverlay | Héberge les drawers des vues | SearchOverlay | Nav primaire, Search | Toutes vues principales | Point racine |
| Home H01 | WORK_ITEMS, DECISIONS, objectif, composerOpen | HomeView, Card, Btn, NOVALabel, DeadlineBadge, ConfChip, WhyInline | Home Situation | ConfChip, WhyInline, Search global | Composer, Open presentation, Details | Clarify, Work, DecisionPackage | App, Nav Home, retours Clarify |
| Clarify S01 | CLARIFY_QS, step, current, réponses | ClarifyView, Btn, suggestions, textarea, progress | Aucun | Why local, Search global selon shell | Back, Continue, Skip | Home, Canvas | Home, Canvas Back |
| Canvas S02 | CANVAS_ITEMS, editing | CanvasView, Card, textarea, Btn | Aucun | Search global selon shell | Back, Edit, Save, Prepare a plan | Clarify, Plan Setup | Clarify, Plan Back |
| Plan Setup S03 | PLAN_PHASES, exp | PlanView, phase rows, Btn, NOVALabel | Aucun | Search global selon shell | Back, phase toggle, Review and start | Canvas, Confirm | Canvas, Confirm Back |
| Confirm S04 | AUTONOMY_LEVELS, aut, activeWork | ConfirmView, ConfChip, Btn, autonomy buttons | Aucun | ConfChip, Search global selon shell | Back, A0–A3, Start work | Plan Setup, Work | Plan Setup |
| Work Shell W01 | activeWork, WorkItem, tab | WorkView, WorkBreadcrumb, ConfChip, Btn, tab buttons | Selon onglet | ConfChip, Search global | Breadcrumb, Pause, More, 7 onglets | Home, 7 tabs | Home, Confirm, Search, Nav Work, Receipt |
| Work Overview W01.1 | WorkItem situation, actions, decisions, health | Card, WhyInline, DeadlineBadge, ConfChip, Drawer | Full Analysis | WhyInline, ConfChip, Search | Open, Why, Later, décision, Full analysis | DecisionPackage | Work tab selector |
| Work Plan W01.2 | PLAN_PHASES / phases du Work, exp éventuel | WorkPlanTab, phase rows | Aucun | Search global | Phase interaction en conflit | Aucun | Work tab selector |
| Work Activity W01.3 | events, filter, comment | WorkActivityTab, filter pills, event list, textarea, Btn | Aucun | Search global | 5 filtres, Post | Aucun | Work tab selector |
| Work People W01.4 | people, drawer sélectionné | WorkPeopleTab, PersonCard, NOVALabel, StatusDot, DrawerSection, DrawerRow | Person Detail | Search global | Invite, Details | Aucun changement de page | Work tab selector |
| Work Sources W01.5 | sources, drawer sélectionné | WorkSourcesTab, SourceCard, status badges, DrawerSection, DrawerRow | Source Detail | Search global | Add, Refresh, Details | Aucun changement de page | Work tab selector |
| Work Decisions W01.6 | decisions, activeDecision | WorkDecisionsTab, Card, DeadlineBadge, ConfChip, WhyInline, Btn | Aucun direct | ConfChip, WhyInline, Search | Why, Review & decide | DecisionPackage | Work tab selector |
| Work Deliverables W01.7 | deliverables, drawer sélectionné | WorkDeliverablesTab, DeliverableCard, ConfChip, progress bar, DrawerSection, DrawerRow | Deliverable Detail | ConfChip, Search global | Create, Eye, Details | Aucun changement de page démontré | Work tab selector |
| Global Decisions G01 | DECISIONS, filter, activeDecision | GlobalDecisionsView, Card, DeadlineBadge, ConfChip | Aucun démontré | ConfChip, Search global | Filtres, carte décision | DecisionPackage | Nav Decisions |
| Global Deliverables G02 | WORK_ITEMS deliverables, filter selon inventaire | GlobalDeliverablesView, DeliverableCard, ConfChip | Aucun démontré | ConfChip, Search global | Filtres, Create/actions ND | Aucun démontré | Nav Deliverables |
| Decision Package D01 | activeDecision, DecisionData, sel, detailOpen | DecisionPackageView, NOVALabel, DeadlineBadge, ConfChip, WhyInline, Card, Btn | Full Package | ConfChip, WhyInline, Search global | Back, option, Why, Full package, Review and decide | Work, DecisionPause | Home, Work Overview, Work Decisions, Global Decisions, Search |
| Decision Pause Review D02.1 | activeDecision, step=review | DecisionPauseView, review cards, Btn | Aucun | Aucun démontré | Back/Cancel, Continue | DecisionPackage, Decide | DecisionPackage |
| Decision Pause Decide D02.2 | activeDecision, choice, rationale, loading | DecisionPauseView, choice buttons, textarea, Btn | Aucun | Aucun démontré | Back, choix, rationale, Record | Review, Receipt | Review |
| Decision Receipt D03 | activeDecision enrichie | DecisionReceiptView, receipt card, action list, Btn | Aucun | Aucun démontré | Return to work, Share, Export | Work | DecisionPause Decide |
| Search Overlay O01 | q, WORK_ITEMS, DECISIONS, activeWork, activeDecision | SearchOverlay, input, result buttons | Aucun | Est lui-même l'overlay | Query, résultat, Escape, backdrop | Work, DecisionPackage | Nav Search, raccourci global |

## 4. Dépendances par drawer

```text
HomeView.detailOpen ───────────────→ Home Situation Drawer
WorkOverviewTab.detailOpen ────────→ Work Full Analysis Drawer
WorkPeopleTab.drawer: PersonData ──→ Person Detail Drawer
WorkSourcesTab.drawer: SourceData ─→ Source Detail Drawer
WorkDeliverablesTab.drawer: data ──→ Deliverable Detail Drawer
DecisionPackage.detailOpen ────────→ Full Package Drawer
```

Chaque drawer dépend de `Drawer`, `DrawerSection` et, selon son contenu, `DrawerRow`. Un seul drawer est démontré simultanément. Aucun lien depuis un drawer vers un second drawer n'est établi.

## 5. Dépendances d'appel détaillées

### Home

```text
App → Home
Nav Home → Home
Clarify Back(step 1) → Home
Work breadcrumb « Work » → Home

Home → Clarify
Home → Work
Home → DecisionPackage
Home → Home Situation Drawer
```

### Work

```text
Home → Work
Confirm → Work
Nav Work → Work
Search result Work → Work
Decision Receipt → Work
DecisionPackage Back → Work

Work → 7 onglets
Work Overview → DecisionPackage / Full Analysis Drawer
Work People → Person Drawer
Work Sources → Source Drawer
Work Decisions → DecisionPackage
Work Deliverables → Deliverable Drawer
```

### Decision

```text
Home ───────────┐
Work Overview ──┤
Work Decisions ─┤→ DecisionPackage → DecisionPause Review
Global Decisions┤                       ↓
Search ─────────┘                  DecisionPause Decide
                                           ↓
                                     DecisionReceipt → Work
```

## 6. Dépendances non déterminées

- Notifications, Help, Preferences, profil : aucune page cible.
- Pause, More, Open Next Action, Post, Invite, Add, Refresh, Create, Eye, Share, Export : aucun effet final démontré.
- Global Deliverables vers Deliverable Drawer : réutilisation plausible mais non prouvée, donc interdite comme relation canonique.
- Source/personne depuis Full Package Drawer : destination non démontrée.
- URL, historique, deep links, retour à l'origine de décision : contrat absent.
- NavRail des écrans transactionnels et interactivité Work Plan : conflits conservés.

## 7. Sources

Constitution §§2–11 ; `D01`, `D02`, `D03`, `D04`, `D09`, `D10`, `D11`, `D16`, `D17`, `D18`, `D20`; captures `U01–U23` selon le registre de traçabilité.
