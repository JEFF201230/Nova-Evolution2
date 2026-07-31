# PROGRAM RC1 — Rapport de certification

Date de certification : 2026-07-28 (Europe/Paris)  
Mode : MVP, réduction des coûts, lecture seule, zéro régression  
Décision : `RC1_NO_GO_MVP_PRODUCTION`

## 1. Résumé

Le code testé présente une couverture unitaire importante et les tests Core, Runtime et Kernel passent. Le serveur déclaré démarre, répond à `/health`, persiste une mission locale et la recharge après redémarrage.

Le RC ne peut toutefois pas être mis en production :

- le contenu candidat n'est pas un commit propre et contient 21 fichiers modifiés ainsi que 98 entrées non suivies dans `git status`;
- il n'existe ni build de production racine ni artefact serveur autonome : le démarrage exécute les sources TypeScript avec la dépendance de développement `tsx`;
- l'entrée HTTP réellement démarrée n'utilise pas `ProgramProductionEntrypoint`, `ProductionAuthenticator` ni `WorkspaceSecurityValidator`;
- `POST .../execute` est accessible sans authentification et le CORS est `*`;
- le smoke réel READ_ONLY échoue avant transport sur `NOVA_CORE_CONTEXT_SOURCE_OUT_OF_SCOPE`;
- aucun appel Codex réel et aucun appel Runtime certifié n'ont donc été observés;
- aucun scénario Playwright n'existe;
- la configuration de production, les sauvegardes automatiques, le drain global, le service non privilégié et HTTPS ne sont pas fournis sous forme déployable;
- le package Web a 296 erreurs de lint et 9 vulnérabilités `high` dans sa chaîne de développement selon `npm audit`.

Ces constats sont des échecs observés. La décision est donc NO_GO et non BLOCKED.

## 2. Identité du Release Candidate

| Élément | Valeur certifiée |
|---|---|
| Repository | `C:\DEV\NOVA_CORE_MVP_RUNTIME_AUTONOME_2026-07-24(1)\nova-core-mvp` |
| Branche | `feature/nova-core-manager` |
| HEAD | `7db9658902adf0496a8f681afbfbd3f19d21d7cc` |
| Commit | `feat(core): establish NOVA Core Manager foundation` |
| Worktree | DIRTY |
| Fichiers suivis dans l'empreinte | 1 754 |
| Fichiers non suivis, non ignorés, dans l'empreinte | 109 |
| Total de fichiers dans l'empreinte | 1 863 |
| Taille totale | 84 711 842 octets |
| Empreinte de contenu SHA-256 | `956d83a6d9a626b661d2f1348b96f8560068ead5e880907ded0fbc2eb2d21311` |
| Empreinte `git status --porcelain=v1 -z` | `a617219f970f881edd71302e78edea0bf618783501c3551b3eed10dde249ae69` |

### Règle d'inclusion déterministe

L'empreinte a été calculée avant création des présents rapports sur la sortie NUL de :

```text
git ls-files -z -c -o --exclude-standard
```

Pour chaque chemin, le SHA-256 des octets du fichier est calculé. Les chemins Git normalisés avec `/` sont triés par ordre binaire UTF-8. Le manifeste logique contient une ligne UTF-8 :

```text
<sha256 minuscule><deux espaces><chemin Git><LF>
```

Le SHA-256 de la concaténation est l'empreinte de contenu ci-dessus.

### Inclus

- tous les 1 754 fichiers suivis;
- tous les 109 fichiers non suivis et non ignorés présents lors de la certification;
- les packages racine et `apps/nova-web`;
- `server/nova-core`, `server/runtime`, `tools/nova-core-runtime`;
- les sources, tests, scripts, fichiers de verrouillage, documentation et artefacts Web suivis;
- le fichier non ignoré sous `.nova-data-backup`, puisqu'aucune règle RC ne l'exclut.

### Exclus

- `.git/**`;
- les fichiers ignorés par Git : `node_modules/**`, `.nova-data/**`, `.env.local`;
- les fichiers temporaires de build, smoke et restauration créés sous le répertoire temporaire système puis supprimés;
- les dix rapports `PROGRAM_RC1_*.md`, exclus par nom de l'empreinte du RC afin que leur production ne modifie pas le contenu certifié.

Cette règle identifie exactement le worktree testé, mais ne rend pas le RC déployable : aucun manifeste versionné ni artefact immuable ne lie ces 109 fichiers non suivis à une release.

## 3. Packages, versions et points d'entrée

| Élément | Résultat |
|---|---|
| Package racine | `nova-core-mvp@0.1.0`, lockfile v3 |
| Package Web | `nova-web`, lockfile v3 |
| Node observé | `v24.16.0` |
| npm observé | `11.13.0` |
| Contrainte Node | `>=22`, non épinglée |
| TypeScript racine installé/verrouillé | `5.9.3` |
| `tsx` racine installé/verrouillé | `4.23.0` |
| Entrée serveur déclarée | `node --import tsx server/nova-core/nova-core.server.ts` |
| Entrée Program sécurisée | `server/nova-core/program-production-entrypoint.ts`, non câblée au serveur |
| Entrée Runtime locale | `tools/nova-core-runtime/Invoke-NovaCoreMission.ps1` |
| Entrée Web | `apps/nova-web/src/main.tsx`, artefact Vite |
| Build serveur racine | ABSENT |
| Build Web | PASS vers un répertoire temporaire |

Les dépendances Runtime et Kernel sont des modules TypeScript internes sous `server/runtime`; il n'existe pas de package ou d'artefact Kernel séparé. La production racine dépend de `tsx`, déclaré en `devDependencies`.

## 4. Preuves d'exécution

