# RUNTIME-NOVA-CERTIFICATION-CLOSURE-001 — Rapport de clôture

Date d'exécution : 2026-07-25

Référence exclusive : `RUNTIME-NOVA-FINAL-CERTIFICATION-AUDIT-001`

HEAD avant et après travaux : `d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7`

## 1. Périmètre réellement traité

La matrice de l'audit indépendant a été lue automatiquement. Elle contenait exactement :

- `OPEN` : NRA-007, NRA-010, NRA-014, NRA-015, NRA-017, NRA-022 ;
- `PARTIAL` : NRA-001, NRA-005, NRA-006, NRA-009, NRA-011, NRA-012, NRA-013, NRA-018, NRA-019, NRA-020, NRA-021, NRA-023 ;
- `CLOSED` et donc figées : NRA-002, NRA-003, NRA-004, NRA-008, NRA-016.

Aucune correction n'a été engagée au titre d'une NRA déjà `CLOSED`. Les chemins communs de l'orchestrateur et du service ont été modifiés uniquement lorsque les NRA restantes exigeaient leur raccordement actif : machine canonique, journal, recovery, locks, observabilité, certification et migrations. Les tests des NRA figées ont été réexécutés sans régression.

## 2. Corrections minimales appliquées

### Certification et liaison des preuves

- Suppression de l'approbation finale anonyme comme voie fonctionnelle ; `/approve` répond désormais `410 APPROVAL_ROUTE_REMOVED`.
- Refus d'une seconde certification avec `409 MISSION_ALREADY_CERTIFIED`.
- Validation runtime stricte du `runId`, du `reportFingerprint` et des champs du payload.
- Relecture et nouvelle empreinte de l'artefact officiel au moment de certifier.
- Vérification de l'existence, de la taille, du SHA-256 et du rattachement au run de chaque fichier réellement modifié.
- Liaison au certificat de la version, du chemin et du SHA-256 du binaire Codex.
- Refus de la configuration utilisateur Codex via `--ignore-user-config`, profil effectif explicite et `--strict-config`.

### Recovery, journal et états

- Routes authentifiées `recovery/reconcile`, `resume`, `abandon`, `quarantine` et `recover`.
- Classification active des runs interrompus selon rapport présent/absent et verrou orphelin.
- Abandon et quarantine explicites, libération de verrou, reprise uniquement depuis `FAILED` ou `TIMEOUT`, attempts persistés.
- Événements actifs hash-chaînés avec `previousHash`, `eventHash`, `schemaVersion` et séquence par mission.
- Vérification de chaîne avant replay ; rejet des séquences manquantes/dupliquées et des événements altérés.
- Sauvegarde refusée si elle tronque ou réécrit l'historique déjà persisté.
- Reconstruction de la projection depuis le journal intègre.
- `canonical-state.ts` est maintenant la porte de transition autoritative ; les projections détaillées d'événement ne peuvent pas contourner cette porte.
- L'API expose aussi la projection `canonicalState`.

### Exécution, scopes et observabilité

- Lecture concurrente de stdout/stderr dans les validations PowerShell, timeout configurable, kill de l'arbre et plafonds séparés.
- Diffusion live et persistée de stdout/stderr expurgés via les événements `ProcessOutput` et le SSE Mission Monitor.
- Diagnostics HTTP complets : code, phase, stdout, stderr, cwd, runId et correlationId.
- Imposition non contournable de `READ_ONLY` pour AUDIT, INSPECTION, REVIEW et ANALYSIS.
- Un prompt personnalisé doit conserver intégralement le contrat de mission généré.
- Détection segment-aware des conflits de locks parent/enfant.
- Grammaire PowerShell de scopes alignée sur les règles exact/glob/récursif et séparateurs Windows du runtime TypeScript.
- Remplacement des chemins mission basés sur `safeName` par un slug lisible muni d'un hash stable.

### Migrations et bootstrap

- Version de données active `v3` avec journal hash-chaîné.
- Migration automatique v0, v1 et v2, conservation des extensions, idempotence et reconstruction.
- Rollback exécutable de la dernière migration avec sauvegarde pré-rollback.
- Les fichiers temporaires d'une migration interrompue ne remplacent jamais le fichier autoritatif.
- Node 22+, Git et Codex sont bloquants au bootstrap.
- Le lanceur ne lance plus `npm install` ; il exige une installation séparée par `npm ci`.

## 3. Preuves exécutées

| Campagne | Résultat |
|---|---:|
| Typecheck NOVA Core | SUCCESS |
| Tests orchestrateur Node | 12/12 |
| Tests NOVA Core Node | 35/35 |
| Total Node demandé | 47/47 |
| PowerShell Reporting | 18/18 |
| PowerShell Runtime E2E | 15/15 |
| Total PowerShell demandé | 33/33 |
| PowerShell Exception Capture | 13/13 |
| PowerShell Governance | 25/25 |
| PowerShell Context Assembly | 23/23 |
| PowerShell Context Runtime | 10/10 |
| Syntaxe PowerShell | SUCCESS |
| `git diff --check` | SUCCESS |

Les scénarios négatifs ajoutés ou renforcés couvrent notamment : report d'un autre run, prompt remplacé, report et livrable altérés, mauvais fingerprint, mauvais runId, double certification, autorité absente, SSE live, diagnostics HTTP, timeout, cancel, arbre de processus, gros stdout/stderr, Codex absent ou trop ancien, READ_ONLY contourné, lock parent/enfant, journal altéré, événement manquant, séquence dupliquée, crash `RUNNING`, rapport présent/absent, verrou orphelin, migration interrompue et rollback.

## 4. Résultat de clôture technique

| Statut issu de l'audit | Avant | Après correction et tests |
|---|---:|---:|
| CLOSED | 5 | 23 |
| PARTIAL | 12 | 0 |
| OPEN | 6 | 0 |

Ce résultat est une clôture technique des corrections et de leurs preuves. Il ne constitue ni une certification, ni une décision `GO`; ces décisions restent explicitement hors de cette mission.

## 5. Risques résiduels

Aucun risque résiduel bloquant identifié dans le périmètre des 18 NRA traitées.

Risques opérationnels non bloquants et explicités :

- le recovery après redémarrage ne réattache jamais automatiquement un ancien processus ; une autorité doit choisir une action, ce qui est volontairement conservateur ;
- un administrateur disposant d'un accès arbitraire au disque pourrait remplacer ensemble données et chaînes de hashes ; le contrôle livré couvre corruption, perte, duplication et réécriture par le runtime, tandis que l'authenticité finale relève du certificat signé ;
- les warnings Git LF/CRLF observés n'ont produit aucune erreur `git diff --check`.

## 6. Respect des interdictions

- aucun commit créé ;
- aucun push réalisé et aucun remote configuré ;
- aucun fichier ou document CEREBRAU modifié ;
- aucune interface Pixel Perfect modifiée ;
- aucune migration destructive lancée sur les données du dépôt ;
- aucune mission certifiée ;
- aucun rapport antérieur modifié.
