# 01 — ARCHITECTURE GLOBALE
## NOVA V7 — Reconstruction à partir des maquettes existantes

> Règle : Aucune invention. Toute relation incertaine est marquée ⚠ À confirmer.
> Source de vérité : `/workspaces/default/code/src/app/App.tsx`

---

## 1. STRUCTURE GÉNÉRALE

NOVA V7 est une **Single Page Application** (React 18). Il n'existe aucun routage URL. Toute navigation est pilotée par l'état React (`useState<View>`).

L'application est composée de **deux zones visuelles permanentes** :
- **NavRail** (220px, gauche) — présent sur 9 des 11 vues
- **Zone principale** (flex:1) — affiche la vue active

---

## 2. INVENTAIRE DES VUES

### 2.1 Vues avec NavRail (9 vues)

| ID de vue | Nom affiché | Composant React | Scroll |
|---|---|---|---|
| `home` | Accueil | `HomeView` | Oui |
| `clarify` | Clarification | `ClarifyView` | Oui |
| `canvas` | Canvas | `CanvasView` | Oui |
| `plan` | Plan | `PlanView` | Oui |
| `confirm` | Confirmer | `ConfirmView` | Oui |
| `work` | Travail actif | `WorkView` | Non (scroll interne par tab) |
| `global-decisions` | Décisions | `GlobalDecisionsView` | Oui |
| `global-deliverables` | Livrables | `GlobalDeliverablesView` | Oui |
| `decision-package` | Dossier décision | `DecisionPackageView` | Oui |

### 2.2 Vues plein écran sans NavRail (2 vues)

| ID de vue | Nom affiché | Composant React | Raison de l'absence du NavRail |
|---|---|---|---|
| `decision-pause` | Décision — Enregistrement | `DecisionPauseView` | Flux de décision formel — isolation intentionnelle |
| `decision-receipt` | Décision — Reçu | `DecisionReceiptView` | Confirmation finale — isolation intentionnelle |

**Logique d'exclusion du NavRail :**
```typescript
const fullscreen = view==="decision-pause" || view==="decision-receipt";
// NavRail: {!fullscreen && <NavRail ... />}
```

---

## 3. SOUS-VUES : WORK TABS

La vue `work` contient **7 onglets internes** (sous-vues). Chaque onglet est un composant React distinct rendu à l'intérieur de `WorkView`.

| ID onglet | Composant | Titre affiché |
|---|---|---|
| `overview` | `WorkOverviewTab` | Overview |
| `plan` | `WorkPlanTab` | Plan |
| `activity` | `WorkActivityTab` | Activity |
| `people` | `WorkPeopleTab` | People |
| `sources` | `WorkSourcesTab` | Sources |
| `decisions` | `WorkDecisionsTab` | Decisions |
| `deliverables` | `WorkDeliverablesTab` | Deliverables |

L'onglet `overview` est actif par défaut à l'ouverture de la vue `work`.

---

## 4. DONNÉES STATIQUES

Toutes les données sont déclarées à portée de module (static) dans App.tsx. Aucun appel API.

### 4.1 Éléments de travail (WORK_ITEMS) — 3 items

| ID | Titre court | Health | Confiance | Deadline |
|---|---|---|---|---|
| `w1` | Prepare Q3 budget review presentation | `attention` | 76% → 92% | 18 Jul |
| `w2` | Analyze reasons for customer churn increase | `active` | 41% → 68% | 22 Jul |
| `w3` | Onboard new supply chain partner | `blocked` | 22% → 45% | 31 Jul |

### 4.2 Décisions (DECISIONS_DATA) — 3 décisions

| ID | Statut | Délai | Confiance |
|---|---|---|---|
| `d1` | `pending` | 4 jours | 82% |
| `d2` | `waiting` | 11 jours | 0% (pas de données) |
| `d3` | `decided` | -11 jours (passé) | 91% |

### 4.3 Autres données

| Ensemble | Taille |
|---|---|
| `ACTIVITY_FEED` | 8 événements |
| `PEOPLE_DATA` | 4 personnes (1 IA + 3 humains) |
| `SOURCES_DATA` | 4 sources |
| `DELIVERABLES_DATA` | 2 livrables (+ 1 dans GlobalDeliverablesView) |

---

## 5. ÉTAT GLOBAL (App root)

```typescript
const [view, setView]                 = useState<View>("home");
const [activeWork, setActiveWork]     = useState("w1");
const [activeDecision, setActiveDecision] = useState("d1");
const [searchOpen, setSearchOpen]     = useState(false);
```

- `view` : contrôle le rendu de la zone principale
- `activeWork` : détermine quel work item est chargé dans WorkView et DecisionPackageView
- `activeDecision` : détermine quelle décision est chargée dans les vues décision
- `searchOpen` : contrôle la visibilité de la SearchOverlay

---

## 6. TYPE VIEW (définition complète)

```typescript
type View =
  | "home"
  | "clarify"
  | "canvas"
  | "plan"
  | "confirm"
  | "work"
  | "global-decisions"
  | "global-deliverables"
  | "decision-package"
  | "decision-pause"
  | "decision-receipt";
```

---

## 7. STRUCTURE RACINE (App)

```
App
├── NavRail [absent si fullscreen]
│   ├── Logo
│   ├── NavItem: Home → view="home"
│   ├── NavItem: Work → view="work"
│   ├── NavItem: Decisions → view="global-decisions"
│   ├── NavItem: Deliverables → view="global-deliverables"
│   ├── NavItem: Search → searchOpen=true
│   ├── NavItem: Bell [no-op]
│   ├── NavItem: Help [no-op]
│   ├── NavItem: Settings [no-op]
│   └── UserRow [no-op]
├── Main
│   ├── HomeView [view="home"]
│   ├── ClarifyView [view="clarify"]
│   ├── CanvasView [view="canvas"]
│   ├── PlanView [view="plan"]
│   ├── ConfirmView [view="confirm"]
│   ├── WorkView [view="work"]
│   │   ├── Breadcrumb (sticky)
│   │   ├── WorkHeader
│   │   ├── TabStrip (7 onglets)
│   │   └── TabContent
│   │       ├── WorkOverviewTab [tab="overview"]
│   │       ├── WorkPlanTab [tab="plan"]
│   │       ├── WorkActivityTab [tab="activity"]
│   │       ├── WorkPeopleTab [tab="people"]
│   │       ├── WorkSourcesTab [tab="sources"]
│   │       ├── WorkDecisionsTab [tab="decisions"]
│   │       └── WorkDeliverablesTab [tab="deliverables"]
│   ├── GlobalDecisionsView [view="global-decisions"]
│   ├── GlobalDeliverablesView [view="global-deliverables"]
│   ├── DecisionPackageView [view="decision-package"]
│   ├── DecisionPauseView [view="decision-pause"] — fullscreen
│   └── DecisionReceiptView [view="decision-receipt"] — fullscreen
└── SearchOverlay [searchOpen=true]
```

---

## 8. GROUPES FONCTIONNELS

### Flux de création de travail (onboarding)
`home` → `clarify` → `canvas` → `plan` → `confirm` → `work`

### Travail actif
`work` (7 tabs)

### Flux décision
`decision-package` → `decision-pause` → `decision-receipt` → `work`

### Vues globales
`global-decisions` · `global-deliverables`

### Accès rapide (global)
`SearchOverlay` (Cmd+K) — accessible depuis toutes les vues
