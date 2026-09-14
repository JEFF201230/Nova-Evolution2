# P3-PLANNING-001A — PLANNING IMPLEMENTATION CONTRACT REPORT

## 1. MissionId

`P3-PLANNING-001A-IMPLEMENTATION-CONTRACT`

## 2. DomainId

`PLANNING`

## 3. ParentLot

`P3-PLANNING-001 — Planning Foundation`

## 4. LotId

`P3-PLANNING-001A — Planning Implementation Contract`

## 5. Sources réellement consultées

### Sources canoniques demandées

1. `Docs/24_MODULES/WORK/PLANNING_DOMAIN_BLUEPRINT.md` — autorité métier principale, consultée intégralement.
2. `Docs/24_MODULES/WORK/WORK_DOMAIN_BLUEPRINT.md` — frontières Work, Progress, Planning et gate d'admission consultés.
3. `Docs/24_MODULES/WORK/WORK_PHASE2_CERTIFICATION.md` — certification WP-002, ownership, dépendances et ordre Phase 3 consultés.
4. `Docs/24_MODULES/WORK/PEOPLE_IMPLEMENTATION_CONTRACT.md` — structure du contrat, gates et conventions CEREBRAU consultés comme précédent ; aucun modèle PEOPLE recopié.
5. `Docs/24_MODULES/WORK/PEOPLE_CERTIFICATION/MISSIONS/P3-PEOPLE-001H_CERTIFICATION_REPORT.md` — clôture PEOPLE et décision d'ouverture de Planning consultées.
6. `Docs/12_CERTIFICATION/certification-registry.json` — schéma et état d'admission existant consultés.

### Sources techniques strictement nécessaires à l'analyse d'admission

7. `tools/nova-core-runtime/Invoke-ImplementDomainV2.ps1` — point d'entrée du DryRun.
8. `tools/nova-core-runtime/Cerebrau.DomainOrchestration.psm1` — `Resolve-DomainContext`, extraction du contrat, séquence, gates et résolution du lot courant.
9. `tools/nova-core-runtime/Cerebrau.Certification.psm1` — validation du registre, continuité et résolution du contexte de certification.
10. `tools/nova-core-runtime/Test-CerebrauDomainOrchestration.ps1` — inspection ciblée de l'unique échec de contrôle rencontré.

Aucune lecture récursive de `Docs`, aucun réaudit PEOPLE B à H et aucune source métier supplémentaire n'ont été réalisés.

## 6. Fichiers créés

1. `Docs/24_MODULES/WORK/PLANNING_IMPLEMENTATION_CONTRACT.md`.
2. `Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001A-IMPLEMENTATION-CONTRACT/P3-PLANNING-001A_IMPLEMENTATION_CONTRACT_REPORT.md`.

Le prompt déjà présent dans le dossier de mission est antérieur à cette mission et n'a pas été modifié.

## 7. Fichiers modifiés

1. `Docs/12_CERTIFICATION/certification-registry.json` — ajout post-GO d'une seule entrée `P3-PLANNING-001A`.

Aucun code, test, blueprint, artefact PEOPLE, Work fonctionnel, CEREBRAU, Runtime, Frontend, API, BFF, SQL ou migration n'a été modifié par cette mission. Le worktree était fortement modifié avant P3-PLANNING-001A ; ces changements préexistants ont été préservés.

## 8. Faits prouvés

