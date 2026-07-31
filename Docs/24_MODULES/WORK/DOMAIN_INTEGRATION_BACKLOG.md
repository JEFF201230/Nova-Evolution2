# DOMAIN-AUDIT-002 — Domain Integration Backlog

## 1. Règle d'ordonnancement

Le backlog privilégie le patrimoine produisant déjà des données réelles. Il ne
constitue ni une autorisation d'implémentation ni une spécification de contrat.

## 2. Réutilisation immédiate

| Ordre | Lot d'intégration | Domaine | Patrimoine à conserver | Résultat attendu | Blocage | Priorité |
|---|---|---|---|---|---|---|
| 1 | DINT-001 — Deliverables reconciliation | Deliverables | `MissionDefinition.deliverables`, `MissionReport.deliverables`, `deliverableEvidence`, validation et snapshot | Désigner les données autoritatives et leur association Work sans dupliquer le contenu | identité/état Deliverable et association Work à borner | P0 |
| 2 | DINT-002 — Work/Objective preservation check | Work / Objective | WCF-001 et WCF-002 | Geler les frontières existantes comme prérequis des adaptations | aucun | KEEP |
| 3 | DINT-003 — Approval decision reuse boundary | Decisions | `HumanApprovalWorkflow` et `IntegrationRuntimeRepository` | Qualifier les décisions d'approbation réutilisables par Work | décision Work et décision principale non définies | P1 |

### Décision immédiate

**Le prochain domaine à intégrer est Deliverables.**

Ce choix réutilise un producteur Runtime réel déjà relié à Mission, Run,
Evidence et Certification. Planning ne doit pas le précéder : aucun producteur
Planning métier n'existe.

## 3. Réutilisation avec adaptation

| Ordre | Lot candidat | Domaine | Actifs réutilisables | Adaptation nécessaire | Priorité |
|---|---|---|---|---|---|
| 4 | DINT-004 — Decision association | Decisions | Human approval decision, historique persistant | association Work, portée et désignation explicite | P1 |
| 5 | DINT-005 — People identity mapping | People | UserIdentity, BffPrincipal, LocalIdentityContext | séparer utilisateur, personne métier et agent ; association Work | P2 |
| 6 | DINT-006 — Knowledge source mapping | Intelligence | ProgramKnowledgeResolver, AuthorityResolver, MissionContextBuilder | utiliser les faits sources sans les appeler insight/recommandation | P2 |
| 7 | DINT-007 — Mission synthesis reuse | Synthesis | MissionBrief, MissionReport | distinguer préparation, résultat et synthèse Work courante | P2 |

## 4. Refactoring nécessaire

Ces travaux ne sont pas autorisés par le présent audit ; ils identifient la
dette avant un futur lot dédié.

| Ordre | Dette | Domaine | Preuve | Résultat à obtenir |
|---|---|---|---|---|
| 8 | Représentations Deliverables multiples | Deliverables | MissionDefinition, RuntimeContext, MissionReport, Evidence | une source désignée et des mappings traçables |
| 9 | Modèles d'identité parallèles | People | BFF identity, approval identity, RuntimeAgent | frontières explicites sans fusion abusive |
| 10 | Décisions de périmètres différents | Decisions | Governance records et HumanApprovalDecision | taxonomie et propriétaires non ambigus |
| 11 | Chaînes Runtime et moteur de préparation distinctes | Intelligence / Synthesis | NovaCoreService vs MissionPipeline/NovaOrchestrationBridge | point de consommation explicite ou qualification d'inactivité |
| 12 | Schedulers homonymes | Planning | OrchestratorQueue, Runtime Scheduler, Program Scheduler | empêcher toute promotion en Planning métier |

## 5. Réécriture ou création indispensable

Il n'existe pas de producteur métier à réutiliser pour les éléments suivants.
Un futur lot devra donc créer le producteur, sans réécrire les mécanismes
techniques voisins :

| Ordre | Producteur requis | Domaine | Pourquoi le patrimoine ne suffit pas | Priorité |
|---|---|---|---|---|
| 13 | Producteur Planning Work | Planning | queues et schedulers ne portent aucune primitive métier | P3 |
| 14 | Producteur Work Actions | Actions | recovery et audit sont techniques | P3 |
| 15 | Producteur People Work | People | identités disponibles, affectations métier absentes | P3 |
| 16 | Producteur Confidence | Confidence | Risk/KPI ne produisent aucune confiance métier | P4 |
| 17 | Producteur Intelligence Work | Intelligence | résolveurs produisent de la connaissance, pas des résultats Work | P4 |
| 18 | Producteur Synthesis Work | Synthesis | brief/report Mission ne constituent pas un état Work courant | P4 |

## 6. Dépendances d'intégration

```text
Work Core + Objective
        |
        +--> Deliverables reconciliation
        |          |
        |          +--> Decision association
        |          +--> Evidence association
        |
        +--> People identity mapping
        |
        +--> Planning producer --> Work Actions
        |
        +--> Work facts consolidés --> Confidence / Intelligence / Synthesis
```

Le graphe évite de faire dépendre Deliverables d'un Planning absent. Il évite
également d'utiliser Intelligence ou Synthesis comme source de faits métier.

## 7. Critères d'ouverture du prochain lot

DINT-001 peut être ouvert lorsque le lot confirme :

- la source autoritative entre deliverables attendus et produits ;
- le rattachement `projectId`, `missionId`, `runId` et `workId` ;
- la conservation de `deliverableEvidence` et de sa provenance ;
- l'absence de duplication du contenu ;
- l'absence de mutation des producteurs Mission et Runtime existants.

## 8. Risques

| Risque | Niveau | Contrôle |
|---|---|---|
| Confondre deliverable attendu et produit | HIGH | sources et états explicitement séparés |
| Promouvoir un agent en personne métier | HIGH | frontière People obligatoire |
| Promouvoir une queue en plan métier | HIGH | statut `ORCHESTRATOR_ONLY` conservé |
| Appeler « confiance » un booléen de readiness | HIGH | Risk/KPI exclus comme producteurs |
| Appeler « intelligence » une résolution documentaire | MEDIUM | distinguer faits sources et résultats |
| Dupliquer MissionBrief/MissionReport dans Work | MEDIUM | association et provenance, pas copie implicite |

## 9. Décision

**GO**

Le patrimoine permet une stratégie de réutilisation ordonnée. Le prochain lot
doit intégrer **Deliverables** à partir des producteurs Mission/Runtime
existants. Planning, Actions et Confidence restent des créations de producteurs
à ouvrir ultérieurement, pas des domaines à simuler avec les moteurs voisins.
