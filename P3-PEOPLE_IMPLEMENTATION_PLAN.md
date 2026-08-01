# P3-PEOPLE-IMPLEMENTATION-PLANNING-001

## Décision de planification

**IMPLEMENTATION PLAN READY**

Ce document est exclusivement un plan. Aucun code, contrat certifié, blueprint ou fichier de certification n’est modifié.

## Constats bloquants autoritatifs

Les rapports `P3-PEOPLE-001D_CERTIFICATION_REPORT.md` et `P3-PEOPLE-001D_FINAL_DECISION.md` établissent :

- `P3-PEOPLE-001D` est `NO GO` et reste `PENDING_EVIDENCE` ;
- la persistance canonique Business Person / Work People est absente ;
- aucune projection/persistance exécutable ne démontre durabilité, histoire, atomicité, unicité et concurrence ;
- les bridges Intake, Criteria et Certification existent et sont testés, mais ne sont pas raccordés à une entrée de production hors tests.

## Cartographie des composants

| Élément | Nécessité | Existe déjà | Manque | Criticité |
|---|---|---|---|---|
| Modèle People | Base des agrégats et invariants | `server/domain/people/business-person.aggregate.ts`, `work-people.aggregate.ts`, entités, value objects, erreurs | Aucun manque bloquant identifié | Haute — prérequis déjà établi |
| Producteur autoritatif | Source unique des intentions People | `server/domain/people/people-authority.ts`, événements et commandes de l’autorité | Aucun manque bloquant identifié | Haute — prérequis déjà établi |
| Persistance canonique | Durabilité, reconstitution, audit et reprise | Aucun repository/store People | Store des agrégats, historique, provenance, révision et idempotence | Critique |
| Atomicité | Aucun état partiel, aucun double Owner observable | Invariants présents dans le modèle, non matérialisés durablement | Unité transactionnelle Business Person/Work People et échec sans événement partiel | Critique |
| Unicité | Garantir les identifiants et Owners uniques | Règles métier déclarées dans le contrat | Contraintes durables et contrôles concurrents | Critique |
| Concurrence | Refuser les révisions obsolètes et conflits | Erreurs métier prévues, pas de stockage concurrent | Contrôle de révision, sérialisation Work People, idempotence de causalité | Critique |
| Projections / requêtes | Lecture depuis la source autoritative | Aucune projection ou query People | Neuf requêtes contractuelles, index reconstructible éventuel, cohérence et historique | Haute |
| Commandes | Ouvrir les écritures internes prévues | Commandes/types d’autorité existants, pas de chemin persistant certifié | Command handlers internes, effets, erreurs, événements et idempotence | Haute |
| Intégration Work | Lire People sans duplication | `server/runtime/work/work-core-foundation.ts` et tests Work | Adaptateur interne Work/People, WorkReference, états d’absence, non-duplication | Haute |
| Bridges Mission | Preuve d’intégration au pipeline | `server/nova-core/domain-v2-mission-intake-bridge.ts`, `domain-lot-criteria-evaluator.ts`, `domain-v2-mission-certification-integration.ts` | Appel depuis une composition de production hors tests | Critique — dépendance Framework |
| Certification P3-D | Autoriser le lot suivant | JSON de certification encore vide | Rapport, Evidence, Tests, regressions et décision GO conformes après preuves | Critique |

## Contrats concernés

- `Docs/24_MODULES/WORK/PEOPLE_IMPLEMENTATION_CONTRACT.md` : persistance, atomicité, historique, unicité, concurrence, migration, requêtes, tests et gates D à H.
- `server/nova-core/people-lot-machine-contract.ts` : préconditions, postconditions, invariants et identifiant `P3-PEOPLE-001D`.
- `server/nova-core/people-lot-runtime-execution-contract.adapter.ts` : frontière PEOPLE/runtime, à réutiliser sans dépendance inverse.
- `server/nova-core/domain-v2-mission-intake-bridge.ts`, `domain-lot-criteria-evaluator.ts`, `domain-v2-mission-certification-integration.ts` : bridges certifiés par tests, non à refondre.

## Projections et persistances à produire

La persistance canonique doit porter uniquement Business Person, Work People, leur histoire, provenance et révision. Elle ne doit pas persister Work, Mission, RuntimeAgent, Session, Decision ou Deliverable. Les projections/index éventuels sont reconstructibles, sans écriture métier directe et sans statut de source concurrente.

## Graphe de dépendances

```text
P3-PEOPLE-001B Foundation GO
        ↓
P3-PEOPLE-001C Authority GO
        ↓
P3-PEOPLE-001D Persistence GO
        ↓
P3-PEOPLE-001E Commands GO
        ↓
P3-PEOPLE-001F Queries GO
        ↓
P3-PEOPLE-001G Work Integration GO
        ↓
P3-PEOPLE-001H Certification GO
```

