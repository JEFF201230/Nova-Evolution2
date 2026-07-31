# DDEC-000 — Decisions Duplicates Analysis

## 1. Principe

Une homonymie n'est pas automatiquement un doublon. L'audit distingue :

- les vraies duplications de données métier fictives ;
- les projections d'une source ;
- les mécanismes distincts qui utilisent le mot Decision dans une autre
  frontière.

Aucun fichier n'est supprimé ou modifié par DDEC-000.

## 2. Doublons avérés

### DUP-DEC-001 — décision Work fictive

**Origine**

- `apps/nova-web/src/features/work/workDecisionsFixture.ts`
- `apps/nova-web/src/features/work/workOverviewFixture.ts`

**Responsabilité**

Alimenter Work Decisions et Work Overview avec une décision démonstrative.

**Différence métier**

La fixture Decisions ajoute recommandation et impacts. La vue Overview en
reprend une synthèse.

**Différence technique**

Deux structures locales indépendantes, sans contrat Runtime.

**Risque**

Les deux valeurs peuvent diverger et présentent une décision simulée comme un
fait métier.

**Décision**

`REMOVE` après raccordement vérifié. Ne pas fusionner ces champs dans le
Runtime : ils ne sont pas produits par `HumanApprovalDecision`.

### DUP-DEC-002 — déclinaison Global fictive

**Origine**

- `apps/nova-web/src/components/routes/globalRouteFixtures.ts`
- `apps/nova-web/src/features/work/workDecisionsFixture.ts`

**Responsabilité**

Construire une liste globale à partir de la fixture Work et de deux entrées
supplémentaires hardcodées.

**Différence métier**

Ajout des statuts `pending`, `waiting`, `decided`, d'une phrase héro et d'un
outcome.

**Différence technique**

Une entrée est dérivée de Work ; deux entrées n'ont aucune source amont.

**Risque**

La vue globale paraît agrégée alors qu'elle combine copie et invention.

**Décision**

`REMOVE` après remplacement. Une future projection globale devra consommer la
source canonique sans créer de statut non soutenu.

### DUP-DEC-003 — carte HOME fictive

**Origine**

- `apps/nova-web/src/features/home/homeFixture.ts`
- `apps/nova-web/src/features/work/workDecisionsFixture.ts`

**Responsabilité**

Afficher une décision en attente sur HOME.

**Différence métier**

HOME ajoute une conséquence et transforme la confiance en libellé.

**Différence technique**

Copie hardcodée sans import ni identité partagée.

**Risque**

Drift silencieux entre HOME et Work ; faux statut de décision en attente.

**Décision**

`REMOVE` après remplacement vérifié. `PendingDecisionCard` reste conservé
comme projection.

### DUP-DEC-004 — décision Overview fictive

**Origine**

- `apps/nova-web/src/features/work/workOverviewFixture.ts`
- `apps/nova-web/src/features/work/workDecisionsFixture.ts`

**Responsabilité**

Afficher dans Overview une décision proche de celle de la page dédiée.

**Différence métier**

Overview conserve seulement échéance, confiance, titre et conséquence.

**Différence technique**

Structure locale autonome et non synchronisée.

**Risque**

Une même décision peut avoir des échéances, scores ou textes différents selon
l'écran.

**Décision**

`REMOVE` après remplacement vérifié. Le composant composite devra rester un
consommateur.

## 3. Homonymies non doublons

### Human Approval et certification technique

`HumanApprovalDecision` est un choix humain. La décision
`TechnicalCertificationDecision` est un résultat automatique d'intégrité.

**Verdict : NOT_DUPLICATE — KEEP les deux.**

### Human Approval et certificat Runtime

Le certificat Runtime atteste un report et ne possède qu'une valeur
`CERTIFIED`. Human Approval offre quatre issues et commande des transitions
différentes.

**Verdict : NOT_DUPLICATE — KEEP les deux.**

### Human Approval et Governance Decision

Governance porte des sujets Program (`program-lifecycle`,
`campaign-governance`, etc.) et des références documentaires. Human Approval
porte Mission, Run, identité et empreinte des preuves.

**Verdict : NOT_DUPLICATE — KEEP les deux.**

### Human Approval et Governance Approval

Les valeurs se ressemblent, mais les sujets, autorités, persistance et cycles
de vie diffèrent. Governance Approval ne persiste pas dans le repository
Runtime.

**Verdict : NOT_DUPLICATE — KEEP les deux.**

### Kernel decisions et Work Decisions

Les modules kernel valident des flows techniques internes et n'exposent pas
d'agrégat métier Work.

**Verdict : NOT_DUPLICATE — KEEP comme primitives techniques isolées.**

### Événement `approvalDecision` et record `HUMAN_APPROVAL`

La valeur dans l'événement de transition est une projection de l'effet. Le
record contient l'acte complet.

**Verdict : PROJECTION — KEEP, sans promotion en source.**

## 4. Pourquoi aucun MERGE Runtime

Fusionner Human Approval, certification, Governance et gates produirait un type
Decision ambigu dont les autorités, valeurs, preuves et cycles de vie seraient
incompatibles.

La convergence correcte est une convergence de navigation et de lecture :

```text
source HumanApprovalDecision
  -> lecture interne Work Decisions
  -> projections UX
```

Elle n'est pas une fusion des moteurs existants.

## 5. Synthèse

| Groupe | Nombre | Décision |
|---|---:|---|
| doublons avérés | 4 | REMOVE après remplacement |
| projections Frontend | 4 | REFACTOR comme consommateurs |
| homonymies métier/techniques | 6 groupes | KEEP séparés |
| merge Runtime justifié | 0 | aucun |

Aucune suppression n'est effectuée dans ce lot.
