# 10 — MASTER NAVIGATION BLUEPRINT
## NOVA V7 — Reconstruction complète de l'architecture UX

> Règle : Aucune invention. Toute relation incertaine est marquée ⚠ À confirmer.
> Source de vérité : `/workspaces/default/code/src/app/App.tsx`
> Ce document est la synthèse des 9 planches précédentes.

---

## CARTE PRINCIPALE

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  NOVA V7 — APPLICATION COMPLÈTE                                                             │
│                                                                                             │
│  ┌──────────────┐                                                                           │
│  │  NAVRAIL     │ ← présent sur 9 vues (absent sur decision-pause et decision-receipt)      │
│  │  220px       │                                                                           │
│  │  ─────────   │                                                                           │
│  │  🏠 Home    ─┼──────────────────────────────────────────────► HOME                       │
│  │  💼 Work    ─┼──────────────────────────────────────────────► WORK                       │
│  │  ⚖ Decisions─┼──────────────────────────────────────────────► GLOBAL-DECISIONS           │
│  │  📄 Deliverables─┼─────────────────────────────────────────► GLOBAL-DELIVERABLES         │
│  │  🔍 Search  ─┼──────────────────────────────────────────────► SEARCH OVERLAY (Cmd+K)     │
│  │  🔔 Bell     │ [no-op]                                                                   │
│  │  ❓ Help     │ [no-op]                                                                   │
│  │  ⚙ Settings │ [no-op]                                                                   │
│  │  👤 User     │ [no-op]                                                                   │
│  └──────────────┘                                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## FLUX DÉTAILLÉ PAR ÉCRAN

---

### HOME

