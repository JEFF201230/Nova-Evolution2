# 06 — CARTE DES OVERLAYS
## NOVA V7 — Reconstruction à partir des maquettes existantes

> Règle : Aucune invention. Toute relation incertaine est marquée ⚠ À confirmer.
> Source de vérité : `/workspaces/default/code/src/app/App.tsx`

---

## PRÉSENTATION

NOVA V7 contient **3 types d'overlays** :

| # | Nom | Type | Portée |
|---|---|---|---|
| 1 | SearchOverlay | Modal plein écran (fixed, z:100) | Global — tout écran |
| 2 | ConfChip popover | Popover positionné (absolute) | Local — intérieur d'un composant |
| 3 | WhyInline | Expansion inline (non flottante) | Local — intérieur d'un composant |

---

## OVERLAY 1 — SearchOverlay

### Propriétés visuelles

| Propriété | Valeur |
|---|---|
| Position | `fixed`, inset 0 (couvre tout le viewport) |
| z-index | 100 |
| Backdrop | `rgba(15,23,42,.35)` + `backdropFilter: blur(3px)` |
| Panel width | 520px max |
| Panel position | `alignItems: flex-start`, padding-top 72px |
| Panel background | `#FFFFFF` |
| Panel border-radius | 13px |
| Panel shadow | `SH.overlay` = `0 20px 48px rgba(15,23,42,.16), 0 4px 8px rgba(15,23,42,.08)` |
| Panel border | `1px solid #E2E8F0` |

### Déclencheurs d'ouverture

| Source | Mécanisme |
|---|---|
| NavRail — Search icon | `setSearchOpen(true)` |
| Clavier — Cmd+K / Ctrl+K | handler global `window.addEventListener("keydown", ...)` |

### Comportement

**Contenu par défaut (query vide ou < 2 chars) :**
```
3 résultats récents hardcodés :
  1. "Q3 budget review presentation" — 76% · Due 18 Jul → work (w1)
  2. "Approve €420k infrastructure" — 82% · Due 15 Jul → decision-package (d1)
  3. "Customer churn analysis" — 41% · Due 22 Jul → work (w2)
```

**Contenu avec query (>= 2 chars) :**
```
Filtrage live sur :
  - WORK_ITEMS : work.outcome.toLowerCase().includes(q)
    → setActiveWork(id) + setView("work") + close
  - DECISIONS_DATA : decision.statement.toLowerCase().includes(q)
    → setActiveDecision(id) + setView("decision-package") + close
Si aucun résultat : "No results for '{q}'"
```

**Input :**
- Font : 14px Inter
- Autofocus via `useRef` + `useEffect`
- `onKeyDown: e.key === "Escape" → onClose()`

**Fermeture :**
- Clic backdrop (`e.target === e.currentTarget`)
- Escape (input keydown)
- Escape global (`window.addEventListener("keydown"`) → `setSearchOpen(false)`
- Clic sur un résultat

### Structure HTML

```
div [fixed backdrop, onClick=close si clic direct]
└── div [panel 520px]
    ├── div [header — Search icon + input + kbd Esc]
    └── div [résultats, max-height 360px, overflowY auto]
        └── button × N [chaque résultat]
            ├── span [label — 13px N.text]
            └── span [sub — 11px N.textDis]
```

---

## OVERLAY 2 — ConfChip Popover

### Nature

Le ConfChip popover n'est pas un modal global. C'est un élément `absolute` positionné à l'intérieur du composant `ConfChip`, rendu dans le flux DOM normal.

⚠ À confirmer : le popover peut être tronqué par un overflow:hidden parent selon le contexte.

### Propriétés visuelles

| Propriété | Valeur |
|---|---|
| Position | `absolute`, top: `calc(100% + 8px)`, left: 0 |
| z-index | 30 |
| Width | min-width 240px, max-width 300px, width "max-content" |
| Background | `#FFFFFF` |
| Border-radius | 12px |
| Shadow | `SH.overlay` = `0 20px 48px rgba(15,23,42,.16)` |
| Border | `1px solid #E2E8F0` |
| Padding | 14px |

### Déclencheurs

