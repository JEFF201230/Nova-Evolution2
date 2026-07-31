# NOVA Work Capability — Architecture canonique

## 0. Statut du document

| Attribut | Valeur |
|---|---|
| Mission | SW-014 — Work Capability Foundation |
| Nature | Spécification canonique d'architecture métier |
| Statut | CANONICAL |
| Portée | Future Capability Runtime Work |
| Implémentation | Aucune |

Ce document définit la Capability métier Work indépendamment du Frontend, du BFF, des endpoints, des contrats de transport, des Read Models et des projections de lecture.

Les structures visuelles et les fixtures ne constituent pas des sources métier autoritatives. Elles expriment des besoins consommateurs. Les producteurs Runtime existants et les conclusions certifiées de SW-011A à SW-013A constituent les preuves de disponibilité.

### 0.1 Sources de traçabilité

| Source | Rôle dans SW-014 |
|---|---|
| `NOVA_WORK_OVERVIEW_READMODEL_SPECIFICATION.md` | Besoins consommateurs déjà qualifiés ; aucune autorité métier |
| `NOVA_WORK_OVERVIEW_RUNTIME_GAP_REPORT.md` | Écarts entre besoins et producteurs disponibles |
| `NOVA_SW013_WORK_OVERVIEW_READMODEL_IMPLEMENTATION_REPORT.md` | Preuve du NO GO lié aux producteurs |
| `NOVA_WORK_OVERVIEW_PRODUCER_AUDIT.md` | Cause racine et localisation des producteurs |
| `NOVA_WORK_OVERVIEW_PRODUCER_MATRIX.md` | Statuts factuels EXISTING, PARTIAL et MISSING |
| `Docs/00_GOVERNANCE/NOVA_RUNTIME_REGISTRY.md` | Composants Runtime existants |
| `Docs/00_GOVERNANCE/NOVA_RUNTIME_TRACEABILITY_MATRIX.md` | Traçabilité Runtime existante |
| `Docs/00_GOVERNANCE/NOVA_CAPABILITY_REGISTRY.md` | Statut antérieur de la Capability Work |
| `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_PROGRAM_ARCHITECTURE.md` | Besoins consommateurs Frontend ; explicitement non autoritatifs pour le métier |

## 1. Décision d'architecture

La **Capability Runtime Work** est responsable de maintenir une représentation métier cohérente, traçable et déterministe d'un Work, ancrée sur une Mission, puis d'y associer sans les dupliquer les contributions autoritatives de Planning, Decisions, People, Deliverables, Evidence, Monitoring et Intelligence.

Elle possède :

- l'identité métier du Work et son rattachement à une Mission ;
- l'état courant du cycle de vie Work ;
- la cohérence et la provenance de l'état Work ;
- les associations entre le Work et les objets produits par les autres domaines ;
- les règles d'acceptation des contributions autoritatives ;
- la distinction entre une donnée absente, une donnée optionnelle et un producteur indisponible.

Elle ne possède pas :

- le cycle d'exécution technique d'une Mission ;
- la sémantique interne d'un plan, d'une décision, d'une personne, d'un livrable ou d'une preuve ;
- les algorithmes de confiance, de recommandation ou de synthèse ;
- la collecte technique de monitoring ;
- les modèles d'affichage ;
- les projections de lecture ;
- les routes, endpoints, DTO, schémas de transport ou composants d'interface.

La Capability Work est un nouveau périmètre métier dans le Runtime existant. Elle ne constitue ni un nouveau domaine d'entreprise, ni un remplacement de Mission, ni une reconstruction du Runtime.

## 2. Périmètre exact

### 2.1 Responsabilités appartenant à Work

1. Établir une identité Work stable dans un projet et la rattacher explicitement à la Mission dont elle suit l'exécution.
2. Maintenir exactement un état courant de cycle de vie Work.
3. Recevoir une progression depuis un producteur désigné et en conserver la provenance.
4. Associer au Work les références autoritatives de planification, actions, décisions, personnes, livrables, sources et preuves.
5. Recevoir les résultats d'intelligence autorisés sans les recalculer.
6. Produire un état Work cohérent, daté et exploitable par plusieurs consommateurs.
7. Refuser toute substitution implicite d'une donnée technique à une donnée métier.
8. Permettre l'évolution incrémentale des familles métier sans modifier la frontière de la Capability.

