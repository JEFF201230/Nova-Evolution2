# P3-PEOPLE-001E-M01 — PEOPLE INTERNAL WRITE PATH

## Composants réutilisés

- Les 10 commandes canoniques de `people-authority.commands.ts`.
- Les 13 événements canoniques de `people-authority.events.ts`.
- `PeopleAuthority`, unique frontière de décision métier PEOPLE.
- Les ports `BusinessPersonRepository` et `WorkPeopleRepository` de `people-persistence-ports.ts`.
- `PeopleAggregatePersistenceStore`, son CAS, ses transactions SQLite, son historique et ses receipts persistants certifiés par 001D.
- `createPeopleRequestFingerprint` pour lier durablement une causalité au payload canonique et à sa cible.

## Gap réellement identifié

Les commandes, l'Authority et la persistance existaient, mais aucun composant ne réalisait leur orchestration. Il manquait le chemin exécutable unique qui charge la source PEOPLE, conserve `expectedRevision`, appelle l'Authority, puis confie exactement son état et ses événements au commit atomique 001D.

## Fichiers modifiés ou créés

- Créé : `server/domain/people/people-command-service.ts`.
- Créé : `server/domain/people/people-command-service.test.ts`.
- Créé : `Docs/24_MODULES/WORK/PEOPLE_COMMANDS/MISSIONS/P3-PEOPLE-001E-M01_REPORT.md`.
- Aucun fichier existant n'a été modifié par cette mission. Les changements préexistants constatés au preflight ont été préservés.

## Write path final

`PeopleCommandService.execute(commande canonique, contexte d'exécution)` détermine la cible canonique, charge Business Person et/ou Work People depuis les ports 001D, remplace les références de personne reçues par leur agrégat durable, puis route les 10 commandes vers la méthode correspondante de `PeopleAuthority`.

Pour une nouvelle intention, le résultat pur de l'Authority est transmis sans transformation au repository avec `expectedRevision`, causalité, corrélation, provenance et fingerprint. Le repository réalise atomiquement l'état, les événements ordonnés, la causalité, la nouvelle révision et le receipt.

Pour une causalité déjà durable sur le stream, le service remet directement la demande au commit 001D : le receipt restitue le résultat original, y compris après des révisions ultérieures. Un fingerprint divergent est rejeté. Aucun second modèle de commande, événement, règle métier, API, BFF, Query ou intégration Work n'a été créé.

## Tests exécutés

- `node --import tsx --test server/domain/people/people-command-service.test.ts`
  - 5 tests PASS, 0 échec.
  - Chemin réel exercé pour les 10 commandes : CreateBusinessPerson, AssignPersonToWork, AssignBusinessRole, RevokeBusinessRole, ChangeWorkOwner, AssignApprover, ReplaceAssignedPerson, SuspendWorkAssignment, ResumeWorkAssignment et RemovePersonFromWork.
- `node --import tsx --test server/domain/people/*.test.ts`
  - 30 tests PASS, 0 échec.
- Typecheck PEOPLE applicable :
  - `tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node <tous les fichiers server/domain/people/*.ts>`
  - PASS, 0 erreur.

## Résultats réels

- Commandes valides : état et événements retrouvés dans SQLite.
- Causalité, ordre de stream, ordinal événementiel et révisions durables vérifiés.
- `expectedRevision` appliquée ; révision obsolète rejetée par `PeoplePersistenceConflictError`.
- Replay ancien ou immédiat : statut `REPLAYED`, même révision, mêmes event IDs, même date de commit, aucune double mutation.
- Même commandId avec payload divergent : rejet `PeopleIdempotencyConflictError`, état inchangé.
- Erreur Authority : aucun événement ni receipt ajouté.
- Erreur Persistence injectée avant receipt : rollback de l'état, des événements et du receipt.
- Redémarrage sur fichier SQLite : agrégat, historique et Owner durablement retrouvés.
- Unicité du Owner vérifiée après affectation, changement, remplacement, suspension, reprise et retrait.

## Non-régressions

- Suite PEOPLE complète PASS : 30/30.
- Typecheck strict de toute la zone PEOPLE PASS.
- Aucun fichier interdit sous `server/runtime/`, `server/nova-core/`, `server/nova-bff/`, `tools/`, `apps/` ou `client/` modifié par la mission.
- `server/domain/people/index.ts` reste inchangé afin de préserver la séparation de l'index Foundation déjà testée.

## Risques résiduels

- Aucun risque bloquant identifié dans le périmètre 001E.
- Les commandes qui ne portent pas elles-mêmes de `WorkReference` exigent cette cible dans le contexte interne d'exécution ; ce contexte ne constitue pas un second modèle de commande.
- L'exposition publique, les Queries 001F et l'intégration Work 001G restent volontairement absentes.

## git diff --check

PASS. La commande ne remonte aucune erreur d'espacement. Elle affiche uniquement des avertissements de conversion LF/CRLF sur des changements préexistants du worktree.

## Verdict

Le chemin interne `Command → PeopleAuthority → Persistence` est opérationnel, durable et prouvé. Cette décision clôt uniquement la mission M01 et ne certifie pas le lot 001E.

GO — P3-PEOPLE-001E-M01