```
┌─────────────────────────────────────────────────────────────────┐
│  HOME                                                           │
│                                                                 │
│  [Composer — saisie ou suggestion pill]                         │
│      │ "Ask NOVA" / "Start" (primary)                           │
│      └────────────────────────────────────────────────────────► CLARIFY
│                                                                 │
│  [Work item row × N]  (clic zone cliquable)                     │
│      │ → setActiveWork(id)                                      │
│      └────────────────────────────────────────────────────────► WORK (tab: overview)
│                                                                 │
│  [Work item "Details"]  → drawer "Work detail"                  │
│      │ Drawer: Summary / Why / Blocking / Evidence / Actions    │
│      └────────────────────────────────────────────────────────► [DRAWER — fermeture via X ou backdrop]
│                                                                 │
│  [Decision nudge — "Review & decide"]  → setActiveDecision(id)  │
│      └────────────────────────────────────────────────────────► DECISION-PACKAGE
│                                                                 │
│  [Suggestion pill]  → popule Composer (même écran)              │
│  [WhyInline]  → expansion inline (même écran)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

### CLARIFY

```
┌─────────────────────────────────────────────────────────────────┐
│  CLARIFY                                                        │
│                                                                 │
│  [Questions Q1..QN — sélection réponse radio]                   │
│  [ProgressDots — indicateur visuel position]                    │
│                                                                 │
│  ["Back"]                                                       │
│      └────────────────────────────────────────────────────────► HOME
│                                                                 │
│  ["Next"] (non finale)  → step+1 (même écran)                   │
│  ["Next"] (finale)                                              │
│      └────────────────────────────────────────────────────────► CANVAS
└─────────────────────────────────────────────────────────────────┘
```

---

### CANVAS

```
┌─────────────────────────────────────────────────────────────────┐
│  CANVAS                                                         │
│                                                                 │
│  [Carte Edit / Save / Cancel]  → état local                     │
│                                                                 │
│  ["Back"]  ⚠ À confirmer                                        │
│      └────────────────────────────────────────────────────────► CLARIFY
│                                                                 │
│  ["Continue"]                                                   │
│      └────────────────────────────────────────────────────────► PLAN
└─────────────────────────────────────────────────────────────────┘
```

---

### PLAN

```
┌─────────────────────────────────────────────────────────────────┐
│  PLAN                                                           │
│                                                                 │
│  [Accordéon phase toggle]  → open/close local                   │
│                                                                 │
│  ["Back"]  ⚠ À confirmer                                        │
│      └────────────────────────────────────────────────────────► CANVAS
│                                                                 │
│  ["Confirm and start"]                                          │
│      └────────────────────────────────────────────────────────► CONFIRM
└─────────────────────────────────────────────────────────────────┘
```

---

### CONFIRM

```
┌─────────────────────────────────────────────────────────────────┐
│  CONFIRM                                                        │
│                                                                 │
│  [Radio autonomy A0→A3]  → sélection locale                     │
│                                                                 │
│  ["Back"]  ⚠ À confirmer                                        │
│      └────────────────────────────────────────────────────────► PLAN
│                                                                 │
│  ["Start work"]  → setActiveWork(newId)                         │
│      └────────────────────────────────────────────────────────► WORK (tab: overview)
└─────────────────────────────────────────────────────────────────┘
```

---

### WORK (shell + 7 onglets)

```
┌─────────────────────────────────────────────────────────────────┐
│  WORK                                                           │
│  [Breadcrumb sticky top]                                        │
│                                                                 │
│  ["← {titre work}"]                                             │
│      └────────────────────────────────────────────────────────► HOME
│                                                                 │
│  [MoreHorizontal]  [no-op]                                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  TABS : overview | plan | activity | people | sources | decisions | deliverables  │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ── TAB: OVERVIEW ──────────────────────────────────────────    │
│  [Next Best Action — "Open"]  [no-op]                           │
│  ["Full analysis"]  → drawer "Full analysis"                    │
│  [Phase accordion toggle]  → local                              │
│  [ConfChip]  → popover local                                    │
│  [WhyInline]  → expansion locale                                │
│                                                                 │
│  ── TAB: PLAN ──────────────────────────────────────────────    │
│  [Phase accordion toggle]  → local                              │
│                                                                 │
│  ── TAB: ACTIVITY ──────────────────────────────────────────    │
│  [Filter pills: all/human/ai/critical/sources]  → filtre local  │
│  ["Post" commentaire]  [no-op]                                  │
│                                                                 │
│  ── TAB: PEOPLE ────────────────────────────────────────────    │
│  ["Details" personne]  → drawer "Person"                        │
│                                                                 │
│  ── TAB: SOURCES ───────────────────────────────────────────    │
│  ["Add" sources]  [no-op]                                       │
│  ["Refresh" source stale]  [no-op]                              │
│  ["Details" source]  → drawer "Source"                          │
│                                                                 │
│  ── TAB: DECISIONS ─────────────────────────────────────────    │
│  ["Review & decide"]  → setActiveDecision(id)                   │
│      └──────────────────────────────────────────────────────► DECISION-PACKAGE
│  [ConfChip]  → popover local                                    │
│  [WhyInline]  → expansion locale                                │
│                                                                 │
│  ── TAB: DELIVERABLES ──────────────────────────────────────    │
│  [Eye]  [no-op]                                                 │
│  ["Details"]  → drawer "Deliverable"                            │
│  ["Create"]  [no-op]                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

### GLOBAL-DECISIONS

```
┌─────────────────────────────────────────────────────────────────┐
│  GLOBAL-DECISIONS                                               │
│                                                                 │
│  [Filter tabs: All / Needs my decision / Waiting / History]     │
│      → filtre local                                             │
│                                                                 │
│  [Carte décision — status pending ou waiting]                   │
│      │ → setActiveDecision(id)                                  │
│      └────────────────────────────────────────────────────────► DECISION-PACKAGE
│                                                                 │
│  [Carte décision — status decided]  → [non cliquable]           │
│  [ConfChip]  → popover local                                    │
│  [DeadlineBadge]  → [non cliquable — affichage seul]            │
└─────────────────────────────────────────────────────────────────┘
```

---

### GLOBAL-DELIVERABLES