### 2.2 Responsabilités exclues

| Responsabilité exclue | Propriétaire ou qualification |
|---|---|
| Exécuter, suspendre ou reprendre une Mission | Mission / Runtime d'exécution |
| Orchestrer des agents | Runtime d'exécution / Agents |
| Définir les phases et dépendances d'un plan | Planning |
| Prendre ou approuver une décision | Decisions / Governance |
| Gérer l'identité d'une personne | People |
| Produire le contenu d'un livrable | Deliverables |
| Produire ou certifier une preuve | Evidence / Certification |
| Calculer la confiance ou une recommandation | Intelligence |
| Collecter les métriques et événements techniques | Monitoring |
| Construire un écran ou une projection | Couche de lecture consommatrice |
| Exposer un transport | API / BFF |

## 3. État métier canonique

Les qualifications suivantes sont utilisées :

- **OBLIGATOIRE** : la famille appartient à l'état Work canonique ;
- **OPTIONNELLE** : la famille appartient au modèle mais peut ne pas avoir de valeur ;
- **FUTURE** : la famille appartient à la cible canonique mais n'entre pas dans le premier incrément ;
- **HORS PÉRIMÈTRE MVP** : la famille n'est pas nécessaire au MVP Runtime minimal défini par SW-014.

Une collection canonique peut être vide. Une valeur optionnelle absente ne signifie pas qu'un producteur obligatoire est indisponible.

| Famille | Contenu métier canonique | Qualification cible | MVP Runtime minimal |
|---|---|---|---|
| Identité | Identifiant Work, projet, rattachement Mission, intitulé métier | OBLIGATOIRE | OBLIGATOIRE |
| Cycle de vie | Un état Work courant et sa date de changement | OBLIGATOIRE | OBLIGATOIRE |
| Progression | Progression courante, date d'observation, provenance | OBLIGATOIRE | OBLIGATOIRE |
| Planification | Phase courante, nombre de phases, échéance, références de plan | OBLIGATOIRE | HORS PÉRIMÈTRE MVP |
| Actions | Action suivante, actions différées et actions d'arrière-plan | FUTURE ; valeurs individuelles OPTIONNELLES | HORS PÉRIMÈTRE MVP |
| Décisions | Décisions rattachées et éventuelle décision principale | FUTURE ; décision principale OPTIONNELLE | HORS PÉRIMÈTRE MVP |
| People | Affectations, responsable éventuel et participants rattachés | FUTURE ; responsable OPTIONNEL | HORS PÉRIMÈTRE MVP |
| Livrables | Références stables des livrables et état fourni par leur domaine | FUTURE | HORS PÉRIMÈTRE MVP |
| Confiance | Mesure de confiance et provenance du calcul | FUTURE | HORS PÉRIMÈTRE MVP |
| Intelligence | Insight, recommandation et action priorisée issus d'un producteur autoritatif | FUTURE ; sorties OPTIONNELLES | HORS PÉRIMÈTRE MVP |
| Synthèse | Synthèse métier courante, datée et sourcée | OPTIONNELLE et FUTURE | HORS PÉRIMÈTRE MVP |
| Sources et preuves | Références vers les sources et preuves liées au Work | FUTURE | HORS PÉRIMÈTRE MVP |
| Activité | Références vers les événements métier et techniques autorisés | FUTURE ; flux technique déjà PARTIAL | HORS PÉRIMÈTRE MVP |

SW-014 ne fixe aucune valeur de statut de cycle de vie. Aucun vocabulaire autoritatif Work n'a été trouvé dans le Runtime exposé. Le premier lot devra faire certifier ce vocabulaire métier dans sa propre décision normative, sans modifier la frontière définie ici et sans réutiliser implicitement un statut technique de Mission.

## 4. Producteurs métier

Les seuls statuts admis sont **EXISTING**, **PARTIAL** et **MISSING**.

