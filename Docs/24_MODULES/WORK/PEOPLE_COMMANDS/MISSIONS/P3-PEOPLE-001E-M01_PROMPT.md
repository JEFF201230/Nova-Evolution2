\# P3-PEOPLE-001E-M01



\## MISSION



P3-PEOPLE-001E-M01 — PEOPLE INTERNAL WRITE PATH



Mission d'implémentation strictement limitée au LOT :



P3-PEOPLE-001E — People Commands



\## OBJECTIF UNIQUE



Matérialiser le chemin interne d'écriture PEOPLE en raccordant les composants déjà existants et certifiés :



Command

→ PeopleAuthority

→ événements canoniques

→ persistance PEOPLE certifiée P3-PEOPLE-001D

→ résultat durable



Appliquer strictement :



REUSE → COMPLETE → TEST



Ne recréer ni les commandes, ni les événements, ni la persistance.



\## ACQUIS À NE PAS RÉAUDITER



P3-PEOPLE-001C a déjà certifié :



\- PeopleAuthority comme unique write boundary PEOPLE ;

\- les 10 commandes canoniques ;

\- les 13 événements canoniques ;

\- causalité ;

\- ordre événementiel ;

\- idempotence au niveau Authority ;

\- invariants métier PEOPLE.



P3-PEOPLE-001D est CERTIFIED et a déjà certifié :



\- persistance SQLite PEOPLE ;

\- atomicité ;

\- CAS / expectedRevision ;

\- idempotence persistante ;

\- receipts ;

\- causalité persistée ;

\- historique append-only ;

\- replay / rehydration ;

\- migrations ;

\- integrity / recovery.



Ces sujets ne doivent pas faire l'objet d'un nouvel audit général.



Lire leurs preuves uniquement lorsqu'une décision d'implémentation précise l'exige.



\## CONTRAT CANONIQUE



Source :



Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md



LOT :



P3-PEOPLE-001E



Respecter strictement son périmètre et son gate de sortie.



\## ÉTAPE 0 — GIT PREFLIGHT



Capturer :



git status --short



Préserver tous les changements préexistants.



Ne nettoyer, revert, stash ou modifier aucun changement hors mission.



\## ÉTAPE 1 — IDENTIFIER LE GAP DE WIRING



Inspecter uniquement les composants PEOPLE nécessaires afin de déterminer si un chemin interne d'écriture :



Command

→ Authority

→ Persistence



existe déjà.



Priorité de lecture :



server/domain/people/people-authority.commands.ts

server/domain/people/people-authority.ts

server/domain/people/people-authority.events.ts

server/domain/people/people-persistence-ports.ts

server/domain/people/people-persistence-aggregate-store.ts

server/domain/people/people-persistence-sqlite-adapter.ts

server/domain/people/index.ts

tests PEOPLE directement associés.



Si le write path existe déjà et satisfait intégralement 001E :



ne pas créer de doublon.



Compléter uniquement les preuves/tests manquants.



\## RESPONSABILITÉ À MATÉRIALISER



Le composant de commande interne doit :



1\. recevoir une commande canonique PEOPLE ;

2\. charger l'agrégat nécessaire depuis la source PEOPLE ;

3\. conserver la révision attendue ;

4\. invoquer PeopleAuthority comme seule autorité métier ;

5\. récupérer exactement les événements produits par Authority ;

6\. persister atomiquement état + événements + causalité + receipt + nouvelle révision via la persistance 001D ;

7\. retourner un résultat déterministe ;

8\. supporter l'idempotence persistante ;

9\. rejeter une révision obsolète ;

10\. ne produire aucun état partiel en cas d'échec.



Ne déplacer aucune règle métier hors PeopleAuthority.



\## COMMANDES



Réutiliser les 10 commandes canoniques existantes.



Ne créer aucun deuxième modèle de commande.



\## ÉVÉNEMENTS



Réutiliser exclusivement les 13 événements canoniques existants.



