\# P3-PEOPLE-PERSISTENCE-ARCHITECTURE-001



\## MISSION



Concevoir, matérialiser et documenter l'architecture canonique de la couche de persistance du domaine PEOPLE avant toute implémentation du lot P3-PEOPLE-001D.



Cette mission est une mission d'ARCHITECTURE et de DOCUMENTATION.



Aucun code de production ne doit être développé ou modifié.



\## OBJECTIF



Produire une architecture suffisamment précise, cohérente et vérifiable pour permettre ensuite l'implémentation de la persistance PEOPLE sans nouvelle décision architecturale structurante.



La mission doit déterminer la solution minimale compatible avec le MVP.



Principe obligatoire :



REUSE -> COMPLETE -> BUILD



Ne construire que ce qui manque réellement.



\## SOURCES AUTORITATIVES À INSPECTER



Inspecter au minimum :



\- Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md

\- server/domain/people/

\- Docs/19\_PROGRAMS/PROGRAM-016\_PLATFORM\_API\_PERSISTENCE\_IDENTITY/



Rechercher également le rapport existant :



RUNTIME-PEOPLE-PERSISTENCE-REUSE-AUDIT-001\_REPORT.md



S'il est trouvé, l'utiliser comme preuve d'audit.



Ne jamais considérer ses conclusions comme supérieures aux contrats autoritatifs.



\## FAITS DÉJÀ ÉTABLIS À VÉRIFIER



Un audit précédent a conclu qu'aucune persistance canonique PEOPLE directement réutilisable n'avait été identifiée.



Il a notamment considéré comme non appropriés pour devenir la source de vérité PEOPLE :



\- IntegrationRuntimeRepository

\- JsonRuntimeSnapshotStore

\- RuntimeSnapshot

\- RuntimeEvent

\- registres CEREBRAU

\- fixtures frontend

\- projections de lecture



Ces conclusions doivent être vérifiées contre l'état réel du dépôt.



Ne pas les accepter aveuglément.



\## ARCHITECTURE À DÉTERMINER



\### 1. Source de vérité



Définir précisément :



\- ce qui constitue la source de vérité PEOPLE ;

\- qui en est propriétaire ;

\- quelles données sont canoniques ;

\- quelles données sont reconstructibles ;

\- quelles dépendances sont interdites.



PEOPLE doit rester propriétaire de ses données métier.



\### 2. Agrégats persistés



Déterminer la persistance de :



\- BusinessPerson

\- WorkPeople



Vérifier leurs invariants existants avant de définir le stockage.



\### 3. Repository ports



Définir les contrats conceptuels de :



\- BusinessPersonRepository

\- WorkPeopleRepository



Préciser au minimum :



\- lecture ;

\- écriture ;

\- expectedRevision ;

\- historique ;

\- reconstitution ;

\- idempotence ;

\- erreurs ;

\- comportement en conflit.



Ne pas implémenter ces repositories.



\### 4. Modèle durable



Définir le modèle durable minimal nécessaire pour :



\- état courant ;

\- historique ;

\- événements métier ;

\- causalité ;

\- provenance ;

\- révision ;

\- idempotence ;

\- unicité.



Le modèle doit être versionné.



\### 5. Technologie de stockage



Évaluer explicitement la proposition SQLite.



Ne pas considérer SQLite comme décidé par avance.



Comparer uniquement les alternatives réellement pertinentes pour ce dépôt et le MVP.



La décision doit considérer :



\- atomicité ;

\- concurrence ;

\- durabilité ;

\- migrations ;

\- simplicité ;

\- dépendances ;

\- exploitation ;

\- tests ;

\- coût de développement ;

\- réutilisation future.



Émettre une décision explicite.



\### 6. Atomicité



Définir une unité de commit garantissant qu'une opération métier ne puisse jamais produire un état partiel.



Le commit doit couvrir, lorsque applicable :



\- nouvel état ;

\- événements ;

\- causalité ;

\- provenance ;

\- empreinte de commande ;

\- reçu d'idempotence ;

\- nouvelle révision ;

\- contraintes d'unicité.



\### 7. Concurrence



Définir précisément :



\- expectedRevision ;

\- compare-and-swap ;

\- révision monotone ;

\- comportement en conflit ;

\- interdiction du last-write-wins lorsque contraire au contrat.



\### 8. Unicité



Déterminer les contraintes durables nécessaires.



Traiter explicitement l'unicité de l'Owner actif de WorkPeople si elle est exigée par le contrat.



La garantie ne doit pas dépendre uniquement d'un contrôle en mémoire.



\### 9. Idempotence et causalité



Définir comment une commande rejouée est reconnue.



Définir :



\- identifiant de causalité ;

\- empreinte éventuelle ;

\- reçu durable ;

\- comportement du replay ;

\- comportement si même causalité avec payload différent.



\### 10. Historique et rehydration



Définir :



\- historique append-only ;

\- reconstruction d'un agrégat ;

\- replay ;

\- cohérence état/historique ;

\- récupération après redémarrage.



\### 11. Suppression



Vérifier le contrat PEOPLE.



Si la suppression physique est interdite, formaliser cette interdiction dans l'architecture.



\### 12. Migration



Définir une stratégie de migration :



\- versionnée ;

\- déterministe ;

\- vérifiable ;

\- idempotente ;

\- récupérable ;

\- réversible lorsque nécessaire.



\### 13. Recovery



Définir les comportements attendus après :



\- crash ;

\- écriture interrompue ;