- `WP-002 — Planning` est GO/CERTIFIED au niveau blueprint.
- P3-PEOPLE-001H certifie P3-PEOPLE-001 et autorise l'ouverture de Planning en gouvernance.
- Planning possède seul Plan, Timeline, Phase, Milestone, Schedule, Priority et Constraint.
- Work conserve Identity, Objective, Lifecycle et Progress ; il ne produit pas Planning.
- Progress est observé ; Planning est intentionnel ; aucune déduction n'est autorisée entre eux.
- Timeline est une représentation du Planning, pas une autorité parallèle.
- l'Autorité Planning à établir est explicitement prévue par `WORK_PHASE2_CERTIFICATION.md`.
- un Planning est rattaché à exactement un Work et un Work a au plus un plan courant.
- les versions remplacées doivent rester historiques.
- toute date Planning doit porter une signification métier et une provenance.
- l'admission CEREBRAU dépend génériquement du registre, d'un contrat au titre exact et d'un blueprint référencé.
- avant admission, le DryRun retournait exactement `DOMAIN_UNKNOWN:PLANNING`.
- après admission, le DryRun résout `P3-PLANNING-001A` comme dernier lot certifié et `P3-PLANNING-001B` comme lot courant `ABSENT`, sans écriture.

## 9. Hypothèses éventuelles

Aucune hypothèse métier critique n'est utilisée.

Les décisions techniques suivantes sont des traductions minimales nécessaires des invariants, et non une doctrine métier nouvelle : WorkReference comme identité de racine pour éviter un identifiant parallèle ; identifiants opaques des éléments internes ; révision attendue et causalité pour garantir concurrence/idempotence ; persistence durable parce que le blueprint impose courant unique et histoire immuable.

## 10. Inconnues éventuelles

| Inconnue | Traitement | Bloque 001A |
|---|---|---|
| catégories de Phase/Milestone | différées, aucune catégorie inventée | non |
| vocabulaire/échelle de Priority | qualification explicite conservée avec scope ; aucun défaut ni comparaison inventée | non |
| catégories/moteur des Constraints | seules source, portée, période et condition explicite sont retenues | non |
| règle et source de `MilestoneReached` | événement réservé ; aucune commande Foundation ne peut l'émettre | non pour le plan ; bloque cette capacité précise |
| habilitation humaine détaillée des commandes | provenance/autorité requise ; authentification et RBAC hors domaine | non |
| technologie et schéma de persistence | décision technique séquencée en 001D | non |
| transport et exposition publique | hors Foundation | non |

Aucune inconnue n'empêche l'établissement, la révision, le retrait, l'historisation ou la lecture d'un Planning.

## 11. Décisions d'architecture prises

1. Une seule racine `Planning d'un Work`, identifiée par WorkReference.
2. Une version courante au plus ; toute révision produit une nouvelle version immuable.
3. Planning Authority comme unique frontière d'acceptation.
4. Timeline dérivée et reconstructible, sans écriture directe ni persistence autoritative.
5. Phase, Milestone et Constraint comme entités internes ; Dependency, Schedule et Priority comme Value Objects versionnés.
6. Toute proposition est validée atomiquement sur l'agrégat complet, notamment le graphe acyclique.
7. Trois commandes canoniques seulement ; les changements granulaires sont normalisés vers établissement ou révision.
8. Source durable unique exigée avant ouverture opérationnelle.
9. Port Work unidirectionnel et read-only après stabilisation interne.
10. Commands et Queries réunies dans un seul sous-lot d'accès interne, décision Planning spécifique qui évite une découpe PEOPLE mécanique.

## 12. Ownership Planning retenu

Planning possède exclusivement :

- le plan courant et ses versions historiques ;
- Phase, Milestone, Dependency, Schedule, Priority et Constraint ;
- les repères temporels métier et leur provenance ;
- l'histoire des révisions/retraits ;
- la dérivation Timeline.

Planning Authority accepte seule les mutations. La persistence Planning future est l'unique source durable. Work, Timeline, caches, projections, fixtures, Runtime et Monitoring ne peuvent produire ou arbitrer un fait Planning.

## 13. Relation Planning / Work

La relation est déterministe par WorkReference canonique, composée de Project Identity et Work Identity. Planning valide l'existence du Work et lit son Objective autoritatif. Work consomme ensuite une Query Planning interne qualifiée ; il ne reçoit aucune voie d'écriture et ne persiste aucun miroir.

