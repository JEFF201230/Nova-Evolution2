# NOVA — Navigation Map

**Autorité de navigation :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](./NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Mission :** P37-MO-002_NOVA_UX_ARCHITECTURE_CANONICALIZATION

**Nature :** vue graphique dérivée ; ne modifie pas la Constitution UX

## 1. Légende

```text
[PAGE]       page ou vue principale
(SOUS-VUE)   état local, onglet ou étape
<DRAWER>     panneau latéral sur contexte conservé
{OVERLAY}    surface superposée globale
→            transition démontrée
⇄            transition locale réversible
?→           destination ou comportement non déterminé
!            conflit conservé
```

Niveaux :

```text
L0  Shell global
L1  Navigation primaire
L2  Contexte Work ou parcours métier
L3  Onglet / étape / filtre / état local
L4  Drawer / overlay / popover / disclosure
TX  Écran transactionnel plein écran
```

## 2. Vue globale

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ L0 — NOVA SHELL                                                            │
│                                                                             │
│ NavRail ! 56 px DOC / 220 px UX                                             │
│ ├── Home ───────────────→ [HOME /home]                                      │
│ ├── Work ───────────────→ [WORK /work/:id]                                  │
│ ├── Decisions ──────────→ [GLOBAL DECISIONS /decisions]                     │
│ ├── Deliverables ───────→ [GLOBAL DELIVERABLES /deliverables]               │
│ └── Search / Cmd-Ctrl+K ─→ {SEARCH OVERLAY}                                 │
│     Notifications / Help / Preferences / Profile ?→                        │
└─────────────────────────────────────────────────────────────────────────────┘

[HOME]
├── (Composer) → [CLARIFY] → [CANVAS] → [PLAN SETUP] → [CONFIRM] → [WORK]
├── Open presentation / Active work → [WORK]
├── Decision card → [DECISION PACKAGE]
└── Details → <HOME SITUATION DRAWER>

[WORK]
├── (Overview) ─────→ [DECISION PACKAGE] | <FULL ANALYSIS DRAWER>
├── (Plan)
├── (Activity) ─────⇄ filtres All/Human/AI/Critical/Sources
├── (People) ───────→ <PERSON DRAWER>
├── (Sources) ──────→ <SOURCE DRAWER>
├── (Decisions) ────→ [DECISION PACKAGE]
└── (Deliverables) ─→ <DELIVERABLE DRAWER>

[GLOBAL DECISIONS] ─→ [DECISION PACKAGE]
[GLOBAL DELIVERABLES] ?→ détail non démontré
{SEARCH OVERLAY} ────→ [WORK] ou [DECISION PACKAGE]

[DECISION PACKAGE]
├── Full package → <FULL PACKAGE DRAWER>
├── Why ⇄ expansion inline
└── Review and decide → [DECISION PAUSE: REVIEW]
                            ↓ Continue
                       [DECISION PAUSE: DECIDE]
                            ↓ Record valide
                       [DECISION RECEIPT]
                            ↓ Return to work
                          [WORK]
```

## 3. Vue détaillée — Shell et navigation primaire

```text
App
├── NavRail (persistante sur les vues non transactionnelles)
│   ├── Groupe primaire
│   │   ├── Home
│   │   ├── Work (activeWork requis ; absence de Work ?)
│   │   ├── Decisions
│   │   └── Deliverables
│   ├── Groupe utilitaire
│   │   ├── Search → Search Overlay
│   │   ├── Notifications ?
│   │   ├── Help ?
│   │   └── Settings / Preferences ?
│   └── User profile ?
├── Main
│   └── vue courante
└── SearchOverlay (conditionnel et global)
```

Conflits conservés :

- largeur NavRail `56 px` dans Information Architecture contre `220 px` dans des spécifications et captures ;
- présence NavRail sur Decision Pause/Receipt dans une matrice contre absence dans App et les captures fullscreen ;
- routes déclarées contre navigation interne par `setView()` sans `href`.

## 4. Vue détaillée — Home et Work Setup

```text
[HOME]
├── Composer replié
│   ├── clic → Composer développé
│   └── suggestion → Composer développé + objectif prérempli
├── Composer développé
│   ├── Cancel → Composer replié
│   └── objectif non vide + Continue/Cmd-Ctrl+Enter → [CLARIFY 1]
├── Hero Situation
│   ├── Open presentation → [WORK w1 / Overview]
│   ├── Why ⇄ WhyInline
│   └── Details → <HOME SITUATION DRAWER>
├── Active work row → [WORK sélectionné / Overview]
├── Decision card → [DECISION PACKAGE d1]
└── NOVA background strip
    └── Details → <HOME SITUATION DRAWER>

[CLARIFY /clarify]
├── (Question 1) ⇄ Back → Home
│   └── Continue/Skip → (Question 2)
├── (Question 2) ⇄ Back → (Question 1)
│   └── Continue/Skip → (Question 3)
└── (Question 3) ⇄ Back → (Question 2)
    └── Continue/Skip → [CANVAS]

! Les flows décrivent 3 questions ; les données statiques en décrivent 4.

[CANVAS /canvas]
├── Edit carte ⇄ Save carte
├── Back → [CLARIFY]
└── Prepare a plan → [PLAN SETUP]

[PLAN SETUP /plan]
├── phase ⇄ état ouvert/replié
├── Back → [CANVAS]
└── Review and start → [CONFIRM]

[CONFIRM /confirm]
├── A0/A1/A2/A3 ⇄ sélection d'autonomie
├── Back → [PLAN SETUP]
└── Start work → [WORK / Overview]
```

## 5. Vue détaillée — Work

```text
[WORK /work/:id]
├── Breadcrumb « Work » → [HOME]  ! libellé contre-intuitif mais documenté
├── Header persistant
│   ├── ConfChip ⇄ popover
│   ├── Pause ?
│   └── More (…) ?
├── Onglets persistants
│   ├── [OVERVIEW]
│   ├── [PLAN]
│   ├── [ACTIVITY]
│   ├── [PEOPLE]
│   ├── [SOURCES]
│   ├── [DECISIONS]
│   └── [DELIVERABLES]
└── contexte conservé : activeWork
```

### 5.1 Overview

```text
[WORK / OVERVIEW]
├── Hero situation
├── Next Best Action
│   ├── Open ?
│   └── Why ⇄ expansion
├── Later & Background ⇄ disclosure
├── Pending decision card → [DECISION PACKAGE]
└── Sidebar Progress
    └── Full analysis → <WORK FULL ANALYSIS DRAWER>
```

### 5.2 Plan et Activity

```text
[WORK / PLAN]
└── phases partagées avec Plan Setup
    ! lecture seule selon Interaction Specs ; état accordion divergent

[WORK / ACTIVITY]
├── All ⇄ liste mixte
├── Human ⇄ événements humains
├── AI ⇄ événements NOVA
├── Critical ⇄ événements critiques
├── Sources ⇄ événements liés aux sources
└── Post comment ?
```

### 5.3 People, Sources, Decisions, Deliverables

```text
[WORK / PEOPLE]
├── Invite ?
└── Person card / Details → <PERSON DETAIL DRAWER>

[WORK / SOURCES]
├── Add ?
├── Refresh ?
└── Source card / Details → <SOURCE DETAIL DRAWER>

[WORK / DECISIONS]
└── Decision card
    ├── Why ⇄ expansion
    └── Review & decide → [DECISION PACKAGE]

[WORK / DELIVERABLES]
├── Create ?
└── Deliverable card
    ├── Eye ?
    └── Details → <DELIVERABLE DETAIL DRAWER>
```

## 6. Vue détaillée — Vues globales

```text
[GLOBAL DECISIONS /decisions]
├── filtres locaux
│   ├── All
│   ├── Pending / Needs my decision !
│   ├── Waiting
│   └── Decided / History !
└── carte pending/waiting → [DECISION PACKAGE]
    carte decided : navigation non démontrée

[GLOBAL DELIVERABLES /deliverables]
├── All
├── Drafts
├── In review
├── Published
└── lignes/actions ?
```

Les captures `DELIVBERABLES` valident l'onglet Work Deliverables, pas une vue globale certaine.

## 7. Vue détaillée — Parcours de décision

```text
Entrées convergentes
├── Home / Decision card
├── Work Overview / Pending decision
├── Work Decisions / Review & decide
├── Global Decisions / pending ou waiting
└── Search / Decision result
         ↓ activeDecision
[DECISION PACKAGE /decisions/:id]
├── Back to work → [WORK]
│   ! retour d'origine Home/Global/Search non conservé dans les sources
├── ConfChip ⇄ popover
├── Why ⇄ expansion
├── option ⇄ sélection locale non requise pour poursuivre
├── Full package → <FULL PACKAGE DRAWER>
└── Review and decide → [PAUSE / REVIEW]
                           ├── Cancel/Back → [DECISION PACKAGE]
                           └── Continue → [PAUSE / DECIDE]
                                              ├── Back → [PAUSE / REVIEW]
                                              ├── choix ⇄ état local
                                              ├── rationale ⇄ état local
                                              └── Record si choix+rationale
                                                     ↓ ~700 ms documentés
                                                [DECISION RECEIPT]
                                                ├── Return to work → [WORK]
                                                ├── Share receipt ?
                                                └── Export ?
```

## 8. Vue détaillée — Overlays et drawers

```text
{SEARCH OVERLAY}
├── parent : shell global / vue courante conservée
├── query < 2 → récents
├── query ≥ 2 → Work + Decisions
├── Work result → [WORK] + fermeture
├── Decision result → [DECISION PACKAGE] + fermeture
└── Escape/backdrop → fermeture + restitution vue courante

<DRAWER GÉNÉRIQUE>
├── Backdrop
├── Panel droit
│   ├── Header + X
│   └── Body scrollable + sections
├── X/backdrop → fermeture
├── Escape/focus return ?
└── un seul niveau démontré ; aucun drawer imbriqué
```

```text
Home ───────────────→ <Situation Details>
Work Overview ──────→ <Full Analysis>
Work People ────────→ <Person Detail>
Work Sources ───────→ <Source Detail>
Work Deliverables ──→ <Deliverable Detail>
Decision Package ───→ <Full Package>
```

## 9. Retours et sorties

```text
Work Setup : Back remonte d'une étape ; Clarify 1 revient Home
Drawer     : X/backdrop restitue le parent
Search     : Escape/backdrop restitue le parent
Decision   : Decide Back → Review ; Review Cancel/Back → Package
Receipt    : Return to work → Work
App        : logout/sortie/session ?
```

## 10. Relations explicitement absentes ou non déterminées

- Aucun sous-menu en cascade démontré.
- Aucun drawer ouvrant un drawer démontré.
- Aucune modale métier autre que Search Overlay démontrée.
- Aucun écran de liste Work démontré.
- Aucun résultat Search People/Source/Deliverable démontré.
- Aucun contrat de deep link, historique navigateur ou URL d'onglet démontré.
- Les trente entrées `A01–A30` de la Constitution restent applicables sans modification.

## 11. Sources

Cette carte dérive principalement de la Constitution §§2–11, de `D01` Screen Inventory, `D02` User Flow, `D03` Information Architecture, `D10` Drawer Specifications, `D11` Interaction Specifications, `D12` Responsive Specifications, `D16` React Component Tree, `D18` Implementation Guide, `D20` Implementation Matrix, et des captures `U01–U23` enregistrées dans [NOVA_INFORMATION_TRACEABILITY.md](./NOVA_INFORMATION_TRACEABILITY.md).
