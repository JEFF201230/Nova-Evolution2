# PEOPLE Persistence Architecture — Rapport maître

## Objet et portée

Ce rapport clôt P3-PEOPLE-PERSISTENCE-ARCHITECTURE-001. Il consolide les onze documents de décision numérotés. La mission est documentaire : aucun code de production, contrat, certification, outil, client ou application n’a été modifié.

## Sources inspectées

- Docs/24_MODULES/WORK/PEOPLE_IMPLEMENTATION_CONTRACT.md ;
- ensemble de server/domain/people, y compris agrégats, People Authority, événements, persistance et tests ;
- PERSISTENCE_CONTRACT.md, TRANSACTION_POLICY.md, TRANSACTION_AND_ROLLBACK_MODEL.md, PERSISTENCE_ENFORCEMENT_TECHNICAL_DESIGN.md, DATA_RETENTION_POLICY.md et PROGRAM_016_PERSISTENCE_STRATEGY.md de PROGRAM-016 ;
- IntegrationRuntimeRepository, JsonRuntimeSnapshotStore, RuntimeSnapshot, RuntimeEvent et append-only-journal ;
- tools/cerebrau/P3-PEOPLE-INFRASTRUCTURE-REUSE-AUDIT-001.md ;
- artefacts présents dans Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE et statut P3-PEOPLE-001D.

## FAITS PROUVÉS

### Contrats

1. PEOPLE_IMPLEMENTATION_CONTRACT retient exactement deux agrégats persistés : BusinessPerson et WorkPeople.
2. WorkPeople est la frontière de cohérence de toutes les affectations d’un Work ; WorkAssignment et RoleAssignment sont des entités internes.
3. People Authority est l’unique producteur de faits PEOPLE.
4. Le contrat exige état durable, histoire, provenance, révision attendue, atomicité, idempotence, récupération et contraintes d’unicité.
5. Un Work accepte zéro Owner, mais jamais plus d’un Owner actif.
6. Le contrat interdit le last-write-wins, la suppression physique de BusinessPerson référencée, WorkPeople et son histoire, et toute vérité issue de Runtime, agent, Session, fixture ou projection.
7. PROGRAM-016 est engine-neutral et exige ownership, transactions explicites, conflit détectable, versionnement, migration, backup/restore et recovery auditable.

### Domaine présent

1. BusinessPerson, WorkPeople, WorkAssignment, RoleAssignment, les Value Objects et People Authority sont matérialisés sous server/domain/people.
2. WorkPeople vérifie en mémoire les identifiants d’Assignment, un Assignment courant par personne et l’Owner unique à la date observée.
3. RoleAssignment supporte plusieurs périodes ordonnées et non superposées.
4. PeopleProvenance fournit authority, businessCause et effectiveAt ; People Authority expose businessCause comme causalité.
5. Une commande People Authority peut produire plusieurs événements avec une même causalité.
6. package.json exige Node ≥ 22 et aucune dépendance npm de base de données ; la persistance actuelle utilise node:sqlite.

### Persistance et réutilisation présentes

1. Les fichiers people-persistence-ports.ts, schema.ts, sqlite-adapter.ts, aggregate-store.ts, history.ts et leurs tests sont suivis par Git.
2. L’adaptateur utilise BEGIN IMMEDIATE, une révision optimiste et une table d’idempotence.
3. Le schéma courant contient état, événements, snapshots, idempotence et version 1.
4. Les composants Runtime inspectés possèdent RuntimeSnapshot/RuntimeEvent et un store JSON, pas les agrégats PEOPLE.
5. Les fixtures frontend et projections ne sont pas des producteurs PEOPLE.
6. Le fichier exact RUNTIME-PEOPLE-PERSISTENCE-REUSE-AUDIT-001_REPORT.md n’a pas été trouvé. Le fichier P3-PEOPLE-INFRASTRUCTURE-REUSE-AUDIT-001.md trouvé est le prompt de mission, pas son rapport.
7. Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001D.certification.json est PENDING_EVIDENCE.

### Écarts statiques de l’implémentation existante

