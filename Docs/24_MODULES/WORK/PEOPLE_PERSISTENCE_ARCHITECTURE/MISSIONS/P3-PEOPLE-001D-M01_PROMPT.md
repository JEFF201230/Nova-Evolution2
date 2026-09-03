\# P3-PEOPLE-001D-M01



MISSION TYPE

IMPLEMENTATION



OBJECTIF UNIQUE



Rendre le noyau transactionnel PEOPLE conforme, atomique, reconstructible et durable pour BusinessPerson et WorkPeople.



Ne traiter aucun autre objectif.



MODE



MVP STRICT.

Réutilisation maximale.

Aucune refactorisation opportuniste.

Aucune extension fonctionnelle.

Économie maximale de tokens.



IMPORTANT — CONTEXTE



Ne pas refaire l'audit global du dépôt.



Utiliser comme sources principales uniquement :



\- Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/02\_PEOPLE\_REPOSITORY\_PORTS\_CONTRACT.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/03\_PEOPLE\_DURABLE\_DATA\_MODEL.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/04\_PEOPLE\_ATOMIC\_COMMIT\_AND\_CONCURRENCY.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/05\_PEOPLE\_EVENT\_HISTORY\_AND\_REHYDRATION.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/06\_PEOPLE\_IDEMPOTENCE\_CAUSALITY\_AND\_UNIQUENESS.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/10\_PEOPLE\_IMPLEMENTATION\_MISSION\_PLAN.md

\- server/domain/people/



Ne lire d'autres fichiers que lorsqu'une dépendance concrète l'exige.



REUSE -> COMPLETE -> BUILD



Avant de créer un fichier :



1\. rechercher une implémentation PEOPLE existante ;

2\. la réutiliser si conforme ;

3\. la compléter si possible ;

4\. créer un nouveau module uniquement si la responsabilité est réellement absente.



PÉRIMÈTRE FONCTIONNEL



Implémenter uniquement :



1\. ports typés de persistance PEOPLE ;

2\. schéma durable canonique V1 ;

3\. persistance BusinessPerson ;

4\. persistance WorkPeople ;

5\. commit atomique unique couvrant :

&#x20;  - état ;

&#x20;  - événements ;

&#x20;  - causalité ;

&#x20;  - empreinte de commande ;

&#x20;  - reçu d'idempotence ;

&#x20;  - nouvelle révision ;

6\. expectedRevision ;

7\. compare-and-swap ;

8\. révision monotone ;

9\. unicité durable de l'Owner actif par Work ;

10\. historique append-only ;

11\. reconstruction/rehydration complète ;

12\. replay idempotent ;

13\. absence de suppression métier physique.



TECHNOLOGIE



Utiliser l'architecture validée du dossier PEOPLE\_PERSISTENCE\_ARCHITECTURE.



Réutiliser node:sqlite si confirmé compatible avec l'environnement réel du dépôt.



Ne pas introduire d'ORM.



FICHIERS POTENTIELS



Limiter l'écriture à server/domain/people/.



Les responsabilités envisagées sont :



\- people-persistence-ports.ts

\- people-persistence-schema.ts

\- people-persistence-sqlite-adapter.ts

\- people-persistence-aggregate-store.ts

\- people-persistence-history.ts

\- tests correspondants



index.ts uniquement si un export est réellement indispensable.



Un mapper/rehydrator ou un type d'erreur PEOPLE supplémentaire n'est autorisé que si aucune responsabilité existante ne peut correctement le porter.



Ne pas considérer cette liste comme une obligation de créer tous les fichiers.



INTERDICTIONS ABSOLUES



Ne modifier aucun fichier sous :



\- server/runtime/

\- server/nova-core/

\- server/nova-bff/

\- tools/

\- apps/

\- client/



Ne modifier :



\- aucun contrat ;

\- aucun blueprint ;

\- aucune certification ;

\- aucune intégration Work ;

\- aucune API ;

\- aucun BFF ;

\- aucun frontend ;

\- aucune fonctionnalité OFFER ;

\- aucun composant CEREBRAU.



Ne pas utiliser comme source canonique PEOPLE :



\- IntegrationRuntimeRepository ;

\- JsonRuntimeSnapshotStore ;

\- RuntimeSnapshot ;

\- RuntimeEvent ;

\- registres CEREBRAU ;

\- fixtures frontend.



INVARIANTS OBLIGATOIRES



Prouver :



\- PEOPLE reste propriétaire des données ;

\- BusinessPerson et WorkPeople restent deux agrégats distincts ;

\- CAS strict ;

\- aucun last-write-wins implicite ;

\- Owner actif unique par Work ;

\- assignments/rôles/périodes cohérents ;

\- histoire append-only ;

\- causalité multi-événements préservée ;

\- idempotence durable ;

\- aucune suppression métier physique ;

\- aucun état partiel observable après échec.



TESTS OBLIGATOIRES



Créer ou compléter uniquement les tests nécessaires pour prouver :



1\. création BusinessPerson ;

2\. création WorkPeople ;

3\. modification ;

4\. load complet ;

5\. redémarrage / rehydration ;

6\. commit multi-événements ;

7\. rollback injecté ;

8\. deux connexions concurrentes ;

9\. stale revision ;

10\. replay exact ;

11\. replay divergent ;

12\. idempotence ;

13\. causalité ;

14\. unicité Owner ;

15\. contraintes SQL directes ;

16\. absence d'état partiel.



VALIDATIONS



Exécuter au minimum :



\- tests ciblés PEOPLE Persistence ;

\- typecheck applicable ;

\- tests PEOPLE existants affectés ;

\- git diff --check.



N'exécuter les suites globales Core/Runtime que si une dépendance concrète le justifie ou si elles sont nécessaires au gate existant.



OBJECTIF TOKENS



Ne pas explorer inutilement le dépôt.



Ne pas réexpliquer l'architecture dans le rapport.



Le rapport final doit être synthétique et factuel.



LIVRABLE



Créer uniquement :



Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/MISSIONS/P3-PEOPLE-001D-M01\_REPORT.md



Le rapport doit contenir :



\- fichiers créés/modifiés ;

\- réutilisations effectuées ;

\- invariants prouvés ;

\- tests exécutés et résultats réels ;

\- éventuelles inconnues ;

\- git diff --check ;

\- verdict.



VERDICT TERMINAL



Répondre exactement par :



GO — P3-PEOPLE-001D-M01



ou



NO GO — P3-PEOPLE-001D-M01



Un GO est interdit si atomicité, CAS, idempotence, unicité Owner, rehydration ou absence d'état partiel ne sont pas effectivement prouvés.



Ne pas démarrer M02.

