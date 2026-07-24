# 08 — GRAPHE DE DÉPENDANCES DES ÉCRANS
## NOVA V7 — Reconstruction à partir des maquettes existantes

> Règle : Aucune invention. Toute relation incertaine est marquée ⚠ À confirmer.
> Source de vérité : `/workspaces/default/code/src/app/App.tsx`

---

## 1. GRAPHE DIRIGÉ — TOUTES LES TRANSITIONS

Chaque flèche représente une transition `setView()` effective dans le code source.

```
home ──────────────────────────────────────────────► clarify
home ──────────────────────────────────────────────► work
home ──────────────────────────────────────────────► decision-package

clarify ───────────────────────────────────────────► canvas
clarify ───────────────────────────────────────────► home (Back)

canvas ─────────────────────────────────────────────► plan
canvas ─────────────────────────────────────────────► clarify  ⚠ À confirmer

plan ───────────────────────────────────────────────► confirm
plan ───────────────────────────────────────────────► canvas   ⚠ À confirmer

confirm ────────────────────────────────────────────► work
confirm ────────────────────────────────────────────► plan     ⚠ À confirmer

work ───────────────────────────────────────────────► home (Back)
work ───────────────────────────────────────────────► decision-package (via decisions tab)

global-decisions ───────────────────────────────────► decision-package

decision-package ───────────────────────────────────► work (Back)
decision-package ───────────────────────────────────► decision-pause

decision-pause ─────────────────────────────────────► decision-package (Back / Cancel)
decision-pause ─────────────────────────────────────► decision-receipt (Record)

decision-receipt ───────────────────────────────────► work (Return to work)

SearchOverlay ──────────────────────────────────────► work
SearchOverlay ──────────────────────────────────────► decision-package

NavRail ────────────────────────────────────────────► home
NavRail ────────────────────────────────────────────► work
NavRail ────────────────────────────────────────────► global-decisions
NavRail ────────────────────────────────────────────► global-deliverables
NavRail ────────────────────────────────────────────► SearchOverlay
```

---

## 2. MATRICE D'ADJACENCE

`→` = transition directe existante | `—` = pas de transition directe

|  | home | clarify | canvas | plan | confirm | work | g-dec | g-del | dec-pkg | dec-pause | dec-rcpt |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **home** | — | → | — | — | — | → | — | — | → | — | — |
| **clarify** | → | — | → | — | — | — | — | — | — | — | — |
| **canvas** | — | ⚠→ | — | → | — | — | — | — | — | — | — |
| **plan** | — | — | ⚠→ | — | → | — | — | — | — | — | — |
| **confirm** | — | — | — | ⚠→ | — | → | — | — | — | — | — |
| **work** | → | — | — | — | — | — | — | — | → | — | — |
| **g-dec** | — | — | — | — | — | — | — | — | → | — | — |
| **g-del** | — | — | — | — | — | — | — | — | — | — | — |
| **dec-pkg** | — | — | — | — | — | → | — | — | — | → | — |
| **dec-pause** | — | — | — | — | — | — | — | — | → | — | → |
| **dec-rcpt** | — | — | — | — | — | → | — | — | — | — | — |
| **NavRail** | → | → | → | → | → | → | → | → | → | — | — |
| **Search** | — | — | — | — | — | → | — | — | → | — | — |

`⚠→` = transition documentée comme ⚠ À confirmer

---

## 3. DEGRÉ D'ENTRÉE PAR ÉCRAN

Nombre de sources pouvant naviguer vers chaque écran (hors NavRail) :

| Écran | Entrantes | Sources |
|---|---|---|
| `home` | 2 | clarify (Back), work (Back) |
| `clarify` | 1 | home (Composer) |
| `canvas` | 1 | clarify (Next final) |
| `plan` | 1 | canvas (Continue) |
| `confirm` | 1 | plan (Confirm and start) |
| `work` | 5 | home (row), confirm (Start work), decision-receipt (Return), work:decisions (CTA), NavRail + Search |
| `global-decisions` | 1 | NavRail |
| `global-deliverables` | 1 | NavRail |
| `decision-package` | 4 | home, work:decisions, global-decisions, SearchOverlay |
| `decision-pause` | 1 | decision-package (Review and decide) |
| `decision-receipt` | 1 | decision-pause (Record) |

---

## 4. DEGRÉ DE SORTIE PAR ÉCRAN

Nombre de destinations possibles depuis chaque écran (hors NavRail) :

| Écran | Sortantes | Destinations |
|---|---|---|
| `home` | 3 | clarify, work, decision-package |
| `clarify` | 2 | canvas, home |
| `canvas` | 2 | plan, clarify ⚠ |
| `plan` | 2 | confirm, canvas ⚠ |
| `confirm` | 2 | work, plan ⚠ |
| `work` | 2 | home, decision-package |
| `global-decisions` | 1 | decision-package |
| `global-deliverables` | 0 | (aucune sortie active hors NavRail) |
| `decision-package` | 2 | work, decision-pause |
| `decision-pause` | 2 | decision-package, decision-receipt |
| `decision-receipt` | 1 | work |

---

## 5. CHEMINS CRITIQUES

### Chemin A — Création → Travail (7 écrans)
```
home → clarify → canvas → plan → confirm → work → [tabs]
```

### Chemin B — Décision complète (5 écrans)
```
[home|work|global-decisions] → decision-package → decision-pause → decision-receipt → work
```

### Chemin C — Accès rapide (2 écrans)
```
SearchOverlay → work
SearchOverlay → decision-package
```

---

## 6. ÉCRANS ISOLÉS (sans retour natif)

| Écran | Observation |
|---|---|
| `global-decisions` | Pas de CTA "retour" — NavRail uniquement |
| `global-deliverables` | Pas de CTA "retour" — NavRail uniquement — aucune sortie active |
| `decision-pause` | Retour uniquement vers `decision-package` ou progression vers `decision-receipt` |
| `decision-receipt` | Retour uniquement vers `work` |

---

## 7. CYCLES

**Cycle principal :**
```
home ←──────────────────── work
 └──────────────────────► work
```

**Cycle décision :**
```
decision-package ◄──────── decision-pause
      └──────────────────► decision-pause
```

**Pas de cycle entre :**
- Le flux d'onboarding (clarify/canvas/plan/confirm) — linéaire aller-retour seulement
- global-deliverables — nœud terminal

---

## 8. NŒUDS CENTRAUX (hubs)

Les écrans avec le plus grand nombre de connexions entrantes + sortantes :

| Écran | Entrant | Sortant | Total |
|---|---|---|---|
| `work` | 5 | 2 | 7 |
| `decision-package` | 4 | 2 | 6 |
| `home` | 2 | 3 | 5 |
| `decision-pause` | 1 | 2 | 3 |
