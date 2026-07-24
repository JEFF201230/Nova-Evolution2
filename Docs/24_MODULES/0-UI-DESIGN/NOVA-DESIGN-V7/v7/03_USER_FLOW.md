# 03 — PARCOURS UTILISATEUR
## NOVA V7 — Reconstruction à partir des maquettes existantes

> Règle : Aucune invention. Toute relation incertaine est marquée ⚠ À confirmer.
> Source de vérité : `/workspaces/default/code/src/app/App.tsx`

---

## FLUX A — Création d'un nouveau travail

**Déclencheur :** L'utilisateur formule une demande depuis la page d'accueil.

```
home
  │
  ├─ [Utilisateur saisit une demande dans le Composer]
  ├─ [OU : clique sur une suggestion pill → texte pré-rempli]
  │
  ▼
clarify
  │  L'utilisateur répond à N questions séquentielles
  │  Chaque "Next" avance d'une question
  │  La dernière question "Next" déclenche la navigation
  │
  ▼
canvas
  │  L'utilisateur visualise et édite le périmètre du travail
  │  Cartes éditables (Edit → Save)
  │  "Continue" déclenche la navigation
  │
  ▼
plan
  │  L'utilisateur visualise le plan en phases
  │  Accordéon de phases (expand/collapse)
  │  "Confirm and start" déclenche la navigation
  │
  ▼
confirm
  │  L'utilisateur choisit le niveau d'autonomie de NOVA (A0 → A3)
  │  Radio buttons — sélection obligatoire
  │  "Start work" déclenche la navigation
  │  → setActiveWork (nouveau work item)
  │
  ▼
work [tab: overview par défaut]
```

**Retours possibles dans ce flux :**
- `clarify` : "Back" → `home`
- `canvas` → `clarify` ⚠ À confirmer (pas de CTA back observé dans le code)
- `plan` → `canvas` ⚠ À confirmer (pas de CTA back observé dans le code)
- `confirm` → `plan` ⚠ À confirmer (pas de CTA back observé dans le code)

---

## FLUX B — Consultation d'un travail existant

**Déclencheur :** L'utilisateur accède à un work item déjà en cours.

**Entrée depuis l'accueil :**
```
home
  │
  ├─ [Clic sur work item row]
  │   → setActiveWork(id)
  │   → view="work"
  │
  ▼
work [tab: overview]
  │
  ├─ [Navigation entre onglets]
  │   overview / plan / activity / people / sources / decisions / deliverables
  │
  ├─ [Ouverture de drawers]
  │   WorkPeopleTab → "Details" → Person drawer
  │   WorkSourcesTab → "Details" → Source drawer
  │   WorkDeliverablesTab → "Details" → Deliverable drawer
  │   WorkOverviewTab → "Full analysis" → Full analysis drawer
  │
  └─ [Retour] "← Back" → view="home"
```

**Entrée depuis le NavRail :**
```
[tout écran]
  │
  ├─ [Clic NavItem Work]
  │   → view="work" (activeWork inchangé)
  │
  ▼
work [dernier onglet actif]
```

---

## FLUX C — Revue et enregistrement d'une décision

**Déclencheur :** L'utilisateur doit trancher une décision.

**Entrée depuis l'accueil :**
```
home
  │
  ├─ [Section décision — "Review & decide"]
  │   → setActiveDecision(id)
  │   → view="decision-package"
```

**Entrée depuis le travail :**
```
work [tab: decisions]
  │
  ├─ ["Review & decide" sur une décision]
  │   → setActiveDecision(id)
  │   → view="decision-package"
```

**Entrée depuis les décisions globales :**
```
global-decisions
  │
  ├─ [Clic carte (si status ≠ "decided")]
  │   → setActiveDecision(id)
  │   → view="decision-package"
```

