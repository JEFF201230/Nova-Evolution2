# RUNTIME-NOVA-CRITICAL-PARTIAL-CLOSURE-003 — Rapport

Date : 2026-07-25

## Résumé exécutif

Les douze NRA classées `PARTIAL` par l’audit indépendant 002 ont reçu une correction minimale dans leur chemin runtime actif et un contre-test ciblé. Les vingt contre-tests bloquants passent.

```text
NRA TOTAL: 23
CLOSED: 23
PARTIAL: 0
OPEN: 0
MISSION RESULT: COMPLETE
```

Ces statuts sont proposés au prochain audit indépendant. Ce rapport ne formule aucune décision GO et n’émet aucun certificat.

## Baseline

```text
Top-level : C:/DEV/NOVA_CORE_MVP_RUNTIME_AUTONOME_2026-07-24(1)/nova-core-mvp
Branche : main
HEAD initial : d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7
Remote : aucun
Worktree initial : non propre, 19 fichiers suivis déjà modifiés
git diff --check initial : code 0
Node : v24.16.0
npm : 11.13.0
pwsh : absent
Windows PowerShell : 5.1.26100.8894
Codex : codex-cli 0.145.0
```

La matrice initiale a été créée dans `RUNTIME_NOVA_CRITICAL_PARTIAL_FIX_MATRIX_003.md` avant toute modification de cette mission.

## Méthode

1. lecture intégrale des six documents imposés ;
2. extraction autoritative des douze NRA `PARTIAL` ;
3. inspection du code actif et des routes montées ;
4. confirmation des contournements initiaux ;
5. correction minimale par chantier ;
6. contre-test après correction sur route, filesystem, processus, Git ou store réel selon le risque ;
7. campagnes historiques et complémentaires ;
8. contrôles de périmètre, secrets et Git.

## Corrections actives

### Autorisation HTTP

`authenticateCertificationAuthority` ne confère plus une permission. `authorizeCertificationAuthority` applique une politique fermée par défaut et exige autorité active, identité concordante, type admis et rôle `CERTIFY`. L’attestation de décision est un HMAC-SHA256 lié aux faits exacts de certification.

La route POST `/api/v1/missions/:projectId/:missionId/certify` effectue successivement authentification, autorisation, validation du payload, vérification d’attestation, relecture des artefacts, contrôle du journal, émission et auto-vérification du certificat.

### Recovery réel

Le moteur inspecte réellement le PID enregistré, ses descendants, le worktree Git, le rapport et les artefacts. Le store contrôle journal, ancre et projection. Tous les signaux faillibles sont tri-état ; `UNKNOWN`, journal invalide, snapshot invalide, artefacts invalides, processus actif ou drift interdisent `resume/recover`.

### READ_ONLY

Le worktree doit être propre avant spawn. Le profil est imposé côté serveur, `changesExpected=false`, l’index Git initial est persisté, et un postflight Git est effectué après exécution indépendamment du contenu du rapport. Toute écriture hors liste canonique exacte lève `NOVA_CORE_READ_ONLY_VIOLATION`, ce qui produit un état technique `FAILED` et interdit la certification.

### Locks Windows

Les scopes TypeScript et PowerShell partagent une sémantique de segments, séparateurs, `.`/`..` et casse Windows. Les comparaisons parent/enfant restent segmentaires afin de ne pas confondre `nova` et `nova-old`.

### Journal et état

Le journal est l’autorité. La projection est reconstruite/vérifiée contre le replay. Une ancre HMAC externe au fichier `runtime.json` scelle le nombre d’événements, le dernier eventId, le dernier hash et le checksum du journal. Une clé externe d’au moins 32 caractères est obligatoire ; aucun checksum recalculable dans le fichier ne vaut signature.

Les mutations d’état passent par l’EventBus. Une projection directe contradictoire et tout événement non-audit après un terminal immuable sont refusés.

### Binding à la certification

Les octets de `prompt.md`, `manifest.json`, `execution-request.json` et `run-binding.json` sont relus au moment exact de la décision. Les hashes sont comparés au report actif et à l’événement `ReportSubmitted`. Une modification du fichier et du hash local stocké ensemble ne suffit pas.

### Bootstrap

Le README actif utilise désormais `npm ci`. Le bootstrap Node/Git/Codex et une installation offline sur copie jetable passent.

## Résultats des tests

| Suite | Code | Résultat |
| --- | ---: | --- |
| `npm.cmd run typecheck:nova-core` | 0 | PASS |
| `npm.cmd test` | 0 | 59/59 (15 orchestrateur + 44 NOVA Core) |
| 5 tests Node journal/état complémentaires | 0 | 5/5 |
| Reporting PowerShell | 0 | 19/19 |
| Runtime E2E PowerShell | 0 | 15/15 |
| PowerShell complémentaires | 0 | 71/71 |
| Syntaxe PowerShell | 0 | PASS |
| `npm ci` offline en répertoire temporaire | 0 | PASS, 6 packages |

Les totaux historiques demandés restent présents : 47/47 Node et 33/33 PowerShell. Aucun test historique n’a été supprimé ou désactivé ; les totaux actuels incluent les nouveaux contre-tests.

## Résultats des 20 contre-tests bloquants

```text
PASS: 20
FAIL: 0
NON EXÉCUTABLE: 0
```

Le détail et les preuves sont dans `RUNTIME_NOVA_CRITICAL_COUNTERTESTS_003.md`.

## Statut des douze NRA traitées

| NRA | Criticité | Statut proposé |
| --- | --- | --- |
| NRA-001 | P0 | CLOSED |
| NRA-007 | P1 | CLOSED |
| NRA-009 | P1 | CLOSED |
| NRA-011 | P1 | CLOSED |
| NRA-013 | P1 | CLOSED |
| NRA-014 | P1 | CLOSED |
| NRA-015 | P1 | CLOSED |
| NRA-017 | P2 | CLOSED |
| NRA-018 | P2 | CLOSED |
| NRA-021 | P2 | CLOSED |
| NRA-022 | P2 | CLOSED |
| NRA-023 | P3 | CLOSED |

Les onze NRA déjà `CLOSED` n’ont pas été rouvertes. Les composants communs touchés étaient des dépendances indispensables des douze NRA ; leurs non-régressions sont documentées dans `RUNTIME_NOVA_CRITICAL_REGRESSION_003.md`.

## Risques résiduels

- Les clés d’attestation du journal et des autorités doivent être protégées par l’environnement opérateur. Le runtime refuse de démarrer ou de valider sans clé suffisante.
- Une inspection processus/Git impossible reste `UNKNOWN` et bloque toute reprise automatique. Ce n’est pas une reprise automatique dégradée.
- L’ancre adjacente au snapshot doit faire partie de la stratégie de sauvegarde. Sa perte est détectée et ne provoque pas une re-signature silencieuse.

Aucun de ces risques ne constitue une voie de contournement équivalente dans le runtime actif.

## Conclusion

Les corrections et preuves requises sont produites. La mission propose la fermeture technique des douze NRA anciennement `PARTIAL`, sous réserve de la décision du prochain audit indépendant.

Aucun commit, aucun push, aucune modification CEREBRAU, aucune modification Pixel Perfect et aucun certificat de production n’ont été produits.

## Contrôles Git finaux

```text
git diff --check : code 0
git rev-parse HEAD : d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7
git branch --show-current : main
git remote -v : aucune sortie
git rev-list --count HEAD : 1, inchangé
```

Le statut final reste non propre conformément à la baseline préexistante. Il contient les corrections runtime non commitées, les livrables historiques déjà non suivis et exactement les quatre livrables `_003` autorisés pour cette mission.
