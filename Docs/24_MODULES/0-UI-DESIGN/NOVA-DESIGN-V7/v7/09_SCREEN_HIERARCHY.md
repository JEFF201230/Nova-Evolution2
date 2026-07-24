# 09 — HIÉRARCHIE DES ÉCRANS
## NOVA V7 — Reconstruction à partir des maquettes existantes

> Règle : Aucune invention. Toute relation incertaine est marquée ⚠ À confirmer.
> Source de vérité : `/workspaces/default/code/src/app/App.tsx`

---

## 1. HIÉRARCHIE DE RENDU REACT

La hiérarchie parent/enfant est déterminée par la structure de rendu dans App.tsx, pas par la navigation.

```
App (racine — état global)
│
├── NavRail [absent si fullscreen]
│   └── NavItem × 5 actifs + 4 no-op + UserRow
│
├── main (flex:1)
│   │
│   ├── HomeView [view="home"]
│   │   ├── Header (h1 + p subtitle)
│   │   ├── HeroBlock (gradient)
│   │   ├── Composer (textarea expandable)
│   │   │   └── SuggestionPills
│   │   ├── ActiveWorkSection
│   │   │   └── WorkRow × N (cliquables)
│   │   ├── DecisionNudge (si décision pending)
│   │   └── Drawer [detailOpen] — Work detail
│   │       ├── DrawerSection: Summary
│   │       ├── DrawerSection: Why it matters
│   │       ├── DrawerSection: What is blocking
│   │       ├── DrawerSection: Key evidence
│   │       ├── DrawerSection: Later actions
│   │       └── DrawerSection: Background
│   │
│   ├── ClarifyView [view="clarify"]
│   │   ├── ProgressDots
│   │   ├── QuestionText
│   │   ├── AnswerOptions × N (radio)
│   │   └── NavigationButtons (Back / Next)
│   │
│   ├── CanvasView [view="canvas"]
│   │   ├── CanvasCard × N (editable)
│   │   │   ├── ViewMode (Edit button)
│   │   │   └── EditMode (textarea + Save/Cancel)
│   │   └── NavigationButtons (Back / Continue)
│   │
│   ├── PlanView [view="plan"]
│   │   ├── PhaseAccordion × N
│   │   │   ├── PhaseHeader (toggle)
│   │   │   └── PhaseContent [si open]
│   │   └── NavigationButtons (Back / Confirm and start)
│   │
│   ├── ConfirmView [view="confirm"]
│   │   ├── AutonomyRadio × 4 (A0 → A3)
│   │   └── NavigationButtons (Back / Start work)
│   │
│   ├── WorkView [view="work"]  ← shell avec état propre (tab)
│   │   ├── Breadcrumb (sticky top)
│   │   ├── WorkHeader (titre, health, progress, MoreHorizontal)
│   │   ├── TabStrip (7 onglets)
│   │   └── TabContent
│   │       ├── WorkOverviewTab [tab="overview"]
│   │       │   ├── HeroBlock (focal card Next Best Action)
│   │       │   │   ├── ConfChip + DeadlineBadge
│   │       │   │   ├── WhyInline
│   │       │   │   └── Primary CTA "Open"
│   │       │   ├── PhaseAccordion × N
│   │       │   ├── Sidebar
│   │       │   │   ├── SidebarCard: Next Best Action
│   │       │   │   ├── SidebarCard: Phase progress
│   │       │   │   └── SidebarCard: Deadline
│   │       │   └── Drawer [detailOpen] — Full analysis
│   │       │
│   │       ├── WorkPlanTab [tab="plan"]
│   │       │   └── PhaseAccordion × N
│   │       │
│   │       ├── WorkActivityTab [tab="activity"]
│   │       │   ├── FilterPills × 5
│   │       │   ├── ActivityEvent × N
│   │       │   │   ├── Avatar (28px circle)
│   │       │   │   ├── EventText (headline + change)
│   │       │   │   └── NOVABox (impact + delta + sources)
│   │       │   └── CommentInput (textarea + Post)
│   │       │
│   │       ├── WorkPeopleTab [tab="people"]
│   │       │   ├── PersonCard × 4
│   │       │   │   ├── Avatar (38px)
│   │       │   │   ├── Name + Role + Availability
│   │       │   │   ├── Contribution text
│   │       │   │   ├── NOVAReasoningBox [si novaState]
│   │       │   │   └── "Details" button
│   │       │   └── Drawer [drawer] — Person
│   │       │
│   │       ├── WorkSourcesTab [tab="sources"]
│   │       │   ├── CounterStrip (inline text)
│   │       │   ├── SourceCard × 4 (sorted: missing → stale → available)
│   │       │   │   ├── Name + StatusBadge
│   │       │   │   ├── Meta (type · freshness · uses)
│   │       │   │   ├── AIComment (Sparkles + text)
│   │       │   │   └── Actions (Add/Refresh + Details)
│   │       │   └── Drawer [drawer] — Source
│   │       │
│   │       ├── WorkDecisionsTab [tab="decisions"]
│   │       │   └── DecisionCard × N (filtré par workId)
│   │       │       ├── DeadlineBadge + ConfChip
│   │       │       ├── Statement
│   │       │       ├── Recommendation (NOVA)
│   │       │       ├── IfApproved / IfRejected grid
│   │       │       └── "Review & decide" + WhyInline
│   │       │
│   │       └── WorkDeliverablesTab [tab="deliverables"]
│   │           ├── DeliverableCard × N
│   │           │   ├── Name + ConfChip
│   │           │   ├── ReadinessBar
│   │           │   ├── BlockerText
│   │           │   ├── NextAction
│   │           │   └── Eye + "Details"
│   │           └── Drawer [drawer] — Deliverable
│   │
│   ├── GlobalDecisionsView [view="global-decisions"]
│   │   ├── Header (h1 + subtitle)
│   │   ├── FilterTabs × 4
│   │   └── DecisionCard × N (filtré)
│   │       ├── HeroSentence
│   │       ├── DeadlineBadge + ConfChip
│   │       ├── Statement
│   │       └── Outcome [si decided]
│   │
│   ├── GlobalDeliverablesView [view="global-deliverables"]
│   │   ├── Header (h1 + "Create" button)
│   │   ├── FilterTabs × 4
│   │   └── DeliverableRow × N (filtré)
│   │       ├── FileText icon + Name + Meta
│   │       ├── ConfChip
│   │       └── Eye + Download [si published]
│   │
│   ├── DecisionPackageView [view="decision-package"]
│   │   ├── BackLink "← Back to work"
│   │   ├── HeroBlock (gradient critBg)
│   │   │   ├── DeadlineBadge + ConfChip
│   │   │   ├── Statement (18px 700)
│   │   │   ├── HeroSentence
│   │   │   ├── Recommendation (NOVA, Sparkles)
│   │   │   └── "Review and decide" + WhyInline + "Full package"
│   │   ├── IfApproved / IfRejected grid
│   │   ├── Options section
│   │   │   └── OptionButton × N (radio style)
│   │   ├── Dissent block [si dissent]
│   │   ├── "Review and decide" (bas de page)
│   │   └── Drawer [detailOpen] — Decision package
│   │
│   ├── DecisionPauseView [view="decision-pause"] ← FULLSCREEN
│   │   ├── Header (Lock icon + title + Back)
│   │   ├── StepIndicator (Review → Decide)
│   │   ├── Step "review"
│   │   │   ├── ReviewCard × N (decision/recommended/if-approved/if-rejected/uncertainty)
│   │   │   └── "I have reviewed" + "Cancel"
│   │   └── Step "decide"
│   │       ├── ChoiceButton × 4 (Approve/Changes/Reject/Defer)
│   │       ├── RationaleTextarea (required)
│   │       └── "Record" + "← Back"
│   │
│   └── DecisionReceiptView [view="decision-receipt"] ← FULLSCREEN
│       ├── SuccessIcon (CheckCircle 44px)
│       ├── Title + Subtitle
│       ├── ReceiptCard
│       │   ├── ReferenceCode (MONO)
│       │   └── ReceiptRow × 5 (Outcome/Decision/Option/Authority/Recorded)
│       ├── ResultingActionsCard
│       │   └── ActionRow × 3
│       └── CTAs ("Return to work" + "Share receipt")
│
└── SearchOverlay [searchOpen=true]
    ├── Backdrop (fixed, blur)
    └── Panel (520px)
        ├── Input header (Search icon + input + kbd Esc)
        └── ResultList (max-height 360px)
            └── ResultItem × N
```

