# 07 — CARTE DE RÉUTILISATION DES COMPOSANTS
## NOVA V7 — Reconstruction à partir des maquettes existantes

> Règle : Aucune invention. Toute relation incertaine est marquée ⚠ À confirmer.
> Source de vérité : `/workspaces/default/code/src/app/App.tsx`

Légende :
- `●` = présent et fonctionnel
- `○` = présent mais placeholder / no-op
- `—` = absent

---

## 1. COMPOSANTS PRIMITIFS

### NOVALabel

Badge violet "NOVA" avec icône Sparkles. Indique qu'une information est générée par l'IA.

| Écran | Instance | Contexte |
|---|---|---|
| `home` | ● | Hero block (confidence label) |
| `work:overview` | ● | Focal card (Next Best Action label) |
| `work:activity` | ● | Événements de type "ai" (avatar label) |
| `work:people` | ● | Carte NOVA (personne AI) |
| `decision-package` | ● | Option recommandée par NOVA |
| Tous les autres | — | — |

---

### ConfChip

Badge de confiance cliquable avec popover. Affiche le pourcentage, la couleur sémantique, et l'évolution possible.

| Écran | Instance | Contexte |
|---|---|---|
| `confirm` | ● | Hero — confidence du work item |
| `work:overview` | ● | Focal card + sidebar cards |
| `work:decisions` | ● | Carte décision |
| `work:deliverables` | ● | Carte livrable |
| `decision-package` | ● | Hero block |
| `global-decisions` | ● | Carte décision |
| `global-deliverables` | ● | Ligne livrable |
| Autres | — | — |

---

### DeadlineBadge

Badge de délai coloré. Affiche "Due in N days". Couleur sémantique : rouge (≤ 4j), amber (≤ 10j), neutre (> 10j).

| Écran | Instance | Contexte |
|---|---|---|
| `home` | ● | Section décision |
| `work:overview` | ● | Work item sidebar |
| `work:decisions` | ● | Carte décision |
| `decision-package` | ● | Hero block |
| `global-decisions` | ● | Carte décision |
| Autres | — | — |

---

### StatusDot

Cercle coloré 7px indiquant le statut health (active/attention/blocked/complete).

| Écran | Instance | Contexte |
|---|---|---|
| `work:people` | ● | Indicateur de disponibilité personne |
| Tous les autres | — | — |

⚠ À confirmer : StatusDot est défini mais sa présence sur d'autres écrans n'a pas été observée.

---

### Btn

Bouton avec 3 variantes (primary/secondary/quiet) et 3 tailles (sm/md/lg).

**Btn primary :**

| Écran | Instances |
|---|---|
| `home` | Composer submit, Decision "Review & decide" |
| `clarify` | "Next" |
| `canvas` | "Continue", "Save" (edit) |
| `plan` | "Confirm and start" |
| `confirm` | "Start work" |
| `work:overview` | "Open" (no-op) |
| `work:decisions` | "Review & decide" |
| `decision-package` | "Review and decide" (×2) |
| `decision-pause` | "I have reviewed", "Record" |
| `decision-receipt` | "Return to work" |
| `global-deliverables` | "Create" (no-op) |

**Btn secondary :**

| Écran | Instances |
|---|---|
| `home` | (aucune confirmée) |
| `clarify` | (optionnel) |
| `work:sources` | "Add", "Refresh", "Details" |
| `work:people` | "Details" |
| `work:deliverables` | "Details" |
| `decision-pause` | (aucune) |
| `decision-receipt` | "Share receipt" |

**Btn quiet :**

| Écran | Instances |
|---|---|
| `work:overview` | Actions contextuelles |
| `work:people` | — |
| `work:sources` | — |
| `work:deliverables` | Eye |
| `global-deliverables` | Eye |
| `decision-package` | — |

---

### Card

Conteneur avec bordure, ombre, hover state. Peut être cliquable (onClick prop).

| Écran | Instances |
|---|---|
| `home` | Work items, decision nudge |
| `work:overview` | Focal card (Next Best Action), sidebar cards |
| `work:decisions` | Cartes décision |
| `work:sources` | Cartes source |
| `work:people` | Cartes personne |
| `work:deliverables` | Cartes livrable |
| `decision-package` | Options (intégré dans bouton) |
| `decision-receipt` | Receipt card, Resulting actions card |
| `global-decisions` | Cartes décision |

---

### WhyInline

Bouton inline "Why" avec expansion violet.

| Écran | Contexte |
|---|---|
| `home` | Section décision — `nextActionWhy` |
| `work:overview` | Focal card — `nextActionWhy` |
| `work:decisions` | Carte décision — `rationale` |
| `decision-package` | Hero — `rationale` + `uncertainty` |

---

### Drawer + DrawerSection + DrawerRow