**Flux principal de décision :**
```
decision-package
  │  L'utilisateur consulte :
  │  - Recommandation NOVA
  │  - Conséquences si approuvé / si rejeté
  │  - Options (A / B / C)
  │  - Dissent (si présent)
  │  - Drawer "Full package" (optionnel)
  │
  ├─ ["Review and decide"] ────────────────────────────────────►
  │                                                            │
  ▼                                                            │
  ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←

decision-pause [STEP 1 — Review]
  │  L'utilisateur relit les éléments clés :
  │  Decision / Recommended / If approved / If rejected / Uncertainty
  │
  ├─ ["I have reviewed — continue"] ─────────────────────────►
  │                                                            │
  ├─ ["Cancel"] → view="decision-package"                     │
  │                                                           │
  ▼                                                           │
  ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←

decision-pause [STEP 2 — Decide]
  │  L'utilisateur :
  │  1. Sélectionne un choix (Approve / Request changes / Reject / Defer)
  │  2. Saisit un rationale (champ obligatoire)
  │  "Record" activé uniquement si choice ET rationale non vides
  │
  ├─ ["← Back"] → step="review"
  ├─ ["Record — {choix}"] → 700ms loading → view="decision-receipt"
  │
  ▼

decision-receipt [FULLSCREEN]
  │  Reçu permanent affiché :
  │  - Référence DEC-2025-{id}-Q3
  │  - Outcome / Decision / Option / Authority / Timestamp
  │  - Actions résultantes (3 actions hardcodées)
  │
  ├─ ["Return to work"] → view="work"
  ├─ ["Share receipt"] → [no-op]
  └─ ["Export"] → [no-op]
```

---

## FLUX D — Navigation globale via NavRail

**Disponible depuis toutes les vues avec NavRail (9 vues sur 11).**

```
[tout écran avec NavRail]
  │
  ├─ Home icon ─────────────────────────────────────────► view="home"
  ├─ Briefcase icon ────────────────────────────────────► view="work" (activeWork inchangé)
  ├─ Scale icon ────────────────────────────────────────► view="global-decisions"
  ├─ FileText icon ─────────────────────────────────────► view="global-deliverables"
  └─ Search icon ───────────────────────────────────────► searchOpen=true (overlay)
```

**Non disponible depuis :** `decision-pause`, `decision-receipt` (pas de NavRail).

---

## FLUX E — Recherche globale

**Déclencheur :** Cmd+K (tout clavier) OU clic NavItem Search.

```
[tout écran]
  │
  ├─ [Cmd+K / Ctrl+K] ─────────────────────────────────► searchOpen=true
  │
  ▼

SearchOverlay [modal, z-index: 100]
  │  Affiche 3 récents par défaut
  │  Si query > 1 char → filtre WORK_ITEMS + DECISIONS_DATA
  │
  ├─ [Clic résultat work] → setActiveWork(id) + view="work" + close
  ├─ [Clic résultat décision] → setActiveDecision(id) + view="decision-package" + close
  ├─ [Escape] → close
  └─ [Clic backdrop] → close
```

---

## FLUX F — Consultation des décisions globales

```
global-decisions
  │  Filtres : All / Needs my decision / Waiting / History
  │
  ├─ [Clic carte — status ≠ "decided"] ────────────────► setActiveDecision + view="decision-package"
  └─ [Clic carte — status = "decided"] ────────────────► [aucune navigation — carte non cliquable]
```

---

## FLUX G — Consultation des livrables globaux

```
global-deliverables
  │  Filtres : All / Drafts / In review / Published
  │
  ├─ ["Create"] ────────────────────────────────────────► [no-op]
  ├─ Eye ───────────────────────────────────────────────► [no-op]
  └─ Download (published seulement) ───────────────────► [no-op]
```

⚠ À confirmer : aucune navigation sortante active depuis cet écran (hors NavRail).

---

## SYNTHÈSE DES FLUX

| Flux | Entrée | Sortie | Écrans traversés |
|---|---|---|---|
| A — Création | `home` (Composer) | `work` | home → clarify → canvas → plan → confirm → work |
| B — Travail existant | `home` (row) ou NavRail | `home` | home ↔ work |
| C — Décision | `home`, `work`, `global-decisions` | `work` | → decision-package → decision-pause → decision-receipt → work |
| D — NavRail | tout écran avec rail | variable | direct |
| E — Recherche | tout écran (Cmd+K) | `work` ou `decision-package` | overlay → écran cible |
| F — Décisions globales | `global-decisions` | `decision-package` | global-decisions → decision-package |
| G — Livrables globaux | `global-deliverables` | — | (aucune sortie active) |
