# NOVA Work Capability — Matrice canonique des dépendances

## 0. Objet

Cette matrice fixe les dépendances métier autorisées de la future Capability Runtime Work. Elle ne décrit ni appels techniques, ni endpoints, ni contrats de transport.

Statuts producteurs autorisés : **EXISTING**, **PARTIAL**, **MISSING**.

## 1. Matrice des producteurs

| ID | Famille Work | Producteur autoritatif attendu | Domaine propriétaire | Work est | Données consommées | Données possédées par Work | Statut | Lot |
|---|---|---|---|---|---|---|---|---|
| WDEP-001 | Identité | Identité Mission | Missions | Consommateur et créateur de l'ancrage | Projet, Mission, objectif/intitulé disponible | Identité Work, rattachement explicite | PARTIAL | WCF-001 |
| WDEP-002 | Cycle de vie | Cycle Work | Work | Propriétaire | Faits métier autorisés | État courant, date, provenance | MISSING | WCF-001 |
| WDEP-003 | Progression | Progression Mission | Monitoring / Missions | Consommateur | Progression, date d'observation | Valeur acceptée et provenance | EXISTING | WCF-001 |
| WDEP-004 | Livrables | Livrables autoritatifs | Deliverables / Missions | Consommateur et associateur | Identités et états disponibles | Références et associations Work | PARTIAL | WCF-002 |
| WDEP-005 | Planification | Plan Work | Planning | Consommateur et associateur | Plan, phases, échéance, dépendances | Référence de plan et association Work | MISSING | WCF-003 |
| WDEP-006 | Sources/preuves | Preuves autoritatives | Evidence | Consommateur et associateur | Identité, provenance, certification | Références et associations Work | PARTIAL | WCF-004 |
| WDEP-007 | Décisions | Décisions autoritatives | Decisions | Consommateur et associateur | Décisions et désignation principale | Références et associations Work | MISSING | WCF-005 |
| WDEP-008 | People | Identités et disponibilités | People | Consommateur et associateur | Identités, rôles, disponibilité | Affectations et associations Work | MISSING | WCF-006 |
| WDEP-009 | Actions | Actions Work | Work, alimenté par Planning/Decisions | Propriétaire de l'association | Origine, contexte, statut autoritatif | Actions rattachées et provenance | MISSING | WCF-007 |
| WDEP-010 | Confiance | Confiance Work | Intelligence | Consommateur | Mesure, date, faits sources | Résultat accepté et provenance | MISSING | WCF-008 |
| WDEP-011 | Intelligence | Intelligence Work | Intelligence | Consommateur | Insight, recommandation, priorité | Résultats acceptés et provenance | MISSING | WCF-008 |
| WDEP-012 | Synthèse | Synthèse Work | Intelligence | Consommateur | Synthèse et date | Résultat accepté et provenance | MISSING | WCF-008 |
| WDEP-013 | Activité | Événements Mission et Work | Monitoring / Missions, puis Work | Consommateur | Événements, horodatage, type, origine | Association et qualification Work | PARTIAL | Après WCF-001 selon besoin métier |

## 2. Matrice des frontières

| Domaine | Direction | Dépendance autorisée | Dépendance interdite | Justification |
|---|---|---|---|---|
| Missions | Missions → Work | Identité et faits d'exécution | Assimiler état technique et état Work | Mission est l'ancrage, pas l'agrégat Work |
| Monitoring | Monitoring → Work | Progression, événements, horodatages | Faire de Work le collecteur technique | Monitoring reste autoritatif |
| Planning | Planning ↔ Work | Références de plan et contexte Work | Copier ou redéfinir les règles de planification | Sémantique possédée par Planning |
| Decisions | Decisions ↔ Work | Références et désignation principale explicite | Déduire, prendre ou approuver une décision | Décision possédée par Decisions |
| People | People ↔ Work | Affectations par références | Confondre agent Runtime et responsable métier | Identité possédée par People |
| Deliverables | Deliverables ↔ Work | Références et état autoritatif | Produire ou éditer le contenu dans Work | Livrable possédé par Deliverables |
| Evidence | Evidence ↔ Work | Références, provenance, certification | Dupliquer ou certifier une preuve | Preuve possédée par Evidence |
| Intelligence | Work ↔ Intelligence | Faits autorisés contre résultats sourcés | Recalculer ou remplacer un résultat absent | Algorithmes possédés par Intelligence |
| Certification | Work → Certification | État et provenance consultables | Mutation de Work par certification | Certification est consommatrice |
| Frontend/BFF/API | Work → consommateurs externes | Consommation ultérieure par une couche séparée | Dépendance métier de Work vers l'interface | Indépendance de la Capability |

## 3. Matrice de complétude de l'état

