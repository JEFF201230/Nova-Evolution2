# NOVA Work Capability — Roadmap canonique

## 0. Objet

Cette roadmap ordonne la construction de la Capability Runtime Work définie par `NOVA_WORK_CAPABILITY_ARCHITECTURE.md`.

Elle n'autorise aucune implémentation, ne définit aucun endpoint et ne constitue pas un contrat exécutable. Chaque phase est un futur lot autonome. Aucun lot ne peut reconstruire un producteur déjà autoritatif dans un autre domaine.

## 1. Principes d'ordonnancement

1. Établir l'identité, le cycle de vie et la provenance avant toute association.
2. Réutiliser les producteurs existants avant de créer un producteur manquant.
3. Construire chaque domaine contributeur avant l'intelligence qui le consomme.
4. Ne jamais ouvrir une projection avant ses producteurs obligatoires.
5. Conserver les responsabilités métier dans leurs domaines propriétaires.
6. Autoriser un lot uniquement lorsque ses décisions normatives propres sont certifiées.

## 2. Plan incrémental officiel

| Ordre | Lot | Phase | Résultat métier | Dépendances d'entrée | Producteurs traités | Critère de sortie |
|---:|---|---|---|---|---|---|
| 1 | WCF-001 | Socle | Work identifiable, dans un état courant, progressé et sourcé | Missions et Monitoring existants | Identité PARTIAL, progression EXISTING, cycle Work MISSING | Identité stable, état unique, progression déterministe et provenance certifiés |
| 2 | WCF-002 | Livrables | Livrables rattachés au Work par références autoritatives | WCF-001, Deliverables/Missions | Livrables PARTIAL | Associations stables et richesse minimale autoritative disponibles |
| 3 | WCF-003 | Planning | Situation de planification du Work disponible | WCF-001, Planning | Planification MISSING | Plan, phases, échéance et dépendances sourcés |
| 4 | WCF-004 | Sources et preuves | Sources et preuves rattachées sans duplication | WCF-001, Evidence | Sources/preuves PARTIAL | Associations traçables vers les preuves autoritatives |
| 5 | WCF-005 | Décisions | Décisions rattachées et principale explicitement désignée | WCF-001, Decisions | Décisions MISSING | Associations et éventuelle principale certifiées |
| 6 | WCF-006 | People | Responsable et participants rattachés | WCF-001, People | People MISSING | Identités, rôles et disponibilités sourcés |
| 7 | WCF-007 | Actions | Actions Work maintenues sans priorisation implicite | WCF-001, WCF-003, WCF-005 | Actions MISSING | Actions courantes, différées et d'arrière-plan traçables |
| 8 | WCF-008 | Intelligence | Confiance, insight, recommandation, priorité et synthèse sourcés | WCF-002 à WCF-007 | Confiance, intelligence et synthèse MISSING | Résultats déterministes, provenance et indisponibilité explicite certifiés |

Les lots de projection, de transport et de raccordement UI sont postérieurs et extérieurs à cette roadmap métier. Après WCF-008, SW-013 peut être réévaluée sans modifier l'architecture de la Capability Work.

## 3. Lots détaillés

### 3.1 WCF-001 — Work Core Foundation

Responsabilités :

- établir l'identité Work et son rattachement projet/Mission ;
- établir le producteur de cycle de vie Work ;
- intégrer la progression autoritative existante ;
- conserver date et provenance ;
- appliquer les invariants du socle.

Prérequis :

- identité Mission disponible ;
- progression Monitoring/Missions disponible ;
- vocabulaire de cycle de vie Work certifié par une décision métier du lot.

Exclusions :

- plan ;
- actions ;
- décisions ;
- People ;
- livrables enrichis ;
- intelligence ;
- projection et transport.

Ce lot est le MVP Runtime minimal.

### 3.2 WCF-002 — Work Deliverable Foundation

Responsabilités :

- transformer les livrables partiels existants en références Work stables ;
- conserver l'autorité du domaine Deliverables/Missions ;
- qualifier explicitement toute information de livrable indisponible.

Ce lot ne produit pas le contenu des livrables et ne calcule pas leur confiance.

### 3.3 WCF-003 — Work Planning

Responsabilités :

- rattacher un plan autoritatif au Work ;
- rendre disponibles phase, total, échéance et dépendances ;
- préserver la distinction entre phase métier et phase technique de Runtime.

