# Validation de migration NOVA Runtime

Mission : RUNTIME-NOVA-RELEASE-TRAIN-001  
Date : 25 juillet 2026  
Verdict : **VALIDATED**

## Formats validés

| Source | Traitement | Résultat |
|---|---|---|
| Snapshot v0 sans enveloppe | normalisation v0 → v1 interne → enveloppe v2 | PASS |
| Snapshot v1 historique | normalisation et enveloppe v2 | PASS |
| Journal historique sous forme de tableau | conversion en événements runtime | PASS |
| Journal historique `{ events: [...] }` | conversion en événements runtime | PASS |
| Enveloppe v2 intacte | ouverture idempotente, aucune réécriture | PASS |
| Projection v2 divergente, journal intact | reconstruction + backup | PASS |
| Journal v2 altéré | refus sans réécriture | PASS |

## Invariants vérifiés

- mission historique présente après migration ;
- état `READY` reconstruit depuis `MissionCreated` puis `MissionAccepted` ;
- audit historique conservé ;
- métadonnée inconnue conservée dans `extensions` ;
- compte et ordre des événements conservés ;
- checksums journal et projection valides ;
- sauvegarde rollback créée avant remplacement ;
- deuxième ouverture idempotente ;
- source corrompue inchangée en cas de refus ;
- certificat stocké dans un rapport compatible avec la nouvelle enveloppe.

## Reconstruction

`rebuildRuntimeProjection()` réapplique les événements par mission et par séquence.
Il reconstruit :

- l'état courant de la mission ;
- le `runId` courant ;
- le `reportId` lors de `ReportSubmitted` ;
- la date de dernière mise à jour ;
- la collection d'événements autoritative de la projection.

Les définitions métier, rapports, audits, locks, contextes, files, agents,
observabilité et runs sont préservés pendant la reconstruction.

## Sécurité de migration

- écriture temporaire puis rename atomique ;
- backup source byte-for-byte ;
- SHA-256 sur JSON canonique ;
- refus des versions futures inconnues ;
- refus des événements sans identité ;
- aucune suppression automatique des anciennes données.

## Tests

`server/nova-core/runtime-migration.test.ts` couvre :

1. ouverture automatique v0 avec ancien journal ;
2. migration v1 et idempotence v2 ;
3. reconstruction de projection ;
4. détection de corruption du journal ;
5. présence de la sauvegarde ;
6. conservation des données et extensions.

La suite globale confirme également la persistance standard du service après
redémarrage.

## Rollback

Le plan opératoire est défini dans
`RUNTIME_NOVA_MIGRATION_AND_ROLLBACK_PLAN.md`. Aucun rollback n'a été exécuté sur
les données du workspace ; les tests utilisent exclusivement des répertoires
temporaires isolés.

## Points ouverts

Aucun point ouvert ne bloque la compatibilité des données historiques couvertes.