| Famille | Cible canonique | MVP WCF-001 | Condition de disponibilité | État en cas d'indisponibilité |
|---|---|---|---|---|
| Identité | OBLIGATOIRE | OBLIGATOIRE | Mission identifiable | Work non constituable |
| Cycle de vie | OBLIGATOIRE | OBLIGATOIRE | Producteur Work autoritatif | Work non constituable |
| Progression | OBLIGATOIRE | OBLIGATOIRE | Producteur désigné et provenance | Producteur indisponible, jamais valeur inventée |
| Planification | OBLIGATOIRE dans la cible | Hors MVP | WCF-003 disponible | Famille future indisponible |
| Actions | FUTURE | Hors MVP | WCF-007 disponible | Famille future indisponible |
| Décisions | FUTURE | Hors MVP | WCF-005 disponible | Collection vide ou producteur indisponible explicitement distingués |
| People | FUTURE | Hors MVP | WCF-006 disponible | Collection vide ou producteur indisponible explicitement distingués |
| Livrables | FUTURE | Hors MVP | WCF-002 disponible | Données partielles non promues en synthèse complète |
| Confiance | FUTURE | Hors MVP | WCF-008 disponible | Aucune valeur de remplacement |
| Intelligence | FUTURE, sorties optionnelles | Hors MVP | WCF-008 disponible | Sortie absente distincte du producteur indisponible |
| Synthèse | OPTIONNELLE et FUTURE | Hors MVP | WCF-008 disponible | Aucune synthèse fabriquée |
| Sources/preuves | FUTURE | Hors MVP | WCF-004 disponible | Références partielles explicitement qualifiées |
| Activité | FUTURE, partielle actuellement | Hors MVP | Événements autoritatifs | Événements techniques conservés comme tels |

## 4. Matrice des projections consommatrices futures

Cette section identifie uniquement les familles nécessaires. Elle ne spécifie aucun Read Model.

| Projection | Familles Work nécessaires | Producteurs minimaux | Ouverture autorisée |
|---|---|---|---|
| Work Overview | Identité, cycle, progression, planification, actions, décision principale, People, livrables, confiance, intelligence, synthèse | WCF-001 à WCF-008 | Après disponibilité de tous les producteurs obligatoires |
| Work Activity | Identité, activité, progression | WCF-001 et événements autoritatifs | Lecture partielle existante ; projection complète après qualification Work |
| Work Plan | Identité, cycle, planification, actions | WCF-001, WCF-003, WCF-007 | Après WCF-007 |
| Work Decisions | Identité, décisions, preuves | WCF-001, WCF-004, WCF-005 | Après WCF-005 |
| Work Deliverables | Identité, livrables, preuves | WCF-001, WCF-002, WCF-004 | Après WCF-004 |
| Work People | Identité, People, activité | WCF-001, WCF-006, activité qualifiée | Après WCF-006 et qualification de l'activité |
| Work Sources | Identité, sources, preuves | WCF-001, WCF-004 | Après WCF-004 |

## 5. Graphe canonique des dépendances

```text
Missions ───────────────┐
Monitoring ─────────────┴──> WCF-001 Work Core
                              ├──> WCF-002 Deliverables <── Deliverables
                              ├──> WCF-003 Planning <────── Planning
                              ├──> WCF-004 Evidence <────── Evidence
                              ├──> WCF-005 Decisions <───── Decisions
                              └──> WCF-006 People <──────── People

WCF-003 + WCF-005 ──────────> WCF-007 Actions

WCF-002 + WCF-003 + WCF-004 + WCF-005 + WCF-006 + WCF-007
                              └──> WCF-008 Intelligence <── Intelligence

WCF-001..WCF-008 ───────────> projections consommatrices futures
```

Il n'existe aucune dépendance inverse d'une projection, d'un endpoint ou du Frontend vers l'état métier Work.

## 6. Contrôles de cohérence

| Contrôle | Résultat | Preuve structurelle |
|---|---|---|
| Frontière Work définie | PASS | Sections 1 et 2 de l'architecture |
| Producteur unique ou domaine propriétaire identifié | PASS | WDEP-001 à WDEP-013 |
| Statuts producteurs classifiés | PASS | EXISTING, PARTIAL ou MISSING pour chaque famille |
| Dépendances cycliques | PASS | Graphe orienté du socle vers les producteurs enrichis puis les consommateurs |
| Dépendance à l'UI/BFF/API | PASS | Explicitement interdite |
| MVP minimal identifiable | PASS | WCF-001 uniquement |
| Work Overview prétendu disponible au MVP | PASS | Explicitement interdit avant WCF-008 |
| Nouvelle Capability d'entreprise requise | PASS | Non ; Capability Runtime Work dans le domaine Work existant |

## 7. Verdict

**GO**

La matrice désigne les propriétaires, les directions de dépendance, les données associées, les statuts actuels et l'ordre de construction. Aucun producteur manquant n'est masqué par une fixture, une projection ou une donnée technique approximative.
