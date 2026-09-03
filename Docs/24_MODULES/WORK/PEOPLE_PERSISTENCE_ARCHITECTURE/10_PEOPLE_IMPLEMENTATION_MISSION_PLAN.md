# PEOPLE — Plan minimal d’implémentation P3-PEOPLE-001D

## Principe de découpage

L’état, l’histoire, le reçu, la révision et les contraintes forment une seule unité atomique. Ils ne sont donc pas répartis en lots prétendument indépendants. Le plan comporte deux micro-missions de réalisation séquentielles et une mission de certification.

L’implémentation existante est réutilisée après audit ligne à ligne ; aucun fichier n’est conservé uniquement parce qu’il existe.

## D-01 — Convergence du noyau transactionnel PEOPLE

| Champ | Contenu |
|---|---|
| Identifiant | P3-PEOPLE-001D-M01 |
| Objectif unique | rendre le commit BusinessPerson/WorkPeople conforme, atomique, reconstructible et durable |
| Dépendances | P3-PEOPLE-001C GO ; présent dossier d’architecture ; liste de fichiers fermée |
| Fichiers potentiels | people-persistence-ports.ts, people-persistence-schema.ts, people-persistence-sqlite-adapter.ts, people-persistence-aggregate-store.ts, people-persistence-history.ts, leurs tests ; index.ts seulement si export indispensable ; un mapper/rehydrator ou type d’erreur PEOPLE seulement si absent |
| Invariants | ownership, deux agrégats, CAS, Owner unique par Work, Assignments/rôles/périodes, append-only, causalité multi-événements, idempotence, aucune suppression |
| Tests obligatoires | création, modification, load complet, multi-événements, rollback injecté, deux connexions, stale revision, replay exact/divergent, contraintes SQL directes, rehydration/restart |
| Critères GO | ports typés ; modèle v1 canonique ; un seul commit état+events+receipt ; toutes contraintes prouvées ; aucun DELETE métier ; aucune dépendance interdite ; tests ciblés et typecheck PASS |
| Parallélisation | non pour le code : schéma, ports, mapping et commit se modifient mutuellement ; préparation de fixtures de tests possible sans merge séparé |

Approche REUSE → COMPLETE :

- réutiliser node:sqlite, agrégats, événements et tests utiles ;
- remplacer/corriger les contraintes et contrats insuffisants ;
- ne créer un nouveau module que si une responsabilité absente ne peut être nommée clairement dans les fichiers existants.

## D-02 — Migrations, intégrité et recovery

| Champ | Contenu |
|---|---|
| Identifiant | P3-PEOPLE-001D-M02 |
| Objectif unique | rendre l’évolution et la reprise de la source PEOPLE déterministes |
| Dépendances | M01 GO et schéma canonique stabilisé |
| Fichiers potentiels | people-persistence-schema.ts ou un unique people-persistence-migrations.ts si la chaîne ne tient plus clairement dans le schéma ; people-persistence-history.ts/recovery ; tests migration/recovery |
| Invariants | version/checksum, aucune perte d’identité/histoire, une seule source active, fail closed, backup/restore |
| Tests obligatoires | migration vide, idempotente, checksum divergent, interruption injectée, version inconnue, quick/integrity/foreign-key checks, backup/restore, corruption head/event/receipt, redémarrage |
| Critères GO | chaîne versionnée ; pré/postflight ; recovery documenté et testé ; aucune migration destructive non récupérable ; replay = état restauré |
| Parallélisation | non avec M01 ; scénarios de corruption peuvent être préparés en parallèle après gel du schéma |

Avant M02, déterminer factuellement s’il existe une base PEOPLE avec données hors dépôt. Si oui, son chemin et sa sauvegarde entrent dans le périmètre d’une migration autorisée ; si non, aucune importation legacy n’est créée.

## D-03 — Certification P3-PEOPLE-001D

| Champ | Contenu |
|---|---|
| Identifiant | P3-PEOPLE-001D-M03 |
| Objectif unique | produire les preuves de conformité et la décision du lot |
| Dépendances | M01 et M02 GO |
| Fichiers potentiels | tests PEOPLE strictement nécessaires et rapport/certification explicitement autorisés par une mission distincte ; aucun code fonctionnel nouveau |
| Invariants | totalité du contrat et des frontières |
| Tests obligatoires | matrice 08 complète ; People, Work, Runtime, Core, typechecks, contrôles CEREBRAU applicables, git diff --check |
| Critères GO | toutes validations obligatoires PASS ; rapport sans contradiction ; P3-PEOPLE-001D seulement alors certifiable |
| Parallélisation | exécution des suites indépendantes possible après gel complet du code ; synthèse et verdict uniques |

Un échec Framework/CEREBRAU ne peut pas être masqué par une modification hors périmètre. Il bloque la certification jusqu’à une mission autorisée distincte.

## Fichiers et zones interdits

Sauf nouvelle mission explicitement autorisée, ne pas modifier :

- server/runtime, server/nova-core et server/nova-bff ;
- tools et CEREBRAU ;
- apps, client, frontend ;
- contrats, blueprints et certifications existants ;
- Work, Mission Engine, API, BFF, OFFER ou intégrations aval.

## Gates communs

Chaque micro-mission :

- capture le git status initial ;
- fixe les fichiers autorisés avant écriture ;
- prouve les invariants avant de revendiquer GO ;
- exécute git diff --check ;
- liste les commandes et leur résultat réel ;
- préserve les changements préexistants ;
- retourne un seul verdict et bloque la suivante en cas d’échec.

## Pas de missions supplémentaires par défaut

Un ORM, un outbox consommateur, une API, une projection, un dashboard, PostgreSQL ou une intégration Work ne fait pas partie de P3-PEOPLE-001D. Leur éventuelle création exige une preuve de besoin et une mission ultérieure.