Prérequis transversal indépendant :

```text
Framework production composition
  └─ raccorde Intake → Criteria → Certification → policy CEREBRAU
     (aucune modification autorisée dans ce plan PEOPLE)
```

Le raccordement Framework doit être résolu ou explicitement accepté par le Program Director avant de déclarer l’intégration complète. Il ne doit pas être implémenté dans un lot PEOPLE.

## Micro-missions et ordre optimal

### M1 — P3-PEOPLE-001D-PERSISTENCE

- Fichiers proposés : nouveaux modules internes sous `server/domain/people/` et tests ciblés ; aucun fichier Runtime/Framework.
- Dépendances : modèle B et autorité C certifiés.
- Travaux : repository/store canonique, historique, provenance, révision, migration vérifiable et idempotence.
- Preuves : reconstitution, atomicité, historique, interdiction de suppression physique, unicités, concurrence et migration réversible.
- GO : toutes les invariants D, tests d’agrégats/persistance/concurrence, typecheck, Core, Runtime et `git diff --check` PASS ; rapport GO.
- Criticité : CRITIQUE.

### M2 — P3-PEOPLE-001E-COMMANDS

- Fichiers proposés : handlers de commandes internes People et tests ciblés sous `server/domain/people/`.
- Dépendances : M1 GO.
- Travaux : commandes autorisées, préconditions, erreurs, causalité, événements canoniques, absence d’effet en échec.
- Preuves : succès/échec, doublons, suspension/reprise/clôture, remplacement, idempotence et ordre événementiel.
- GO : commandes conformes au contrat sans API/BFF/Work, validations complètes PASS ; rapport GO.
- Criticité : HAUTE.

### M3 — P3-PEOPLE-001F-QUERIES

- Fichiers proposés : queries internes et tests ciblés sous `server/domain/people/` ; index reconstructible seulement si nécessaire.
- Dépendances : M2 GO.
- Travaux : neuf requêtes contractuelles, filtres par rôle/Owner, histoire et source autoritative.
- Preuves : résultats courants, collections vides, absences, historique complet, cohérence après reconstitution.
- GO : aucune logique métier consommatrice ni exposition publique ; validations PASS ; rapport GO.
- Criticité : HAUTE.

### M4 — P3-PEOPLE-001G-WORK-INTEGRATION

- Fichiers autorisés à préciser dans la mission : adaptateur interne People/Work et tests ; `server/runtime/work/work-core-foundation.ts` ne doit être modifié que si strictement indispensable et explicitement autorisé.
- Dépendances : M3 GO et Work Foundation inchangé.
- Travaux : lecture par WorkReference, quatre états d’absence, participants/Owner, provenance, non-duplication et séparation Technical Agent.
- Preuves : Work zéro People, People indisponible, Work inconnu, participants, Owner, non-duplication et non-régression Work/Runtime.
- GO : Work lit la source People sans copie et les sept domaines Phase 1 restent inchangés ; validations PASS ; rapport GO.
- Criticité : HAUTE.

### M5 — P3-PEOPLE-001H-CERTIFICATION

- Fichiers autorisés : rapport de certification et artefacts de preuve ; aucun changement de contrat ou Framework.
- Dépendances : M1 à M4 GO et raccordement Framework résolu/accepté.
- Travaux : compiler Evidence/Tests, exécuter les non-régressions, vérifier transitions et projections, soumettre la décision CEREBRAU.
- Preuves : rapport officiel, chaîne d’événements, invariants, persistance, queries, Work, Runtime, Core, CEREBRAU et `git diff --check`.
- GO : conformité complète, aucune régression, certification P3-PEOPLE-001D GO et ouverture autorisée du lot suivant.
- Criticité : CRITIQUE.

## Estimation

- Micro-missions PEOPLE : **5** (M1 à M5).
- Prérequis Framework externe : **1** décision/raccordement, non inclus dans les 5 lots et non implémentable dans le périmètre PEOPLE.
- Parallélisme : aucun entre M1–M4 ; M5 est terminale. Seules les validations de chaque lot peuvent être parallélisées après stabilisation de son code.

## Critères communs GO

Chaque micro-mission doit respecter simultanément : liste de fichiers fermée, contrats certifiés inchangés, absence de dépendance runtime inverse, typecheck PASS, tests ciblés PASS, tests Core/Runtime applicables PASS, CEREBRAU PASS, `git diff --check` PASS, rapport unique et décision GO explicite. Tout échec ou toute extension de périmètre produit NO GO et bloque le lot suivant.