```
┌─────────────────────────────────────────────────────────────────┐
│  GLOBAL-DELIVERABLES                                            │
│                                                                 │
│  ["Create"]  [no-op]                                            │
│  [Filter tabs: All / Drafts / In review / Published]            │
│      → filtre local                                             │
│  [Eye]  [no-op]                                                 │
│  [Download] (published seulement)  [no-op]                      │
│  [ConfChip]  → popover local                                    │
│                                                                 │
│  ⚠ Aucune navigation sortante active (hors NavRail)             │
└─────────────────────────────────────────────────────────────────┘
```

---

### DECISION-PACKAGE

```
┌─────────────────────────────────────────────────────────────────┐
│  DECISION-PACKAGE                                               │
│                                                                 │
│  ["← Back to work"]                                             │
│      └────────────────────────────────────────────────────────► WORK
│                                                                 │
│  [HERO BLOCK]                                                   │
│  ├── [ConfChip]  → popover local                                │
│  ├── [DeadlineBadge]  → [non cliquable]                         │
│  ├── ["Review and decide" (hero)]                               │
│  │       └─────────────────────────────────────────────────► DECISION-PAUSE
│  └── ["Full package"]  → drawer "Decision package"              │
│                                                                 │
│  [IfApproved / IfRejected grid]  → [affichage seul]             │
│                                                                 │
│  [Options radio × N]  → setSel(id) local                        │
│  [WhyInline]  → expansion locale                                │
│                                                                 │
│  [Dissent block]  → [affichage seul si dissent non vide]        │
│                                                                 │
│  ["Review and decide" (bas de page)]                            │
│      └────────────────────────────────────────────────────────► DECISION-PAUSE
└─────────────────────────────────────────────────────────────────┘
```

---

### DECISION-PAUSE (FULLSCREEN — sans NavRail)

```
┌─────────────────────────────────────────────────────────────────┐
│  DECISION-PAUSE  [FULLSCREEN]                                   │
│                                                                 │
│  [Header: Lock icon + "Decision · {authority}" + "← Back"]     │
│  ["← Back"]                                                     │
│      └────────────────────────────────────────────────────────► DECISION-PACKAGE
│                                                                 │
│  [StepIndicator: Review ──── Decide]                            │
│                                                                 │
│  ── STEP 1: REVIEW ─────────────────────────────────────────    │
│  [ReviewCards × N : Decision/Recommended/If approved/etc.]      │
│  ["I have reviewed — continue"]                                 │
│      → setStep("decide")  [même écran]                          │
│  ["Cancel"]                                                     │
│      └────────────────────────────────────────────────────────► DECISION-PACKAGE
│                                                                 │
│  ── STEP 2: DECIDE ─────────────────────────────────────────    │
│  [Choice × 4: Approve / Request changes / Reject / Defer]       │
│      → setChoice(id) local                                      │
│  [Textarea rationale]  → setRationale(value) local              │
│                                                                 │
│  ["← Back"]                                                     │
│      → setStep("review")  [même écran]                          │
│                                                                 │
│  ["Record — {choix}"]  (désactivé si choice=null ou texte vide) │
│      → 700ms loading spinner                                    │
│      └────────────────────────────────────────────────────────► DECISION-RECEIPT
└─────────────────────────────────────────────────────────────────┘
```

---

### DECISION-RECEIPT (FULLSCREEN — sans NavRail)

