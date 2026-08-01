# PEOPLE Persistence Architecture — Master Report

## Synthèse

Le dépôt contient le modèle métier PEOPLE et People Authority, mais aucune persistance PEOPLE exécutable. Les briques Runtime existantes (`NovaCoreStore`, `IntegrationRuntimeRepository`, `ExecutionSessionPersistence`) ne couvrent pas les agrégats métier et ne sont pas compatibles comme source de vérité.

## Architecture finale

SQLite dédiée, deux agrégats (`Business Person`, `Work People`), état courant + histoire append-only, ports PEOPLE, adaptateur SQLite, transactions atomiques, révision optimiste, causalité idempotente, contraintes Owner et replay reconstructible.

## Contradictions traitées

PROGRAM-016 impose un contrat engine-neutral; le choix SQLite est donc local à l’architecture PEOPLE et ne modifie pas PROGRAM-016. Le contrat PEOPLE exige une persistance, mais ne prescrit aucun moteur; aucun nom de base ou schéma n’existait dans le dépôt. Ces éléments sont marqués décisions nouvelles, non faits existants.

## Réutilisation

Réutiliser les patterns de tests, journaux et recovery comme références techniques seulement. Ne pas réutiliser les stores Runtime comme repository PEOPLE, afin d’éviter double vérité et dépendance inverse.

## Ordre d’implémentation

1. schéma/migrations ;
2. ports/adaptateur ;
3. commit atomique et concurrence ;
4. histoire/replay/recovery ;
5. idempotence/causalité/unicité ;
6. preuves et certification P3-PEOPLE-001D.

## Décision finale

**Architecture validée pour lancer la préparation de l’implémentation P3-PEOPLE-001D, sous réserve d’une mission d’écriture séparée à périmètre fermé.** Aucun développement n’est réalisé par la présente mission.

## Contrôles de matérialisation

- Dossier physique : PASS — `Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/` existe.
- Fichiers physiques : PASS — 12/12 fichiers demandés présents.
- Fichiers non vides : PASS — chaque fichier a une taille supérieure à zéro octet.
- `git diff --check` : PASS.
- `git diff --stat` : 2 fichiers suivis déjà modifiés dans le worktree (`server/nova-core/nova-core.mission-file-producer.test.ts`, `server/nova-core/nova-core.mission-file-producer.ts`); les 12 fichiers de ce dossier sont nouveaux et non suivis.
- Hors périmètre de cette mission : aucune modification effectuée; les autres entrées `git status --short` étaient préexistantes dans le worktree.
