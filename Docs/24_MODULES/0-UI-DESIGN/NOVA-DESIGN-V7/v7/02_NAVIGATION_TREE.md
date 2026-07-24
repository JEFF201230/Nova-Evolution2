# 02 — ARBRE DE NAVIGATION
## NOVA V7 — Reconstruction à partir des maquettes existantes

> Règle : Aucune invention. Toute relation incertaine est marquée ⚠ À confirmer.
> Source de vérité : `/workspaces/default/code/src/app/App.tsx`

---

## 1. ARBRE COMPLET

```
NOVA V7
│
├── [NavRail — présent sur 9 vues]
│   ├── Home ──────────────────────────────────► view="home"
│   ├── Work ──────────────────────────────────► view="work"
│   ├── Decisions ─────────────────────────────► view="global-decisions"
│   ├── Deliverables ──────────────────────────► view="global-deliverables"
│   └── Search ─────────────────────────────────► SearchOverlay (Cmd+K)
│
├── HOME  [view="home"]
│   ├── Suggestion pill ──────────────────────► popule Composer (même écran)
│   ├── Composer submit ──────────────────────► view="clarify"
│   ├── Work item row (clic) ─────────────────► setActiveWork + view="work"
│   ├── "Details" (work row) ─────────────────► Drawer — Work detail
│   └── "Review & decide" (décision) ─────────► setActiveDecision + view="decision-package"
│
├── CLARIFY  [view="clarify"]
│   ├── "Next" (réponse Q&A) ─────────────────► avance dans les questions
│   ├── Dernière question "Next" ─────────────► view="canvas"
│   └── "Back" ───────────────────────────────► view="home"
│
├── CANVAS  [view="canvas"]
│   ├── Edit / Save (cartes) ─────────────────► état local (même écran)
│   ├── "Continue" ───────────────────────────► view="plan"
│   └── "Back" ───────────────────────────────► view="clarify"    ⚠ À confirmer
│
├── PLAN  [view="plan"]
│   ├── Accordion phase toggle ───────────────► état local (même écran)
│   ├── "Confirm and start" ──────────────────► view="confirm"
│   └── "Back" ───────────────────────────────► view="canvas"    ⚠ À confirmer
│
├── CONFIRM  [view="confirm"]
│   ├── Radio autonomy level ─────────────────► état local (même écran)
│   ├── "Start work" ─────────────────────────► setActiveWork + view="work"
│   └── "Back" ───────────────────────────────► view="plan"    ⚠ À confirmer
│
├── WORK  [view="work"]
│   ├── Breadcrumb "← Back" ──────────────────► view="home"
│   ├── MoreHorizontal ───────────────────────► [no-op]
│   ├── TabStrip
│   │   ├── overview ────────────────────────► WorkOverviewTab
│   │   ├── plan ────────────────────────────► WorkPlanTab
│   │   ├── activity ────────────────────────────► WorkActivityTab
│   │   ├── people ──────────────────────────► WorkPeopleTab
│   │   ├── sources ─────────────────────────► WorkSourcesTab
│   │   ├── decisions ───────────────────────► WorkDecisionsTab
│   │   └── deliverables ────────────────────► WorkDeliverablesTab
│   │
│   ├── WorkOverviewTab
│   │   ├── "Open" (Next Best Action) ────────► [no-op]
│   │   └── "Full analysis" ──────────────────► Drawer — Full analysis
│   │
│   ├── WorkPlanTab
│   │   └── Accordion toggle ─────────────────► état local
│   │
│   ├── WorkActivityTab
│   │   ├── Filter pills ─────────────────────► filtre local
│   │   └── "Post" (commentaire) ─────────────► [no-op]
│   │
│   ├── WorkPeopleTab
│   │   └── "Details" ────────────────────────► Drawer — Person
│   │
│   ├── WorkSourcesTab
│   │   ├── "Add" (missing) ──────────────────► [no-op]
│   │   ├── "Refresh" (stale) ────────────────► [no-op]
│   │   └── "Details" ────────────────────────► Drawer — Source
│   │
│   ├── WorkDecisionsTab
│   │   └── "Review & decide" ────────────────► setActiveDecision + view="decision-package"
│   │
│   └── WorkDeliverablesTab
│       ├── Eye ──────────────────────────────► [no-op]
│       └── "Details" ────────────────────────► Drawer — Deliverable
│
├── GLOBAL-DECISIONS  [view="global-decisions"]
│   ├── Filter tabs ──────────────────────────► filtre local
│   └── Card clic (si non decided) ───────────► setActiveDecision + view="decision-package"
│
├── GLOBAL-DELIVERABLES  [view="global-deliverables"]
│   ├── "Create" ─────────────────────────────► [no-op]
│   ├── Eye ──────────────────────────────────► [no-op]
│   ├── Download (published) ─────────────────► [no-op]
│   └── Filter tabs ──────────────────────────► filtre local
│
├── DECISION-PACKAGE  [view="decision-package"]
│   ├── "← Back to work" ─────────────────────► view="work"
│   ├── Radio option ─────────────────────────► état local
│   ├── "Review and decide" (hero) ───────────► view="decision-pause"
│   ├── "Full package" (lien) ────────────────► Drawer — Decision package
│   └── "Review and decide" (bas) ───────────► view="decision-pause"
│
├── DECISION-PAUSE  [view="decision-pause"]  ← FULLSCREEN (pas de NavRail)
│   ├── "← Back" ─────────────────────────────► view="decision-package"
│   ├── Step 1 — Review
│   │   ├── "I have reviewed — continue" ─────► step="decide"
│   │   └── "Cancel" ─────────────────────────► view="decision-package"
│   └── Step 2 — Decide
│       ├── Radio choix ──────────────────────► état local
│       ├── Textarea rationale ───────────────► état local
│       ├── "← Back" ─────────────────────────► step="review"
│       └── "Record" ─────────────────────────► 700ms loading → view="decision-receipt"
│
├── DECISION-RECEIPT  [view="decision-receipt"]  ← FULLSCREEN (pas de NavRail)
│   ├── "Return to work" ─────────────────────► view="work"
│   ├── "Share receipt" ──────────────────────► [no-op]
│   └── "Export" ─────────────────────────────► [no-op]
│
└── SEARCH OVERLAY  [searchOpen=true]  ← modal global
    ├── Backdrop clic ────────────────────────► close overlay
    ├── Escape ───────────────────────────────► close overlay
    └── Résultat clic ────────────────────────► setActiveWork/setActiveDecision + setView + close
```