| Famille | Producteur attendu | Source autoritative | Domaine propriétaire | Dépendances | Statut |
|---|---|---|---|---|---|
| Identité | Producteur d'identité Work | Identité de Mission et rattachement projet/Mission | Missions, avec ancrage Work | Mission existante | PARTIAL |
| Cycle de vie | Producteur de cycle de vie Work | État métier Work et transitions autorisées | Work | Identité Work | MISSING |
| Progression | Producteur de progression Work | Progression observée de Mission, qualifiée pour Work | Monitoring / Missions | Exécution de Mission | EXISTING |
| Planification | Producteur de plan Work | Plan métier, phases, dépendances, échéances | Planning | Identité Work | MISSING |
| Actions | Producteur d'actions Work | Actions métier rattachées au Work | Work, alimenté par Planning et Intelligence | Plan, décisions, preuves | MISSING |
| Décisions | Producteur d'association de décisions Work | Décisions et désignation explicite de la décision principale | Decisions | Identité Work, décisions existantes | MISSING |
| People | Producteur d'affectations Work | Personnes, rôles et disponibilités autoritatifs | People | Identité Work, identité People | MISSING |
| Livrables | Producteur de synthèse des livrables Work | Livrables de Mission existants, enrichissement métier non disponible | Deliverables / Missions | Identité Work, livrables | PARTIAL |
| Confiance | Producteur de confiance Work | Calcul métier de confiance sourcé | Intelligence | État Work et preuves | MISSING |
| Intelligence | Producteur d'intelligence Work | Insight, recommandation et priorisation | Intelligence | État Work consolidé | MISSING |
| Synthèse | Producteur de synthèse Work | Synthèse métier datée et sourcée | Intelligence | État Work consolidé | MISSING |
| Sources et preuves | Producteur d'associations de preuves Work | Références de preuves certifiables | Evidence | Identité Work, preuves existantes | PARTIAL |
| Activité | Producteur d'activité Work | Événements de Mission existants ; activité métier enrichie absente | Monitoring / Missions, puis Work | Mission, horodatage, provenance | PARTIAL |

### 4.1 Producteurs réellement disponibles

- L'identité de Mission fournit la source projet/Mission et l'objectif à partir desquels l'identité Work peut être établie ; l'ancrage Work lui-même reste à constituer.
- Monitoring et Missions fournissent une progression et des horodatages techniques exposés.
- Les événements de Mission fournissent une activité partielle.
- Les livrables de Mission et les preuves existantes fournissent des références partielles, sans la richesse métier attendue par Work.

Ces producteurs ne forment pas à eux seuls une Capability Work complète.

### 4.2 Producteurs à créer

- cycle de vie Work ;
- planification Work ;
- actions Work ;
- associations de décisions Work ;
- affectations et personnes Work ;
- synthèse enrichie des livrables Work ;
- confiance Work ;
- intelligence et synthèse Work.

Les associations de sources/preuves et l'activité Work doivent être complétées, pas dupliquées.

## 5. Invariants métier

Seuls les invariants justifiés par les besoins certifiés et les producteurs identifiés sont retenus.

1. **Identité stable** — tout Work possède une identité non ambiguë dans un projet et un rattachement explicite à une Mission.
2. **État unique** — un Work ne possède qu'un seul état courant de cycle de vie à un instant donné.
3. **Provenance obligatoire** — toute donnée reçue d'un autre domaine conserve son producteur et sa date d'observation.
4. **Progression déterministe** — pour un même ensemble de faits autoritatifs, la progression Work courante est identique ; elle n'est pas recalculée par une projection.
5. **Échelle bornée** — toute progression ou confiance exprimée en pourcentage reste comprise entre 0 et 100.
6. **Phase cohérente** — lorsqu'un plan est présent, la phase courante est rattachée à ce plan et ne dépasse pas son nombre de phases.
7. **Association explicite** — aucune décision, personne, source, preuve ou livrable n'appartient à un Work sans association autoritative.
8. **Décision principale explicite** — au plus une décision peut être qualifiée de principale ; son absence est valide et sa sélection ne peut pas être déduite par Work.
9. **Absence non substituable** — une valeur optionnelle absente, une collection vide et un producteur indisponible sont trois états distincts.
10. **Séparation technique/métier** — un état, une phase, un agent ou un événement technique de Mission ne devient jamais implicitement un état, une phase, un responsable ou une synthèse Work.
11. **Intelligence non implicite** — Work conserve les résultats d'intelligence et leur provenance, mais ne fabrique pas de score, recommandation ou synthèse de remplacement.
12. **Lecture sans effet métier** — toute projection ou lecture de l'état Work est dépourvue d'effet sur l'agrégat et ses producteurs.