1. uq_people_active_owner porte sur work_assignment_id : il n’interdit pas deux Owners sur deux Assignments du même Work.
2. people_event_history impose UNIQUE(causation_id), incompatible avec plusieurs événements d’une commande.
3. persistWorkPeople supprime physiquement puis réinsère Assignments et rôles.
4. le load WORK_PEOPLE retourne seulement le root sérialisé, sans reconstitution complète.
5. l’idempotence relit le head courant et ne conserve donc pas nécessairement le résultat initial.
6. les événements, l’état agrégat et le reçu ne sont pas engagés par une primitive unique visible.
7. la migration version 1 n’est pas une chaîne version/checksum et rollback détruit toutes les tables.

Ces constats sont issus de l’inspection du code, pas d’une exécution de certification.

## DÉCISIONS D’ARCHITECTURE

| Décision | Justification | Invariant protégé | Alternatives rejetées | Coût/complexité | Impact MVP |
|---|---|---|---|---|---|
| Source PEOPLE unique, état+histoire+reçu cohérents | conforme à l’ownership et permet audit/recovery | aucune double vérité | snapshot Runtime, projection, event-only sans contraintes | vérification de cohérence | lecture et reprise déterministes |
| SQLite dédiée via node:sqlite | déjà disponible, ACID et contraintes sans service | durabilité/atomicité | JSON Runtime, PostgreSQL, event store externe | writer sérialisé | coût d’exploitation minimal |
| Deux ports typés | reflète les deux agrégats | frontières de cohérence | repository générique exposant payload unknown | mapping typé à compléter | migrations d’engine futures sans domaine impacté |
| WorkReference en clé composite | évite collision d’encodage et identifiant parallèle | identité Work stable | concaténation avec :: | FKs/index composites | coût négligeable |
| Commit état+events+receipt+revision | aucun état partiel après crash | atomicité et idempotence | commits séparés/outbox prématuré | transaction plus riche | une réponse durable et rejouable |
| expectedRevision/CAS + BEGIN IMMEDIATE | détecte les lost updates et sérialise le writer | concurrence/Owner | last-write-wins, timestamp, verrou mémoire | contention globale acceptée | adapté au writer unique MVP |
| Révision +1 par commande acceptée | ordre simple et auditable | monotonie | révision par événement | event_ordinal nécessaire | commandes multi-événements cohérentes |
| Reçu avant CAS au replay | récupère une réponse perdue même après mutations ultérieures | idempotence | CAS avant lookup, relecture du head courant | résultat_json durable | retry sûr |
| SHA-256 JSON canonique versionné | comparaison déterministe après restart | causalité non ambiguë | hash opaque fourni sans règle | canonicaliseur testé | pas de dépendance externe |
| Contraintes relationnelles + triggers | dernière barrière hors mémoire | Owner/Assignment/rôle/périodes | validation mémoire seule | schéma plus précis | conflits fermés au commit |
| Histoire append-only, current state sans snapshot supplémentaire | répond état+histoire au coût minimal | audit/rehydration | seconde table snapshot | reducer et contrôles | recovery testable |
| Aucune suppression métier | contrat PEOPLE explicite | histoire et références | delete/rewrite | updates de clôture | stockage croissant mais volume MVP faible |
| Migrations transactionnelles version+checksum | reprise déterministe | compatibilité/histoire | CREATE IF NOT EXISTS monolithique | runner et tests | évolution sûre |
| Recovery fail closed + backup SQLite cohérent | aucune invention après corruption | intégrité | fallback Runtime/projection | runbook et backups | exploitation simple mais explicite |

## HYPOTHÈSES

1. Le MVP exploite un seul service PEOPLE écrivain. Cette hypothèse borne le choix SQLite ; elle devra être réévaluée avant plusieurs writers distribués.
2. Le volume PEOPLE MVP permet un replay exhaustif lors des tests et contrôles de recovery.
3. Les WorkReferences déjà acceptées sont stables, conformément au contrat ; aucune transaction distribuée Work/PEOPLE n’est requise.
4. La précision temporelle métier reste la milliseconde, cohérente avec les Value Objects Date actuels.

Ces hypothèses ne sont pas présentées comme état opérationnel prouvé.

## INCONNUES

1. Existence éventuelle, hors dépôt, d’un fichier SQLite PEOPLE contenant déjà des données.
2. Chemin opérationnel final injecté par la composition et politique de droits du fichier.
3. RPO, RTO, fréquence/rétention des sauvegardes et emplacement de restauration.
4. Volume, débit d’écriture et nombre de lecteurs attendus en production.
5. Exigences légales futures de rétention ou de retrait logique des personnes.