Les quatre états exposables sont `PLANNING_UNAVAILABLE`, `PLANNING_ABSENT`, `PLANNING_WITHDRAWN` et `PLANNING_AVAILABLE`. Ils conservent la distinction entre producteur indisponible, plan jamais établi, histoire sans plan applicable et plan courant.

## 14. Séparation Planning / Progress

Progress reste la progression observée de la baseline Work/Monitoring. Planning porte uniquement l'intention planifiée. Le contrat interdit :

- la création ou révision d'un plan depuis Progress ;
- la déduction de Phase, Milestone ou échéance depuis une mesure ;
- la promotion d'un timestamp Monitoring ;
- l'émission de `MilestoneReached` sans source et règle préalablement certifiées.

Une future comparaison est possible en lecture de deux sources autoritatives séparées ; elle ne transfère aucun ownership.

## 15. Dépendances interdomaines

| Domaine | Relation initiale | Frontière |
|---|---|---|
| Work | obligatoire pour l'identité | Planning ne possède ni ne modifie Work |
| Objective | obligatoire en lecture | aucune copie ni reformulation |
| People | optionnelle, désormais certifiée | références seulement ; aucune identité/rôle/Affectation créée |
| Actions | future et optionnelle | aucune exécution ou résultat produit |
| Deliverables | future et optionnelle | attente référençable, livrable réel externe |
| Decisions | optionnelle comme source d'intention | Planning ne crée ni n'approuve la Decision |
| Intelligence | future proposition | aucune modification sans intention explicitement acceptée |
| Confidence | future qualification externe | ne devient jamais Priority |
| Synthesis | future lecture | ne devient ni Timeline ni source |
| Runtime/Monitoring | interdit comme producteur | mécanique et observations techniques hors Planning |

## 16. Politique de persistence

Une persistence Planning canonique unique est requise et sera créée uniquement en `P3-PLANNING-001D`, après certification du modèle et de Planning Authority. Elle devra commiter atomiquement état courant, nouvelle version, histoire, événements et receipt ; assurer CAS, idempotence, recovery et migration ; interdire l'effacement de l'histoire et toute copie de Work/Objective/Progress/Timeline.

Le choix technologique et le schéma ne sont pas inventés par 001A. Aucune commande opérationnelle ne peut précéder la certification de 001D.

## 17. Commands / Events / Queries retenus

### Commands

- `EstablishPlanning` ;
- `RevisePlanning` ;
- `WithdrawPlanning`.

`RecordMilestoneReached` est explicitement non admise dans la Foundation.

### Events

- `PlanningEstablished`, `PlanningRevised`, `PlanningWithdrawn` ;
- `PhaseAdded`, `PhaseChanged`, `PhaseRemoved` ;
- `MilestoneScheduled`, `MilestoneChanged` ;
- `DependencyDeclared`, `DependencyRemoved` ;
- `ConstraintDeclared`, `ConstraintReleased` ;
- `ScheduleChanged`, `PriorityChanged`.

`MilestoneReached` reste dans le catalogue conceptuel du blueprint mais son émission est interdite jusqu'à admission de sa source/règle.

### Queries

- `GetCurrentPlanning` ;
- `GetPlanningVersion` ;
- `GetPlanningHistory` ;
- `GetPlanningTimeline` ;
- `GetPlanningSchedule`.

## 18. Test Contract

Le contrat fixe 13 catégories extractibles par CEREBRAU : invariants, agrégat, Commands, événements, Queries, persistence, Dependency, temps métier, intégration Work, séparation Progress, relations interdomaines, non-régression et typecheck.

Les cas critiques couvrent notamment : un courant au plus, versionnement/retrait, graphe acyclique, dates métier qualifiées, Priority sans défaut, Constraint sourcée, idempotence/CAS, Timeline read-only, quatre états Work, absence de copie et rejet des sources techniques.