## 6. Frontières et interactions

| Domaine | Work consomme | Work produit pour ce domaine | Relation | Frontière |
|---|---|---|---|---|
| Missions | Identité, objectif, faits d'exécution, livrables bruts | Rattachement et état métier Work | Bidirectionnelle par références | Mission reste propriétaire de l'exécution |
| Monitoring | Progression, événements et horodatages techniques | Identité de corrélation Work | Work consommateur | Monitoring reste propriétaire de l'observation technique |
| Planning | Plan, phases, dépendances, échéance | Identité Work et contexte autorisé | Bidirectionnelle par références | Planning reste propriétaire de la sémantique du plan |
| Decisions | Décisions autoritatives et désignation principale | Association au Work et contexte autorisé | Bidirectionnelle par références | Decisions reste propriétaire de la décision |
| People | Identités, rôles et disponibilités | Affectation au Work et contexte autorisé | Bidirectionnelle par références | People reste propriétaire des personnes |
| Deliverables | Identités et états de livrables | Association au Work | Bidirectionnelle par références | Deliverables reste propriétaire du contenu et de son état |
| Evidence | Sources, preuves et statut de certification | Association au Work et contexte autorisé | Bidirectionnelle par références | Evidence reste propriétaire de la preuve |
| Intelligence | Scores, insight, recommandation, action priorisée, synthèse | État Work sourcé autorisé | Bidirectionnelle contrôlée | Intelligence reste propriétaire des calculs |
| Certification | Aucun état métier nécessaire au socle | État Work et provenance consultables | Work producteur consultable | Certification ne modifie pas Work |
| Frontend / BFF / API | Aucun | Aucun contrat de transport dans cette Capability | Aucune dépendance métier | Consommateurs externes uniquement |

## 7. Agrégat et services Runtime futurs

### 7.1 Agrégat Work

L'agrégat Work est la frontière de cohérence des informations possédées par Work : identité, cycle de vie, progression acceptée, provenance et associations autoritatives. Il ne réplique pas les agrégats des autres domaines.

### 7.2 Rôles de services

Ces rôles décrivent des responsabilités. Ils n'imposent ni classe, ni signature, ni découpage physique.

| Rôle de service | Responsabilité métier | Dépendances autorisées |
|---|---|---|
| Gestion d'état Work | Créer l'ancrage Work, maintenir son état courant et appliquer ses invariants | Missions, producteur de cycle Work |
| Coordination de progression | Accepter la progression autoritative et conserver sa provenance | Monitoring / Missions |
| Coordination de planification | Associer le plan et ses repères sans interpréter ses règles internes | Planning |
| Coordination d'actions | Maintenir les actions rattachées et leur statut autoritatif | Planning, Decisions, Intelligence |
| Coordination d'associations | Maintenir les références vers décisions, personnes, livrables, sources et preuves | Domaines propriétaires correspondants |
| Coordination d'intelligence | Fournir l'état autorisé et accepter les résultats sourcés | Intelligence, Evidence |
| Validation et provenance | Distinguer absence, optionnalité et indisponibilité ; faire respecter les frontières | Tous les producteurs autorisés |

## 8. Futurs producteurs