Ces inconnues sont opérationnelles. Si une base de données réelle préexistante est découverte, l’inconnue 1 devient un gate bloquant de M02 jusqu’à inventaire et sauvegarde ; elle ne change pas les décisions structurantes du présent dossier.

## RISQUES RÉSIDUELS

### CRITIQUE

Aucun risque architectural CRITIQUE non résolu. Une histoire corrompue sans sauvegarde intègre deviendrait une perte critique d’information ; l’architecture impose fail closed et sauvegarde, mais ne peut recréer un événement perdu.

### HAUT

- l’implémentation suivie existe avant cette décision et contient des écarts d’unicité, causalité, suppression et reconstitution ; elle ne doit pas être certifiée sans convergence M01 ;
- une base opérationnelle existante non inventoriée pourrait nécessiter une migration de données spécifique ;
- les rapports SUPER-WAVE présents affirment des résultats d’exécution non réexécutés et se contredisent avec P3-PEOPLE-001D PENDING_EVIDENCE ; ils ne constituent pas une certification autoritative.

### MOYEN

- SQLite borne le débit d’écriture à un writer ; dépassement du profil MVP imposera un nouvel adaptateur ;
- RPO/RTO et sauvegardes régulières restent à contractualiser avant production ;
- canonicalisation JSON, upcasting et triggers de périodes exigent des tests de propriétés précis.

### FAIBLE

- le choix du nom de variable/configuration du chemin de base reste un détail de composition ;
- les projections futures devront gérer leurs checkpoints sans devenir source.

## Cohérence des livrables

| Sujet structurant | Décision canonique | Document principal |
|---|---|---|
| source/ownership | état+histoire+reçu PEOPLE, People Authority | 01 |
| ports | BusinessPersonRepository, WorkPeopleRepository | 02 |
| modèle/SQLite/version | modèle relationnel versionné | 03 |
| transaction/concurrence | commit unique, CAS, BEGIN IMMEDIATE | 04 |
| histoire/rehydration | append-only, replay pur | 05 |
| causalité/idempotence/unicité | reçu SHA-256 et contraintes | 06 |
| migration/recovery | versions+checksums, fail closed | 07 |
| certification | matrice complète | 08 |
| frontières | aucun owner externe | 09 |
| implémentation | M01 → M02 → M03 | 10 |

Aucune décision structurante listée par la mission ne reste indéterminée.

## Validations documentaires

Contrôles exécutés depuis la racine du dépôt :

| Contrôle | Résultat | Portée |
|---|---|---|
| présence et non-vacuité des 12 livrables | PASS, 12/12 | tous les fichiers obligatoires existent et contiennent de 82 à 172 lignes |
| git diff --name-only | PASS | exactement les 12 Markdown obligatoires suivis sont modifiés |
| respect du périmètre | PASS | aucune modification suivie sous server, tools, client ou apps ; aucun contrat/certification modifié |
| git diff --check | PASS, exit code 0 | aucune erreur de whitespace dans le diff complet |
| recherche de décision terminale | PASS | une seule décision terminale canonique, dans le présent rapport |
| scan de contradictions structurantes | PASS | SQLite, commit, CAS, Owner, causalité, histoire, migration et recovery concordent entre les documents |
| inventaire Git final | PASS avec réserves préexistantes | des fichiers non suivis hors mission et des rapports SUPER-WAVE non suivis restent présents ; ils ont été préservés |

Git signale que les LF des douze Markdown pourront être convertis en CRLF lors d’une prochaine opération selon la configuration locale. Ce warning n’est pas une erreur de diff et ne change pas le contenu.

Contrôles non exécutés :

- aucune suite de tests de production, car la mission n’a modifié aucun code et ne certifie pas l’implémentation ;
- aucune inspection d’une base PEOPLE déployée, aucun chemin ou artefact de base opérationnelle n’étant fourni dans le dépôt ;
- aucune preuve de backup/restore opérationnel, qui appartient à M02.

Ces contrôles sont explicitement reportés au plan d’implémentation et interdisent de confondre le GO d’architecture avec un GO de certification P3-PEOPLE-001D.

## Décision terminale

GO — PEOPLE PERSISTENCE ARCHITECTURE READY FOR IMPLEMENTATION