## 19. Séquence des futurs sous-lots

| Ordre | Lot | Objectif unique |
|---|---|---|
| 1 | P3-PLANNING-001B | matérialiser le modèle et ses invariants |
| 2 | P3-PLANNING-001C | établir Planning Authority comme producteur unique |
| 3 | P3-PLANNING-001D | établir la persistence canonique durable |
| 4 | P3-PLANNING-001E | ouvrir la frontière applicative interne Commands/Queries |
| 5 | P3-PLANNING-001F | intégrer la lecture Planning dans Work |
| 6 | P3-PLANNING-001G | certifier Planning Foundation et décider de la suite |

Cette séquence est minimale et dérivée du domaine Planning : validation globale d'une racine versionnée, graphe et Schedule avant autorité ; autorité avant source durable ; source durable avant accès interne ; accès stable avant Work ; certification finale. Aucun lot futur n'a été créé ou commencé.

## 20. Entry / Exit Gates

L'entry gate de 001A passe : WP-002 certifié, PEOPLE clôturé, Planning ouvert en gouvernance, identifiants décidés, sources cohérentes et mission strictement documentaire.

Chaque lot B à G possède dans le contrat :

- le GO/certificat exact du précédent comme précondition ;
- un périmètre autorisé borné et une liste de fichiers à fixer par mission ;
- des interdictions explicites ;
- un exit gate testable ;
- un ordre sans anticipation.

L'exit gate 001A passe : ownership, aggregate, Work/Progress, source unique, provenance, persistence, Commands/Events/Queries, Test Contract, séquence et admission générique sont déterministes.

## 21. Analyse d'admission CEREBRAU

### État initial

`Invoke-ImplementDomainV2.ps1 -Domain PLANNING -DryRun` a retourné `DOMAIN_UNKNOWN:PLANNING` avec exit 1.

### Mécanisme générique prouvé

1. `Resolve-CertificationContext` filtre les entrées par `DomainId`.
2. `Resolve-DomainContext` retourne `DOMAIN_UNKNOWN` lorsque cette collection est vide.
3. Il découvre ensuite le contrat parmi les `CertificationPath` Markdown et exige le titre exact `# PLANNING IMPLEMENTATION CONTRACT`.
4. Il découvre le blueprint par une référence Markdown du contrat et le titre `# PLANNING DOMAIN BLUEPRINT`.
5. Le parseur lit `16.1`, `17.2`, les dépendances, invariants et tests sans special-case.
6. `Resolve-CurrentLot` exige la continuité exacte registre/contrat.

Le contrat a été testé directement contre `Read-LotImplementationContract` pour B à G : six lots résolus, liens Previous/Next exacts, 18 invariants et 13 catégories de tests.

### État après admission

Le DryRun passe avec exit 0 et retourne :

| Propriété | Valeur |
|---|---|
| DomainId | PLANNING |
| LastCertifiedLot | P3-PLANNING-001A |
| CurrentLot | P3-PLANNING-001B |
| CurrentStatus | ABSENT |
| ExecutionMode | IMPLEMENTATION |
| NextLot | P3-PLANNING-001C |
| DryRun | True |
| WritesPerformed | False |

`Cerebrau.DomainOrchestration.psm1`, `Resolve-DomainContext` et le runtime n'ont pas été modifiés. Aucun special-case n'est nécessaire.

## 22. Décision concernant le registre de certification

**Décision : mutation requise et réalisée après le GO documentaire du contrat.**

L'entrée ajoutée est l'unique acte canonique nécessaire :

```json
{
  "DomainId": "PLANNING",
  "LotId": "P3-PLANNING-001A",
  "CertificationPath": "Docs/24_MODULES/WORK/PLANNING_IMPLEMENTATION_CONTRACT.md",
  "Status": "CERTIFIED",
  "PreviousLot": null,
  "NextAuthorizedLot": "P3-PLANNING-001B"
}
```