---

## 2. ENTRÉES VERS DECISION-PACKAGE

La vue `decision-package` est accessible depuis **3 points d'entrée distincts** :

| Point d'entrée | Écran source | CTA |
|---|---|---|
| Work item decision | `work` → `WorkDecisionsTab` | "Review & decide" |
| Liste globale | `global-decisions` | clic sur carte (si non decided) |
| Accueil | `home` | "Review & decide" (section décisions) |
| Recherche | `SearchOverlay` | clic sur résultat décision |

---

## 3. ENTRÉES VERS WORK

La vue `work` est accessible depuis **4 points d'entrée** :

| Point d'entrée | Écran source | Mécanisme |
|---|---|---|
| NavRail | tout écran avec NavRail | NavItem Work |
| Accueil | `home` | clic sur work item row |
| Reçu décision | `decision-receipt` | "Return to work" |
| Confirmation | `confirm` | "Start work" |

---

## 4. POINTS SANS RETOUR DÉFINI

Les vues suivantes n'ont pas de CTA "retour" codé (navigation de retour uniquement via NavRail) :

| Vue | Observation |
|---|---|
| `global-decisions` | Pas de "retour" — NavRail seulement |
| `global-deliverables` | Pas de "retour" — NavRail seulement |

⚠ À confirmer : existence d'un back implicite sur ces vues.

---

## 5. VUES TERMINALES

Ces vues n'ont pas de CTA "continuer" vers une vue suivante dans le flux principal :

| Vue | Sortie principale |
|---|---|
| `decision-receipt` | "Return to work" → `work` |
| `global-decisions` | navigate vers `decision-package` |
| `global-deliverables` | aucune sortie active |