```
┌─────────────────────────────────────────────────────────────────┐
│  DECISION-RECEIPT  [FULLSCREEN]                                 │
│                                                                 │
│  [CheckCircle 44px — succès]                                    │
│  [Titre "Decision recorded" + "Permanent and immutable record"] │
│                                                                 │
│  [ReceiptCard]                                                  │
│  ├── ["Export"]  [no-op]                                        │
│  └── ReferenceCode DEC-2025-{id}-Q3 (MONO)                      │
│  [ReceiptRow × 5: Outcome/Decision/Option/Authority/Recorded]   │
│                                                                 │
│  [ResultingActionsCard × 3 actions hardcodées]                  │
│                                                                 │
│  ["Return to work"]                                             │
│      └────────────────────────────────────────────────────────► WORK
│                                                                 │
│  ["Share receipt"]  [no-op]                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

### SEARCH OVERLAY (global — z:100)

```
┌─────────────────────────────────────────────────────────────────┐
│  SEARCH OVERLAY  [fixed, plein écran, z-index 100]              │
│                                                                 │
│  DÉCLENCHEURS D'OUVERTURE:                                      │
│  ├── Cmd+K / Ctrl+K  (keydown global)                           │
│  └── NavRail Search icon                                        │
│                                                                 │
│  [Input — autofocus, filtre live]                               │
│                                                                 │
│  RÉSULTATS (query < 2 chars — récents hardcodés × 3)            │
│  RÉSULTATS (query ≥ 2 chars — WORK_ITEMS + DECISIONS filtrés)   │
│                                                                 │
│  [Résultat work item]  → setActiveWork(id)                      │
│      └────────────────────────────────────────────────────────► WORK + close overlay
│                                                                 │
│  [Résultat décision]  → setActiveDecision(id)                   │
│      └────────────────────────────────────────────────────────► DECISION-PACKAGE + close overlay
│                                                                 │
│  FERMETURE:                                                     │
│  ├── Escape (input keydown)                                     │
│  ├── setSearchOpen(false) (keydown global Escape)               │
│  └── Clic backdrop (e.target === e.currentTarget)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## MATRICE DE NAVIGATION COMPLÈTE

| De → Vers | home | clarify | canvas | plan | confirm | work | g-dec | g-del | dec-pkg | dec-pause | dec-rcpt |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **home** | — | Composer → | — | — | — | Row clic → | — | — | Review → | — | — |
| **clarify** | Back → | — | Next final → | — | — | — | — | — | — | — | — |
| **canvas** | — | Back ⚠ | — | Continue → | — | — | — | — | — | — | — |
| **plan** | — | — | Back ⚠ | — | Confirm → | — | — | — | — | — | — |
| **confirm** | — | — | — | Back ⚠ | — | Start work → | — | — | — | — | — |
| **work** | Back → | — | — | — | — | — | — | — | Review → | — | — |
| **g-dec** | — | — | — | — | — | — | — | — | Carte → | — | — |
| **g-del** | — | — | — | — | — | — | — | — | — | — | — |
| **dec-pkg** | — | — | — | — | — | Back → | — | — | — | Review → | — |
| **dec-pause** | — | — | — | — | — | — | — | — | Back/Cancel → | — | Record → |
| **dec-rcpt** | — | — | — | — | — | Return → | — | — | — | — | — |
| **NavRail** | Home → | Home → | Home → | Home → | Home → | Work → | — | — | Work → | — | — |
| **Search** | — | — | — | — | — | Work clic → | — | — | Dec clic → | — | — |

`⚠` = À confirmer

---

## RÉSUMÉ DES POINTS CLÉS

### Points d'entrée vers les écrans centraux

| Écran central | Points d'entrée |
|---|---|
| `work` | home (row), confirm (Start work), decision-receipt (Return), NavRail, SearchOverlay |
| `decision-package` | home (nudge), work:decisions (CTA), global-decisions (carte), SearchOverlay |

### Écrans fullscreen (sans NavRail)
- `decision-pause` — isolation intentionnelle pour l'enregistrement de décision
- `decision-receipt` — confirmation finale

### Stubs (actions visibles mais sans effet)
14 CTAs présents visuellement mais sans handler fonctionnel (Composer attach/mic, NavRail Bell/Help/Settings/User, Work MoreHorizontal, WorkSources Add/Refresh, WorkDeliverables Eye, WorkActivity Post, DecisionReceipt Share/Export, GlobalDeliverables Create/Eye/Download).

### Relations à confirmer (⚠)
- Boutons "Back" sur `canvas`, `plan`, `confirm` — présence et destination non certifiées depuis le code
- Fermeture des drawers par Escape — non observée dans le code
- Clic extérieur sur ConfChip popover — non implémenté