Ce lot ne planifie pas l'exécution technique.

### 3.4 WCF-004 — Work Sources and Evidence

Responsabilités :

- rattacher les sources et preuves au Work ;
- préserver identité, provenance et statut de certification ;
- empêcher toute copie faisant de Work la source autoritative d'une preuve.

### 3.5 WCF-005 — Work Decisions

Responsabilités :

- rattacher des décisions autoritatives ;
- accepter au plus une désignation explicite de décision principale ;
- distinguer collection vide, absence de principale et producteur indisponible.

Ce lot ne prend ni n'approuve aucune décision.

### 3.6 WCF-006 — Work People

Responsabilités :

- rattacher responsable et participants ;
- conserver les identités, rôles et disponibilités fournis par People ;
- empêcher l'assimilation automatique d'un agent technique au responsable métier.

### 3.7 WCF-007 — Work Actions

Responsabilités :

- maintenir les actions rattachées ;
- distinguer actions courantes, différées et d'arrière-plan ;
- préserver l'origine de chaque action.

Ce lot ne sélectionne pas implicitement la prochaine meilleure action. Cette sélection appartient à Intelligence.

### 3.8 WCF-008 — Work Intelligence

Responsabilités :

- fournir à Intelligence un état Work consolidé et autorisé ;
- accepter confiance, insight, recommandation, action priorisée et synthèse ;
- conserver faits d'entrée, date et provenance ;
- rendre l'indisponibilité d'un producteur distincte d'une sortie optionnelle absente.

Ce lot ne définit pas les algorithmes d'Intelligence.

## 4. Dépendances entre phases

```text
WCF-001 Work Core Foundation
├── WCF-002 Deliverables
├── WCF-003 Planning ──┐
├── WCF-004 Evidence ──┤
├── WCF-005 Decisions ─┼── WCF-007 Actions ──┐
└── WCF-006 People ────┘                     │
                                             ├── WCF-008 Intelligence
WCF-002 Deliverables ────────────────────────┤
WCF-004 Evidence ────────────────────────────┘
```

Le graphe est acyclique :

- tous les lots dépendent du socle ;
- Actions dépend de Planning et Decisions ;
- Intelligence dépend des familles qui alimentent ses résultats ;
- aucun producteur amont ne dépend d'une projection ou d'Intelligence pour exister.

## 5. Ouverture des lots

Un lot peut être ouvert uniquement si :

- son domaine propriétaire est confirmé ;
- ses sources autoritatives sont identifiées ;
- ses décisions métier propres sont certifiées ;
- ses dépendances précédentes sont disponibles ou explicitement non requises ;
- aucune projection, interface ou fixture n'est utilisée comme autorité ;
- son périmètre ne modifie pas un autre domaine par effet de bord.

Un lot est fermé uniquement si :

- le producteur attendu est disponible ;
- ses données ont une provenance ;
- les invariants applicables sont démontrés ;
- l'indisponibilité est représentée sans donnée de remplacement ;
- aucune responsabilité d'un domaine contributeur n'a été déplacée dans Work.

## 6. MVP et capacité à alimenter les consommateurs

| Niveau | Lots disponibles | Usage métier garanti | Work Overview |
|---|---|---|---|
| MVP minimal | WCF-001 | Identité, cycle Work, progression, provenance | Non alimentable intégralement |
| Fondation étendue | WCF-001 à WCF-004 | Socle, livrables, plan, preuves | Encore partiel |
| Collaboration | WCF-001 à WCF-007 | Ajout décisions, People et actions | Encore sans intelligence |
| Capability cible | WCF-001 à WCF-008 | État Work complet et intelligence sourcée | Producteurs métier disponibles pour une projection dédiée |

Le MVP minimal est volontairement plus petit que la projection Work Overview. Il est néanmoins viable en production comme fondation métier autonome. Il ne doit jamais annoncer la complétude de Work Overview.

## 7. Décision

**Premier lot : WCF-001 — Work Core Foundation.**

Il est le plus petit incrément viable parce qu'il réutilise deux producteurs existants, n'a aucune dépendance envers les producteurs futurs et établit l'identité, l'état et la provenance indispensables à tous les lots suivants.

**Verdict de roadmap : GO.**