Cette forme suit le précédent canonique du lot contractuel PEOPLE 001A. Le registre contient exactement une entrée PLANNING. `P3-PLANNING-001B` n'est pas matérialisé ; il est seulement le prochain lot autorisable. Aucun lot C à G n'est précréé.

## 23. Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| lecture ciblée des sources demandées | PASS |
| cohérence avec Planning Blueprint | PASS |
| cohérence avec Work Blueprint | PASS |
| cohérence avec Work Phase 2 Certification | PASS |
| cohérence avec la clôture PEOPLE | PASS |
| matrice d'ownership et absence de seconde source | PASS |
| séparation Planning/Progress et Timeline | PASS |
| séquence et gates | PASS |
| parse des six lots par `Read-LotImplementationContract` | PASS |
| état initial DryRun | PASS — `DOMAIN_UNKNOWN:PLANNING` constaté |
| JSON registre, schéma et unicité PLANNING | PASS — SchemaVersion 1, une entrée |
| `Test-CerebrauCertification.ps1` | PASS — 24/24 |
| DryRun Planning après admission | PASS — exit 0, aucune écriture |
| `git diff --check` | PASS — exit 0 |
| contrôle whitespace des deux nouveaux livrables | PASS — aucun diagnostic |
| `Test-CerebrauDomainOrchestration.ps1` | 50/51 — unique assertion PEOPLE obsolète, hors Planning |

Aucune suite applicative lourde n'a été lancée, la mission n'ayant modifié aucun code fonctionnel.

## 24. Résultats

Le contrat est complet, déterministe, interprétable par le mécanisme générique et respecte les 17 familles demandées. L'ownership est unique, la relation Work est stable, la provenance est certifiable, la persistence précède l'opérationnel, les inconnues sont isolées sans invention et la séquence est gouvernable.

L'objectif d'admission est atteint : le DryRun PLANNING ne retourne plus `DOMAIN_UNKNOWN:PLANNING`.

## 25. Régressions

Aucune régression causée par P3-PLANNING-001A n'est observée. Aucun fichier fonctionnel n'a été modifié et le DryRun est sans écriture.

La suite Domain Orchestration contient un échec préexistant `people-pilot-resolves-current-lot` : les lignes 876–879 attendent encore `LastCertifiedLot = P3-PEOPLE-001G`, `CurrentLot = P3-PEOPLE-001H`, `ABSENT`, alors que le registre présent dès l'état initial de cette mission certifie 001H. L'assertion invoque exclusivement `PEOPLE`; l'ajout de l'entrée PLANNING ne change ni ses données ni sa résolution. Sa correction est interdite ici par le périmètre PEOPLE/CEREBRAU et n'affecte pas la preuve Planning spécifique.

## 26. Blockers

Aucun blocker pour la certification de P3-PLANNING-001A.

Le test PEOPLE obsolète est une dette de cohérence de la baseline courante, non une dépendance fonctionnelle ou documentaire de Planning. `MilestoneReached` reste bloqué fonctionnellement jusqu'à une décision future dédiée, sans bloquer Planning Foundation.

## 27. Prochain lot éventuellement autorisable

`P3-PLANNING-001B — Planning Foundation Model` est le seul prochain lot autorisable par le registre et le contrat. Il n'est ni créé, ni ouvert, ni commencé par cette mission. Son démarrage exige une mission distincte et le respect de son entry gate.

## 28. Décision GO / NO GO

Tous les critères GO du lot documentaire passent : blueprint suffisamment déterministe, producteur et source uniques, frontières Work/Progress/Timeline stables, provenance, primitives, Commands/Events/Queries, persistence séquencée, Test Contract, gates, admission CEREBRAU générique et `git diff --check` PASS. Aucune modification fonctionnelle n'a été nécessaire.

GO — P3-PLANNING-001A — PLANNING IMPLEMENTATION CONTRACT CERTIFIED