| Producteur | Responsabilité | Données produites | Dépendances |
|---|---|---|---|
| Producteur de cycle Work | Déterminer l'état métier courant selon un vocabulaire autorisé | État courant, date de changement, provenance | Identité Work, faits métier autorisés |
| Producteur de plan Work | Exposer la situation de planification du Work | Plan de référence, phase, total, échéance, dépendances | Planning |
| Producteur d'actions Work | Exposer les actions rattachées sans les prioriser implicitement | Actions courantes, différées et arrière-plan | Work, Planning |
| Producteur d'associations de décisions | Rattacher les décisions et relayer la désignation principale | Références de décisions, principale éventuelle | Decisions |
| Producteur d'affectations Work | Rattacher responsable et participants | Références People, rôles, disponibilité autoritative | People |
| Producteur de livrables Work | Enrichir les références de livrables pour leur usage Work | Identité, état et progression autoritative du livrable | Deliverables / Missions |
| Producteur de confiance Work | Produire la confiance depuis des faits sourcés | Mesure, date, provenance | Intelligence, Evidence, état Work |
| Producteur d'intelligence Work | Produire insight, recommandation et priorité | Insight, recommandation, action priorisée | État Work consolidé |
| Producteur de synthèse Work | Produire une synthèse courante | Synthèse, date, provenance | Intelligence, état Work consolidé |

## 9. Projections futures

Les projections suivantes sont des consommateurs futurs de la Capability. Elles ne font pas partie de son état, de ses services ou de son MVP :

1. Work Overview ;
2. Work Activity ;
3. Work Plan ;
4. Work Decisions ;
5. Work Deliverables ;
6. Work People ;
7. Work Sources.

Une projection ne devient ouvrable que lorsque tous ses producteurs obligatoires sont disponibles ou qu'un état d'indisponibilité explicitement prévu est autorisé. Work Activity peut continuer à consommer les événements Runtime existants ; cette lecture partielle ne prouve pas la complétude de la Capability Work.

## 10. MVP Runtime minimal

Le plus petit incrément viable est **Work Core Foundation** :

- identité Work stable et rattachement explicite projet/Mission ;
- état courant de cycle de vie Work issu d'un producteur Work autoritatif ;
- progression courante issue du producteur existant Monitoring/Missions ;
- date d'observation et provenance de chaque contribution ;
- invariants d'identité, d'état unique, de progression déterministe et de séparation technique/métier.

Il exclut planification, actions, décisions, personnes, livrables enrichis, confiance, intelligence, synthèse, projections et transports.

Ce MVP est déployable comme fondation métier parce qu'il :

- réutilise les producteurs d'identité et de progression déjà disponibles ;
- ne dépend d'aucun des futurs domaines producteurs ;
- établit la frontière et l'identité sur lesquelles tous les incréments suivants se rattachent ;
- n'introduit aucune dépendance vers une interface ou une projection ;
- ne prétend pas alimenter Work Overview avant la disponibilité des producteurs requis.

## 11. Réponses de clôture

### 11.1 Responsabilité exacte

Maintenir l'état métier cohérent et sourcé d'un Work ancré sur une Mission, ainsi que ses associations autoritatives, sans absorber les responsabilités des domaines contributeurs.

### 11.2 Producteurs disponibles

La source d'identité Mission et la progression/horodatage de Monitoring sont disponibles. Le producteur d'identité Work, l'activité, les livrables et les preuves ne sont disponibles que partiellement.

### 11.3 Producteurs à créer

Cycle Work, planification, actions, associations de décisions, affectations People, livrables enrichis, confiance, intelligence et synthèse.

### 11.4 MVP Runtime minimal

Work Core Foundation : identité, cycle de vie Work, progression autoritative et provenance.

### 11.5 Premier lot d'implémentation Runtime

**WCF-001 — Work Core Foundation**.

### 11.6 Justification du plus petit incrément viable

WCF-001 s'appuie sur les producteurs réellement existants, ne dépend d'aucun producteur futur et crée l'ancrage métier commun indispensable à tous les lots ultérieurs. Tout lot plus petit omettrait soit l'identité, soit l'état courant, soit la provenance et ne constituerait donc pas une Capability métier exploitable.

## 12. Verdict d'architecture

**GO**

La frontière, les responsabilités, les dépendances, les producteurs, le MVP minimal et le premier lot sont définis. Les lots futurs peuvent être ouverts sans nouvel audit d'architecture. Les décisions normatives propres aux producteurs — notamment le vocabulaire du cycle de vie Work — restent à certifier dans le lot concerné, sans remise en cause de cette architecture.