| Source | Mécanisme |
|---|---|
| Clic sur ConfChip button | `setOpen(!open)` (toggle) |

### Contenu du popover

```
[En-tête]
  "{pct}% confidence" (MONO, coloré selon confColor())

[Delta row — si afterAction présent]
  "After your next action → {afterAction}%" (MONO)
  Background innoBg (#F5F3FF), Sparkles icon

[Reasons — si reasons[].length > 0]
  Label "What's holding it back"
  Liste : AlertTriangle icon + chaque reason (13px N.textSec)

[Positive — si positive[].length > 0]
  Label "Confidence factors"
  Liste : CheckCircle icon + chaque positive (13px N.success)

[Missing — si missing non vide]
  Label "Missing"
  Texte : missing (13px N.warn)

[Bouton fermer]
  X icon (12px, N.textDis) — "setOpen(false)"
```

### Fermeture

| Mécanisme | Présent dans le code |
|---|---|
| Bouton X intérieur | ✅ Oui |
| Clic extérieur (outside click) | ❌ Non — aucun handler outside-click |
| Escape | ❌ Non |

⚠ À confirmer : le popover ne se ferme **pas** au clic extérieur selon le code existant.

### Instances actives

Le ConfChip apparaît sur les écrans suivants et peut donc ouvrir son popover :

| Écran | Contexte |
|---|---|
| `confirm` | Hero section |
| `work:overview` | Focal card / sidebar |
| `work:decisions` | Carte décision |
| `work:deliverables` | Carte livrable |
| `decision-package` | Hero block |
| `global-decisions` | Carte décision |
| `global-deliverables` | Ligne livrable |

---

## OVERLAY 3 — WhyInline

### Nature

WhyInline n'est pas un overlay flottant. C'est un bloc qui s'expanse **inline** dans le flux du document.

### Propriétés visuelles (état fermé)

| Propriété | Valeur |
|---|---|
| Apparence | Bouton texte "Why" + ChevronDown |
| Background | transparent |
| Font | 12px N.textSec |
| Icon | ChevronDown (rotate 180° si open) |

### Propriétés visuelles (état ouvert)

| Propriété | Valeur |
|---|---|
| Conteneur | `marginTop: 8px`, `padding: 11px 14px` |
| Background | `N.innoBg` (#F5F3FF) |
| Border-radius | 9px |
| Border | `1px solid N.innoBrd` (#DDD6FE) |
| Contenu | texte children (13px N.inno, lineHeight 1.6) |

### Déclencheurs

| Source | Mécanisme |
|---|---|
| Clic sur le bouton "Why" | `setOpen(!open)` (toggle) |

### Fermeture

| Mécanisme | Présent |
|---|---|
| Second clic sur "Why" | ✅ Oui (toggle) |
| Clic extérieur | ❌ Non |
| Escape | ❌ Non |

### Instances actives

| Écran | Contexte | Contenu |
|---|---|---|
| `home` | Section décision | `item.nextActionWhy` |
| `work:overview` | Focal card (Next Best Action) | `item.nextActionWhy` |
| `work:decisions` | Carte décision | `decision.rationale` |
| `decision-package` | Hero block | `decision.rationale` + `decision.uncertainty` |

---

## COMPARATIF DES OVERLAYS

| Caractéristique | SearchOverlay | ConfChip popover | WhyInline |
|---|---|---|---|
| Type | Modal global | Popover absolu | Expansion inline |
| z-index | 100 | 30 | n/a (flux normal) |
| Backdrop | ✅ `rgba(35%)` blur | ❌ Non | ❌ Non |
| Fermeture backdrop | ✅ Oui | ❌ Non | ❌ Non |
| Fermeture Escape | ✅ Oui (input) | ❌ Non | ❌ Non |
| Fermeture outside-click | ✅ Oui (backdrop) | ❌ Non | ❌ Non |
| Fermeture bouton X | ❌ Non | ✅ Oui | ❌ Non |
| Fermeture toggle clic | ❌ Non | ✅ Oui | ✅ Oui |
| Accès global | ✅ Oui (Cmd+K) | ❌ Local | ❌ Local |
| Portée état | App root | ConfChip local | WhyInline local |
