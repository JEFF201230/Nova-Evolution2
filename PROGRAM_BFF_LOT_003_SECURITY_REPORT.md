# PROGRAM-BFF-LOT-003 — RAPPORT DE SÉCURITÉ

Date : `2026-07-28`  
Périmètre : Gateway interne Secure BFF vers
`ProgramProductionEntrypoint`

## Synthèse

Le Gateway est interne, sans route, sans client réseau, sans dépendance React et
sans accès direct au Runtime. L’unique invocation est
`RuntimeGatewayAdapter -> ProgramProductionEntrypointPort.execute`.

Le test de frontière parcourt tous les modules BFF de production et prouve :

- aucun import React ;
- aucun import `server/runtime` ;
- aucun import NOVA Core ou domaine certifié ;
- aucun `fetch`, `node:http` ou `node:https` dans les modules Gateway ;
- exactement un site d’appel `.entrypoint.execute`, dans
  `runtime-gateway.adapter.ts` ;
- six routes publiques inchangées.

## Protection du Runtime

L’adaptateur ne construit pas le Runtime et ne remplace aucune de ses garanties.
L’instance certifiée de `ProgramProductionEntrypoint` doit être injectée par la
composition hôte. Son pipeline, son authentification de production, son
workspace security, sa provenance Git, sa persistance, ses preuves et sa
certification restent les autorités.

L’entrypoint désactivé retourne `null`; ce cas est transformé en
`503 RUNTIME_UNAVAILABLE` et n’est jamais présenté comme un succès.

## Validation fail-closed

Le contrat d’entrée refuse :

- objets absents ou clés supplémentaires ;
- statuts autres que `VALID` et `RESOLVED` ;
- artefacts manquants ;
- incohérences de mission ;
- identifiants, timestamps, signatures et métriques invalides ;
- options d’exécution incomplètes ou inattendues ;
- payload non sérialisable, cyclique, trop profond ou supérieur à 2 MiB.

Une copie profonde immuable est envoyée à l’adaptateur. Les mutations ultérieures
du DTO BFF ne peuvent donc pas modifier l’appel Runtime.

Le contrat de sortie exige simultanément :

```text
ExecutionSession.status = COMPLETED
RuntimeResult.status = SUCCESS
Certification.decision = GO
ValidationStatus = VALID
MissingArtifacts = []
BundleFingerprint = Certification.bundleFingerprint
missionId cohérent de bout en bout
```

## Corrélation et timeout

Le Correlation ID est validé puis propagé dans un `AsyncLocalStorage` limité à
l’appel de l’entrypoint. Le test vérifie sa présence pendant l’appel et son
absence après résolution, empêchant une fuite de contexte entre requêtes.

Le timeout :

- est indépendant du timeout métier porté par la requête ;
- rejette par `504 RUNTIME_TIMEOUT` ;
- déclenche l’`AbortSignal` transmis à l’entrypoint ;
- libère systématiquement son timer.

## Erreurs et redaction

Les codes réseau reconnus deviennent `503 RUNTIME_UNAVAILABLE`. Les erreurs
Runtime inconnues deviennent `502 RUNTIME_ERROR`. Les statuts HTTP remontés par
un hôte sont transformés sans conserver leur body.

Les réponses BFF ne contiennent pas :

```text
prompt
authentication
signature
workspace
executionSession
evidenceBundle
persistedRecords
runtimeResult.result
stack
cause
message Runtime original
```

## Empreintes protégées

Périmètre hérité du lot 002 :

- `apps/nova-web` ;
- `server/runtime` ;
- `program-production-entrypoint.ts` ;
- `human-approval-workflow.ts` ;
- `certified-integration-service.ts` ;
- `mission-evidence-certifier.ts`.

```text
PROTECTED_FILE_COUNT: 281
FINGERPRINT_BEFORE: 98d0cd82a16a9170da5e414edf65df4da809934c5f1a7062598e935b65efe06b
FINGERPRINT_AFTER: 98d0cd82a16a9170da5e414edf65df4da809934c5f1a7062598e935b65efe06b
FINGERPRINT_UNCHANGED: YES
PACKAGE_LOCK_SHA256: c852dc778948bd2720ada07634dc4ffc245f3803c5ffe2e2fc48da829a36891f
PACKAGE_ADDED: NO
LOCKFILE_MODIFIED: NO
FRONTEND_MODIFIED: NO
RUNTIME_MODIFIED: NO
PROGRAM_PRODUCTION_ENTRYPOINT_MODIFIED: NO
HUMAN_APPROVAL_MODIFIED: NO
EVIDENCE_MODIFIED: NO
CERTIFICATION_MODIFIED: NO
KERNEL_MODIFIED: NO
COMMIT: NO
PUSH: NO
```

Le worktree contenait déjà des modifications et créations hors périmètre. Elles
ont été préservées.

Résultat sécurité : `PASS`
