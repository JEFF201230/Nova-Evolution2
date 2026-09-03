\# P3-PEOPLE-001E-M02



\## MISSION



P3-PEOPLE-001E-M02 — CERTIFICATION FINALE PEOPLE COMMANDS



Mission exclusivement de CERTIFICATION.



P3-PEOPLE-001D = CERTIFIED.

P3-PEOPLE-001E-M01 = GO.



Ne développer aucune nouvelle fonctionnalité.

Ne refactorer aucun composant.

Ne commencer aucun lot P3-PEOPLE-001F.



\## OBJECTIF UNIQUE



Déterminer factuellement si le lot :



P3-PEOPLE-001E — People Commands



satisfait intégralement son contrat et peut être certifié GO.



\## SOURCES PRINCIPALES



Lire uniquement :



\- Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md

\- Docs/24\_MODULES/WORK/PEOPLE\_COMMANDS/MISSIONS/P3-PEOPLE-001E-M01\_REPORT.md

\- Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001D.certification.json

\- server/domain/people/people-authority.commands.ts

\- server/domain/people/people-authority.events.ts

\- server/domain/people/people-authority.ts

\- server/domain/people/people-command-service.ts

\- server/domain/people/people-command-service.test.ts

\- persistence PEOPLE strictement nécessaire aux validations



Ne refaire aucun audit global de 001C ou 001D.



\## PRÉCONDITIONS



Vérifier :



1\. P3-PEOPLE-001D = CERTIFIED ;

2\. P3-PEOPLE-001E-M01 se termine par GO ;

3\. PeopleCommandService existe ;

4\. les 10 commandes canoniques sont routées ;

5\. aucune Query 001F ni intégration Work 001G n'a été anticipée.



Toute précondition échouée :



NO GO — P3-PEOPLE-001E-M02 — P3-PEOPLE-001E NOT CERTIFIED



\## INTERDICTION DE DÉVELOPPEMENT



Aucun code fonctionnel nouveau.



Si un défaut exige une correction de code :



STOP.



Documenter le défaut.



Ne pas le réparer silencieusement.



\## MATRICE DE CERTIFICATION



\### A — Commandes



Prouver les 10 commandes canoniques :



\- CreateBusinessPerson

\- AssignPersonToWork

\- RemovePersonFromWork

\- AssignBusinessRole

\- RevokeBusinessRole

\- ChangeWorkOwner

\- AssignApprover

\- ReplaceAssignedPerson

\- SuspendWorkAssignment

\- ResumeWorkAssignment



\### B — Authority



Prouver que PeopleAuthority reste l'unique frontière de décision métier.



PeopleCommandService ne doit contenir aucune nouvelle règle métier.



\### C — Persistence



Prouver :



Command

→ Authority

→ Persistence



avec état et événements durables.



\### D — Atomicité



Prouver qu'une erreur Persistence ne laisse :



\- aucun état partiel ;

\- aucun événement partiel ;

\- aucun receipt partiel.



\### E — Expected Revision



Prouver :



\- expectedRevision ;

\- CAS ;

\- stale revision rejetée.



\### F — Idempotence



Prouver :



\- répétition exacte = même résultat ;

\- aucune duplication événementielle ;

\- replay ancien après avancée du stream ;

\- même causalité avec payload divergent rejetée.



\### G — Événements



Prouver :



\- événements produits uniquement par Authority ;

\- ordre événementiel préservé ;

\- événements spécialisés non dupliqués ;

\- causalité persistée.



\### H — Erreurs



Prouver qu'une erreur métier :



\- ne committe aucun changement ;

\- ne produit aucun receipt accepté ;

\- conserve l'état antérieur.



\### I — Restart



Prouver que l'état issu d'une commande reste retrouvable après redémarrage SQLite.



\### J — Owner



Prouver que le chemin Commands ne permet jamais deux Owners actifs.



\### K — Frontières



Prouver l'absence de :



\- API ;

\- BFF ;

\- Work integration ;

\- Query ;

\- frontend ;

\- Runtime mutation ;

\- CEREBRAU mutation.



\## TESTS OBLIGATOIRES



Exécuter :



node --import tsx --test server/domain/people/\*.test.ts



Puis typecheck strict PEOPLE.



Exécuter également les tests Work/Runtime/Core/CEREBRAU uniquement si le gate 001E ou le contrat machine les exige réellement.



Ne modifier aucun de ces périmètres.



Exécuter :



git diff --check



et :



git status --short



\## CERTIFICATION



Rechercher le fichier officiel de certification correspondant à P3-PEOPLE-001E.



S'il n'existe pas, créer uniquement selon la convention réellement prouvée par les certifications PEOPLE existantes.



Ne pas inventer de schéma.



En cas de GO :



\- MissionId cohérent avec P3-PEOPLE-001E ;

\- DomainId = PEOPLE ;

\- LotId = P3-PEOPLE-001E ;

\- Status = CERTIFIED ;

\- CertifiedAt réel ;

\- Evidence réelles ;

\- Tests réellement exécutés ;

\- Regressions = NONE ;

\- PreviousLot = P3-PEOPLE-001D ;

\- NextAuthorizedLot = P3-PEOPLE-001F.



Mettre à jour le registry uniquement si cette mise à jour fait partie de la convention officielle existante.



\## RAPPORT UNIQUE



Créer :



Docs/24\_MODULES/WORK/PEOPLE\_COMMANDS/MISSIONS/P3-PEOPLE-001E-M02\_CERTIFICATION\_REPORT.md



Inclure :



\- préconditions ;

\- matrice A–K ;

\- commandes exécutées ;

\- résultats réels ;

\- tests ;

\- fichiers modifiés ;

\- état certification ;

\- risques résiduels ;

\- git diff --check ;

\- verdict.



\## VERDICT



Terminer exactement par :



GO — P3-PEOPLE-001E-M02 — P3-PEOPLE-001E CERTIFIED



ou



NO GO — P3-PEOPLE-001E-M02 — P3-PEOPLE-001E NOT CERTIFIED



Ne pas ouvrir P3-PEOPLE-001F.