Panneau latéral droit 460px. DrawerSection = bloc avec label en majuscule. DrawerRow = paire label/valeur.

| Écran | Drawer ouvert |
|---|---|
| `home` | Work detail (detailOpen) |
| `work:overview` | Full analysis (detailOpen) |
| `work:people` | Person (drawer state) |
| `work:sources` | Source (drawer state) |
| `work:deliverables` | Deliverable (drawer state) |
| `decision-package` | Decision package (detailOpen) |

---

## 2. COMPOSANTS DE NAVIGATION

### NavRail

Panneau de navigation latéral gauche fixe (220px).

| Présent sur | Absent sur |
|---|---|
| `home`, `clarify`, `canvas`, `plan`, `confirm` | `decision-pause` |
| `work`, `global-decisions`, `global-deliverables` | `decision-receipt` |
| `decision-package` | |

---

### SearchOverlay

Modal de recherche globale.

| Présent sur | Modalité |
|---|---|
| Tous les écrans | Déclenché par Cmd+K ou NavRail Search icon |

---

## 3. COMPOSANTS DE CONTENU

### WorkView (shell)

Conteneur avec breadcrumb sticky, header, tab strip, contenu tab.

| Présent sur | Absent sur |
|---|---|
| `work` uniquement | Tous les autres |

Les 7 composants tab (`WorkOverviewTab`, `WorkPlanTab`, etc.) sont internes à `WorkView`.

---

### Accordéon de phases

Pattern identique utilisé dans deux composants :

| Composant | Écran |
|---|---|
| `PlanView` | `plan` |
| `WorkPlanTab` | `work:plan` |

---

### Filter pills / tabs

| Composant | Écran | Options |
|---|---|---|
| WorkActivityTab | `work:activity` | all / human / ai / critical / sources |
| GlobalDecisionsView | `global-decisions` | all / pending / waiting / decided |
| GlobalDeliverablesView | `global-deliverables` | all / draft / review / published |

---

## 4. MATRICE COMPLÈTE COMPOSANT × ÉCRAN

```
Composant           home  cla  can  pla  con  wk-ov  wk-pl  wk-ac  wk-pe  wk-so  wk-de  wk-dl  dec-pk  dec-pa  dec-rc  g-dec  g-del
NOVALabel            ●    —    —    —    —     ●      —      ●      ●      —      —      —      ●       —       —       —      —
ConfChip             —    —    —    —    ●     ●      —      —      —      —      ●      ●      ●       —       —       ●      ●
DeadlineBadge        ●    —    —    —    —     ●      —      —      —      —      ●      —      ●       —       —       ●      —
StatusDot            —    —    —    —    —     —      —      —      ●      —      —      —      —       —       —       —      —
Btn (primary)        ●    ●    ●    ●    ●     ○      —      —      —      —      ●      —      ●       ●       ●       —      ○
Btn (secondary)      ●    ●    —    —    —     —      —      —      —      ●      —      ●      —       ●       ●       —      —
Btn (quiet)          —    ●    —    —    —     ○      —      —      ●      ●      —      ●      ●       —       —       —      ●
Card                 ●    —    —    —    —     ●      —      —      ●      ●      ●      ●      —       —       ●       ●      —
WhyInline            ●    —    —    —    —     ●      —      —      —      —      ●      —      ●       —       —       —      —
Drawer               ●    —    —    —    —     ●      —      —      ●      ●      —      ●      ●       —       —       —      —
DrawerSection        ●    —    —    —    —     ●      —      —      ●      ●      —      ●      ●       —       —       —      —
DrawerRow            ●    —    —    —    —     ●      —      —      ●      ●      —      ●      ●       —       —       —      —
NavRail              ●    ●    ●    ●    ●     ●      ●      ●      ●      ●      ●      ●      ●       —       —       ●      ●
SearchOverlay        ○    ○    ○    ○    ○     ○      ○      ○      ○      ○      ○      ○      ○       ○       ○       ○      ○
```

`wk-*` = onglets de work | `dec-pk` = decision-package | `dec-pa` = decision-pause | `dec-rc` = decision-receipt | `g-dec` = global-decisions | `g-del` = global-deliverables

---

## 5. COMPOSANTS À USAGE UNIQUE

Ces composants n'apparaissent que dans un seul écran :

| Composant | Écran unique |
|---|---|
| ClarifyProgress dots | `clarify` |
| Autonomy radio | `confirm` |
| WorkBreadcrumb | `work` |
| Tab strip Work | `work` |
| Step indicator | `decision-pause` |
| Receipt reference code | `decision-receipt` |
| Resulting actions list | `decision-receipt` |
| Source counter strip | `work:sources` |
| NOVA reasoning box | `work:people` |
| Activity timeline | `work:activity` |
| Progress bar (readiness) | `work:deliverables` |