Ne créer aucun événement alternatif.



Ne dupliquer aucun événement spécialisé par un événement générique représentant le même changement.



\## REUSE → COMPLETE



Réutiliser les fichiers existants avant toute création.



Un nouveau fichier de type :



people-command-handler.ts

people-command-service.ts

people-write-service.ts



n'est autorisé que si aucune responsabilité existante ne constitue déjà naturellement cette frontière.



Choisir un seul composant de write path.



Aucune architecture supplémentaire.



\## PÉRIMÈTRE D'ÉCRITURE



Autorisé uniquement sous :



server/domain/people/



pour les fichiers strictement nécessaires à 001E.



Tests associés autorisés sous la même zone.



Rapport autorisé sous :



Docs/24\_MODULES/WORK/PEOPLE\_COMMANDS/MISSIONS/



\## INTERDICTIONS



Ne modifier aucun fichier sous :



server/runtime/

server/nova-core/

server/nova-bff/

tools/

apps/

client/



Ne modifier aucun contrat existant.



Ne modifier aucune certification 001C ou 001D.



Ne développer aucune API.



Ne développer aucun BFF.



Ne développer aucune Query 001F.



Ne développer aucune intégration Work 001G.



Ne développer aucun frontend.



Ne modifier aucun workflow OFFER.



Ne modifier aucun composant VEEDDA extérieur à PEOPLE.



\## TESTS OBLIGATOIRES



Tester le write path réel au minimum sur :



\- CreateBusinessPerson ;

\- AssignPersonToWork ;

\- AssignBusinessRole ;

\- ChangeWorkOwner ;

\- AssignApprover ;

\- ReplaceAssignedPerson ;

\- SuspendWorkAssignment ;

\- ResumeWorkAssignment ;

\- RemovePersonFromWork.



Prouver :



1\. commande valide → état durable ;

2\. événements attendus → durables ;

3\. causalité conservée ;

4\. ordre événementiel conservé ;

5\. expectedRevision respectée ;

6\. stale revision rejetée ;

7\. replay idempotent sans double mutation ;

8\. même commandId + payload divergent rejeté ;

9\. erreur Authority → aucune écriture ;

10\. erreur Persistence → aucun état partiel ;

11\. redémarrage → résultat durable retrouvable ;

12\. Owner unique toujours respecté.



\## NON-RÉGRESSION



Exécuter au minimum :



node --import tsx --test server/domain/people/\*.test.ts



Puis le typecheck PEOPLE applicable.



Exécuter les suites plus larges uniquement si une modification réelle ou un gate du contrat les rend nécessaires.



Exécuter :



git diff --check



\## OPTIMISATION



Ne pas réauditer 001C.



Ne pas réauditer 001D.



Ne pas relire tout le dépôt.



Ne pas produire de dossier d'architecture supplémentaire.



Ne pas modifier un composant simplement pour l'améliorer.



La mission doit rester centrée sur une seule valeur :



CHEMIN INTERNE D'ÉCRITURE PEOPLE OPÉRATIONNEL.



\## RAPPORT UNIQUE



Créer :



Docs/24\_MODULES/WORK/PEOPLE\_COMMANDS/MISSIONS/P3-PEOPLE-001E-M01\_REPORT.md



Inclure uniquement :



\- composants réutilisés ;

\- gap réellement identifié ;

\- fichiers modifiés/créés ;

\- write path final ;

\- tests exécutés ;

\- résultats réels ;

\- non-régressions ;

\- risques résiduels ;

\- git diff --check ;

\- verdict.



\## VERDICT



Terminer exactement par :



GO — P3-PEOPLE-001E-M01



ou



NO GO — P3-PEOPLE-001E-M01



GO uniquement si le chemin :



Command → Authority → Persistence



est réellement opérationnel et prouvé.



Ne pas certifier 001E dans cette mission.

Ne pas ouvrir 001F.