| Contrôle | Résultat | Preuve |
|---|---|---|
| TypeScript Core/Runtime | PASS | `npm run typecheck:nova-core`, code 0 |
| Tests NOVA Core | PASS | 503/503, 0 échec |
| Tests Runtime déclarés | PASS | 15/15, 0 échec |
| Tests Runtime complets, Kernel inclus | PASS | 273/273, 0 échec |
| Bootstrap Kernel déclaré | PASS | 8/8, 0 échec |
| Syntaxe Runtime PowerShell | PASS | code 0 |
| E2E Runtime PowerShell | PASS | 15/15 scénarios |
| TypeScript Web | PASS | code 0 |
| Tests Web | PASS | 25 fichiers, 143 tests |
| Lint Web | FAIL | 296 erreurs |
| Build Web | PASS | 3 artefacts, build temporaire supprimé |
| E2E Playwright Web | NON DISPONIBLE | répertoire configuré sans aucun scénario |
| Audit npm racine | PASS | 0 vulnérabilité connue |
| Audit npm Web | FAIL | 9 vulnérabilités `high`, 0 `critical` |
| Installation propre reproductible | NON DÉMONTRÉE | installation interdite par la mission |
| Build serveur de production | FAIL | aucun script ni artefact |

Aucun package n'a été installé ou ajouté.

## 5. Smoke et persistance

### Démarrage simple

- démarrage réel de `nova-core.server.ts` : PASS;
- `GET /health` : `{"status":"ok","service":"nova-core","memory":"durable-json"}`;
- création, assignation et persistance d'une mission temporaire : PASS;
- redémarrage et reconstruction de la mission `LOCKED` : PASS;
- appels Codex : 0;
- appels Runtime : 0.

### Smoke réel READ_ONLY

Un seul run a été lancé par l'API réelle avec le profil `READ_ONLY`, Codex CLI `0.145.0`, modèle résolu `gpt-5.6-sol` et sandbox résolu `read-only`.

Résultat :

- un appel au Runtime PowerShell déclaré;
- échec pendant `CONTEXT_ASSEMBLY`;
- raison : le fichier de mission placé sous le stockage temporaire d'exécution est rejeté comme hors périmètre;
- `CODEX_EXECUTION_STARTED` : 0;
- `CODEX_EXECUTION_FINISHED` : 1, synthétique, statut FAILURE;
- appel Codex réel : 0;
- appel Runtime certifié : 0;
- preuve de livrable : 0;
- certification : 0;
- dérive Git avant/après : aucune;
- retry : aucun.

### Sauvegarde/restauration simulée

Après arrêt du service :

- copie locale de `runtime.json`, de son ancre et du répertoire d'exécution : 29 ms;
- copie de restauration : 21 ms;
- service restauré : santé PASS;
- même MissionId, RunId, ReportId et état `SUBMITTED` retrouvés;
- journal : 47 entrées.

Cette mesure valide une copie/restauration locale minuscule. Elle ne valide ni un transfert hors instance, ni le chiffrement, ni la rétention, ni la reconstruction d'un transport interrompu.

## 6. Évaluation par lot

| Lot | Verdict | Motif principal |
|---|---|---|
| 1 — Périmètre RC | FAIL | worktree non propre, contenu non suivi, aucun artefact immuable |
| 2 — Build reproductible | FAIL | aucun build serveur; installation propre non démontrée; E2E Web absent |
| 3 — Configuration MVP | FAIL | configuration production non exhaustive et fallbacks de développement actifs |
| 4 — Architecture minimale | PARTIAL | architecture mono-instance possible, mais non fournie ni validée sur cible |
| 5 — Dimensionnement/coûts | PASS DOCUMENTAIRE | trois niveaux économiques définis, sans autorisation de déployer |
| 6 — Observabilité minimale | FAIL | événements internes présents, mais logs opérables/rotation/alertes absents |
| 7 — Sauvegarde/restauration | FAIL | restauration locale partielle seulement; aucune sauvegarde automatique |
| 8 — Rollback | FAIL | runbook défini, mais aucun artefact précédent déployable ni drain global |
| 9 — Sécurité | FAIL | execute non authentifié, HTTP direct, CORS `*`, entrypoint sécurisé non câblé |
| 10 — Smoke release | FAIL | transport non atteint; 0 appel Codex; 0 Runtime certifié |

## 7. Régressions et écarts critiques

1. `nova-core.server.ts` importe le serveur HTTP historique et non `ProgramProductionEntrypoint`.
2. `ProgramProductionEntrypoint` est OFF par défaut et n'a aucun réglage d'environnement dans le serveur.
3. L'API d'exécution ne demande pas d'identité de production.
4. Le bootstrap génère et persiste une clé d'attestation si elle manque, sans distinction production/développement.
5. Les chemins de production ont des fallbacks vers le répertoire courant.
6. Le serveur ouvre HTTP; HTTPS dépend d'un reverse proxy qui n'est pas fourni.
7. Les logs de démarrage sont des chaînes non structurées.
8. Aucun mécanisme fourni ne réalise rotation, contrôle disque ou alerte critique.
9. Aucune procédure existante ne sauvegarde automatiquement l'état cohérent complet.
10. L'absence d'artefact serveur interdit un rollback reproductible.

## 8. Intégrité de la mission

- modification source : aucune;
- modification Runtime : aucune;
- modification Kernel : aucune;
- installation/package ajouté : aucun;
- commit : aucun;
- push : aucun;
- infrastructure cloud : aucune;
- secret réel dans les rapports : aucun;
- fichiers temporaires : supprimés.

## Conclusion

RC1_NO_GO_MVP_PRODUCTION