\- migration interrompue ;

\- corruption détectée ;

\- redémarrage.



\### 14. Tests



Définir la matrice minimale de certification couvrant :



\- création ;

\- modification ;

\- historique ;

\- redémarrage ;

\- rehydration ;

\- replay ;

\- atomicité ;

\- concurrence ;

\- expectedRevision obsolète ;

\- idempotence ;

\- causalité ;

\- unicité ;

\- Owner unique ;

\- migration ;

\- recovery ;

\- absence de suppression physique ;

\- non-régression PEOPLE ;

\- non-régression Core/Runtime applicable.



\### 15. Frontières



Formaliser que les composants suivants ne peuvent pas devenir propriétaires de la persistance PEOPLE :



\- Runtime

\- CEREBRAU

\- Work

\- Mission Engine

\- API

\- BFF

\- frontend

\- projections



Ils peuvent consommer PEOPLE uniquement via des frontières explicitement définies.



\## INTERDICTIONS



Ne modifier aucun fichier existant de :



\- server/

\- tools/

\- client/

\- apps/



Ne modifier aucun contrat existant.



Ne modifier aucune certification existante.



Ne développer aucun repository concret.



Ne développer aucune migration exécutable.



Ne développer aucune API.



Ne développer aucun BFF.



Ne développer aucun frontend.



Ne développer aucune intégration Work.



Ne développer aucune fonctionnalité OFFER.



Ne modifier ni CEREBRAU ni NOVA Runtime.



\## ÉCRITURE AUTORISÉE



La mission peut créer ou modifier uniquement des fichiers Markdown sous :



Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/



Le fichier de prompt existant peut rester inchangé.



Toute nécessité d'écriture hors de ce périmètre impose STOP.



\## LIVRABLES OBLIGATOIRES



Produire :



1\. 00\_PEOPLE\_PERSISTENCE\_ARCHITECTURE\_EXECUTIVE\_DECISION.md

2\. 01\_PEOPLE\_CANONICAL\_SOURCE\_OF\_TRUTH.md

3\. 02\_PEOPLE\_REPOSITORY\_PORTS\_CONTRACT.md

4\. 03\_PEOPLE\_DURABLE\_DATA\_MODEL.md

5\. 04\_PEOPLE\_ATOMIC\_COMMIT\_AND\_CONCURRENCY.md

6\. 05\_PEOPLE\_EVENT\_HISTORY\_AND\_REHYDRATION.md

7\. 06\_PEOPLE\_IDEMPOTENCE\_CAUSALITY\_AND\_UNIQUENESS.md

8\. 07\_PEOPLE\_MIGRATION\_AND\_RECOVERY\_STRATEGY.md

9\. 08\_PEOPLE\_PERSISTENCE\_TEST\_STRATEGY.md

10\. 09\_PEOPLE\_DEPENDENCY\_BOUNDARIES.md

11\. 10\_PEOPLE\_IMPLEMENTATION\_MISSION\_PLAN.md

12\. PEOPLE\_PERSISTENCE\_ARCHITECTURE\_MASTER\_REPORT.md



\## MASTER REPORT



Le rapport maître doit distinguer explicitement :



\### FAITS PROUVÉS



Uniquement ce qui est démontré par le dépôt ou les contrats.



\### DÉCISIONS D'ARCHITECTURE



Chaque décision doit indiquer :



\- justification ;

\- invariant protégé ;

\- alternatives rejetées ;

\- coût/complexité ;

\- impact MVP.



\### HYPOTHÈSES



Aucune hypothèse ne doit être présentée comme un fait.



\### INCONNUES



Identifier toute information manquante.



\### RISQUES RÉSIDUELS



Classer les risques :



\- CRITIQUE

\- HAUT

\- MOYEN

\- FAIBLE



\## PLAN D'IMPLÉMENTATION



10\_PEOPLE\_IMPLEMENTATION\_MISSION\_PLAN.md doit produire le découpage minimal nécessaire pour implémenter P3-PEOPLE-001D.



Pour chaque micro-mission :



\- identifiant ;

\- objectif unique ;

\- dépendances ;

\- fichiers potentiels ;

\- invariants concernés ;

\- tests obligatoires ;

\- critères GO ;

\- possibilité ou non de parallélisation.



Réduire le nombre de missions au strict nécessaire.



Ne pas créer artificiellement des lots indépendants lorsque l'atomicité impose une implémentation commune.



\## VALIDATIONS



Avant décision finale :



\- vérifier que seuls les fichiers Markdown autorisés ont été créés/modifiés ;

\- vérifier la cohérence entre tous les documents ;

\- vérifier qu'aucune décision structurante ne reste contradictoire ;

\- vérifier que les contrats existants ne sont pas modifiés ;

\- exécuter git diff --check ;

\- signaler explicitement tout contrôle impossible à exécuter.



\## DÉCISION TERMINALE



Émettre exactement l'une des décisions suivantes :



GO — PEOPLE PERSISTENCE ARCHITECTURE READY FOR IMPLEMENTATION



ou



NO GO — PEOPLE PERSISTENCE ARCHITECTURE NOT READY



Un GO est interdit si une décision structurante reste indéterminée concernant :



\- source de vérité ;

\- technologie de stockage ;

\- transaction ;

\- atomicité ;

\- concurrence ;

\- idempotence ;

\- causalité ;

\- unicité ;

\- historique ;

\- migration ;

\- recovery.



Aucune implémentation P3-PEOPLE-001D ne doit commencer avant GO.