---

## 2. HIÉRARCHIE FONCTIONNELLE (groupes)

```
NIVEAU 0 — Racine
  App

NIVEAU 1 — Navigation
  NavRail | SearchOverlay

NIVEAU 1 — Contenu principal
  HomeView | ClarifyView | CanvasView | PlanView | ConfirmView
  WorkView | GlobalDecisionsView | GlobalDeliverablesView
  DecisionPackageView | DecisionPauseView | DecisionReceiptView

NIVEAU 2 — Sous-vues de Work
  WorkOverviewTab | WorkPlanTab | WorkActivityTab
  WorkPeopleTab | WorkSourcesTab | WorkDecisionsTab | WorkDeliverablesTab

NIVEAU 2 — Overlays contextuels
  Drawer (×6 instances) | ConfChip popover | WhyInline

NIVEAU 3 — Composants primitifs
  Card | Btn | NOVALabel | ConfChip | DeadlineBadge | StatusDot
  DrawerSection | DrawerRow | NavItem
```

---

## 3. PROPRIÉTÉ DE L'ÉTAT PAR NIVEAU

| Niveau | Composant | État local géré |
|---|---|---|
| App (racine) | App | view, activeWork, activeDecision, searchOpen |
| Vue principale | HomeView | composerOpen, detailOpen |
| Vue principale | WorkView | tab |
| Vue principale | DecisionPauseView | step, choice, rationale, loading |
| Sous-vue | WorkOverviewTab | detailOpen |
| Sous-vue | WorkActivityTab | filter |
| Sous-vue | WorkPeopleTab | drawer |
| Sous-vue | WorkSourcesTab | drawer |
| Sous-vue | WorkDeliverablesTab | drawer |
| Sous-vue | DecisionPackageView | sel, detailOpen |
| Vue globale | GlobalDecisionsView | filter |
| Vue globale | GlobalDeliverablesView | filter |
| Primitif | ConfChip | open |
| Primitif | WhyInline | open |
| Primitif | Card | hovered |
| Primitif | Btn | hovered, loading |
| Overlay | SearchOverlay | q |

