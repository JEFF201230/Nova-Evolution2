# RUNTIME-NOVA-AUDIT-001 — Plan d’action priorisé

Date : 24 juillet 2026

## 1. Principes

- une action correspond à une anomalie du rapport ;
- aucune correction n’a été appliquée pendant l’audit ;
- les actions P0/P1 conditionnent toute déclaration de certification ;
- les changements doivent préserver l’autonomie de NOVA et ne pas modifier CEREBRAU.

Échelle d’impact :

- **Très fort** : certification, intégrité ou blocage global ;
- **Fort** : fiabilité d’exécution, reprise ou traçabilité ;
- **Moyen** : robustesse et cohérence ;
- **Faible** : bootstrap ou ergonomie.

## 2. Plan

| Ordre | Anomalie | Priorité | Action unique | Impact estimé | Risque de régression | Validation attendue |
|---:|---|---|---|---|---|---|
| 1 | NRA-001 | P0 | Introduire une décision d’autorité authentifiée contenant `authorityId`, `decision`, `missionId`, `runId`, `reportFingerprint`, `decidedAt` et signature/attestation ; supprimer l’approbation anonyme | Très fort | Élevé | test négatif sans identité/hash ; test hash altéré ; certificat vérifiable |
| 2 | NRA-002 | P1 | Mapper `FinalMissionState`/`TechnicalClassification` vers une transition canonique et interdire `ReportSubmitted` pour `FAILED`/`CANCELLED`/`REJECTED` | Très fort | Élevé | matrice exhaustive des statuts PowerShell vers états NOVA |
| 3 | NRA-003 | P1 | Définir puis appliquer une politique terminale de verrou pour `FAILED`, avec release ou quarantine/recovery explicite | Très fort | Moyen | test réel `RUNNING -> FAILED` confirmant l’état final du verrou |
| 4 | NRA-004 | P1 | Rendre chaque commande service transactionnelle par clone/UoW puis commit atomique, sans sauvegarder les mutations partielles en cas d’échec | Très fort | Élevé | injection d’échec entre assign et lock ; snapshot inchangé |
| 5 | NRA-005 | P1 | Créer un contrat d’erreur structuré de bout en bout avec code, phase, command, cwd, exitCode, stdout/stderr bornés, runId et correlationId | Fort | Moyen | tests Git/spawn/Codex vérifiant la réponse HTTP et le journal durable |
| 6 | NRA-008 | P1 | Transmettre un `runId` au moteur, écrire dans un dossier exact et valider schéma, identité, manifest hash et `ReportFingerprint` avant import | Très fort | Élevé | ancien rapport présent + nouveau run échoué ; l’ancien doit être refusé |
| 7 | NRA-007 | P1 | Persister chaque transition critique et introduire attempts, heartbeat, état interrompu et commande de réconciliation/reprise | Très fort | Élevé | kill du service pendant Codex puis redémarrage contrôlé |
| 8 | NRA-006 | P1 | Publier un flux SSE/WebSocket d’événements structurés : phase, step, elapsed, stdout/stderr redacted, progress et terminal | Fort | Moyen | Mission Execution Monitor alimenté pendant une exécution lente simulée |
| 9 | NRA-010 | P1 | Définir une politique Codex effective : `--ignore-user-config` ou config runtime dédiée, `--strict-config`, environnement allowlisté, chemin/version/hash du binaire et politique réellement supportée | Très fort | Élevé | comparaison de deux postes avec config utilisateur différente |
| 10 | NRA-011 | P1 | Ajouter timeout, annulation, kill d’arbre de processus, limites de sortie et lectures asynchrones concurrentes des flux | Fort | Moyen | tests processus bloqué, sortie > limite, stderr massif, cancel utilisateur |
| 11 | NRA-009 | P1 | Persister et hasher l’ExecutionRequest et le prompt effectif ; refuser un prompt override qui ne conserve pas le contrat mission ou le soumettre à validation explicite | Fort | Moyen | même mission + prompt différent => nouvelle empreinte/attempt |
| 12 | NRA-014 | P1 | Adopter une machine d’état canonique versionnée incluant `CREATED`, `ASSIGNED`, `STARTED`, `RUNNING`, `VALIDATING`, `COMPLETED`, `FAILED`, `CERTIFIED` et sous-étapes | Très fort | Élevé | tests de toutes transitions, replay et compatibilité de migration |
| 13 | NRA-015 | P1 | Remplacer le snapshot seul par un journal append-only intègre avec projections atomiques, sauvegarde, validation schema et détection de corruption | Très fort | Élevé | corruption du snapshot puis reconstruction depuis journal |
| 14 | NRA-012 | P1 | Construire la validation depuis les fichiers réellement changés et une matrice module→tests ; vérifier l’existence/hash des livrables au lieu de recopier les attentes | Fort | Élevé | mutation d’un module hors suite actuelle détectée par le test ciblé |
| 15 | NRA-013 | P1 | Router `AUDIT`/`INSPECTION` vers `READ_ONLY`, forcer `changesExpected=false` et refuser toute delta en lecture seule | Fort | Faible | mission UI AUDIT vérifiant sandbox et zéro changement |
| 16 | NRA-016 | P2 | Ajouter un preflight Git structuré : worktree réel, top-level exact, HEAD requis selon politique, branche, version, codes/sorties et second contrôle juste avant spawn | Moyen | Faible | dépôts absent, bare, unborn, detached et changement de branche concurrent |
| 17 | NRA-017 | P2 | Renforcer les verrous par recouvrement de chemins normalisés et détecter les modifications externes via watcher/ownership ou état exclusif du worktree | Fort | Élevé | scopes parent/enfant et modification humaine pendant le run |
| 18 | NRA-018 | P2 | Définir une grammaire de scope unique ; normaliser un répertoire UI en `directory/**` et partager le matcher entre TypeScript et PowerShell | Moyen | Moyen | tests Windows séparateurs, exact file, directory, glob et négations |
| 19 | NRA-019 | P2 | Remplacer `safeName` seul par slug + hash d’identité et utiliser un contrôle de containment à frontière de chemin/canonical path | Moyen | Moyen | identifiants collisionnels et dépôt frère préfixé refusés |
| 20 | NRA-020 | P2 | Valider tous les payloads API avec un schéma versionné et borné avant toute mutation | Moyen | Faible | corpus de JSON malformés retournant `400/422` sans état partiel |
| 21 | NRA-021 | P2 | Étendre la suite avec tests d’intégration processus/HTTP/crash et un smoke test Codex réel opt-in sur environnement certifié | Fort | Moyen | couverture de toutes les anomalies P0/P1 et artefact de smoke signé |
| 22 | NRA-022 | P2 | Porter dans NOVA les primitives CEREBRAU de journal projectionnel, replay, attempts, drift, fingerprint, report review et control, sans appeler CEREBRAU actif | Très fort | Élevé | scénarios équivalents aux tests Campaign Runner sur runtime NOVA |
| 23 | NRA-023 | P3 | Vérifier Node `>=22`, utiliser `npm ci` avec lock immuable et séparer installation du démarrage | Faible | Faible | démarrage refusé sous Node ancien ; install reproductible |

## 3. Lots recommandés

### Lot A — Barrière de certification

Actions 1, 2, 6, 12 et 13.

Critère de sortie : aucune transition `CERTIFIED` sans rapport identifié, fingerprint vérifié, autorité authentifiée et journal reconstructible.

### Lot B — Robustesse d’exécution

Actions 3, 4, 7, 9 et 10.

Critère de sortie : kill/restart, timeout, conflit de verrou et échec Codex aboutissent tous à un état durable, cohérent et récupérable.

### Lot C — Observabilité

Actions 5 et 8.

Critère de sortie : l’interface reçoit en direct la phase, l’étape, la durée, les sorties redacted, le code retour et le statut terminal.

### Lot D — Déterminisme et validation

Actions 11, 14, 15, 16, 17, 18, 19 et 20.

Critère de sortie : une exécution peut être reproduite depuis ses entrées persistées et aucun effet extérieur ne peut être attribué silencieusement à la mission.

### Lot E — Parité CEREBRAU et qualification

Actions 21, 22 et 23.

Critère de sortie : matrice de scénarios NOVA/CEREBRAU verte, smoke Codex réel disponible et bootstrap reproductible.

## 4. Ordre de validation finale

1. tests unitaires des contrats ;
2. tests d’intégration avec faux processus contrôlable ;
3. tests crash/restart et corruption ;
4. tests de sécurité de l’approbation ;
5. tests de parité avec les scénarios CEREBRAU, sans modifier CEREBRAU ;
6. smoke test Codex CLI réel sur worktree jetable ;
7. audit indépendant du certificat et de la chaîne de preuve ;
8. décision de levée du statut **NON CERTIFIABLE**.