---

## 4. ISOLATION DES VUES FULLSCREEN

`decision-pause` et `decision-receipt` sont des vues **isolées du shell principal** :

- Pas de NavRail
- Pas d'accès aux tabs Work
- Pas de SearchOverlay accessible (⚠ À confirmer — le keydown global est toujours actif mais le NavRail Search est absent)
- Centrage vertical/horizontal propre (alignItems: flex-start, justifyContent: center)
- Background canvas pleine hauteur

---

## 5. WORK VIEW — STRUCTURE INTERNE

WorkView est le seul écran avec une **hiérarchie à 2 niveaux** (shell + onglets).

```
WorkView [view="work", workId prop]
│
├── Props reçues depuis App : workId, setView, setActiveDecision
├── État propre : tab (WorkTab)
│
├── Breadcrumb (sticky, zIndex:10)
│   └── "← {item.outcome}" → setView("home")
│
├── WorkHeader
│   ├── Titre (outcome, 20px 650)
│   ├── HealthBadge (attention/active/blocked/complete)
│   ├── ProgressBar (3px, colorée)
│   └── MoreHorizontal [no-op]
│
├── TabStrip (7 boutons)
│   └── active : underline 2px N.action
│
└── TabContent (switch sur tab)
    ├── [overview] WorkOverviewTab(item, setView, setActiveDecision)
    ├── [plan]     WorkPlanTab(item)
    ├── [activity] WorkActivityTab()
    ├── [people]   WorkPeopleTab()
    ├── [sources]  WorkSourcesTab()
    ├── [decisions] WorkDecisionsTab(setActiveDecision, setView, workId)
    └── [deliverables] WorkDeliverablesTab()
```
