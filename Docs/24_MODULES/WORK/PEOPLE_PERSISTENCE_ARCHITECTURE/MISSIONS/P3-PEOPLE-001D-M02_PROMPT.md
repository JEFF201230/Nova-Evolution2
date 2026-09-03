\# P3-PEOPLE-001D-M02



\## MISSION



P3-PEOPLE-001D-M02 — MIGRATIONS, INTEGRITY AND RECOVERY



Mission d'IMPLEMENTATION strictement limitée à la persistance PEOPLE.



M01 est GO.



Ne pas réimplémenter M01.

Ne pas refaire l'audit global du dépôt.

Ne pas développer M03.



\## OBJECTIF UNIQUE



Rendre l'évolution, l'intégrité et la reprise de la source canonique PEOPLE déterministes et prouvées.



\## SOURCES PRINCIPALES



Lire uniquement le contexte nécessaire dans :



\- Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/03\_PEOPLE\_DURABLE\_DATA\_MODEL.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/05\_PEOPLE\_EVENT\_HISTORY\_AND\_REHYDRATION.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/07\_PEOPLE\_MIGRATION\_AND\_RECOVERY\_STRATEGY.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/08\_PEOPLE\_PERSISTENCE\_TEST\_STRATEGY.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/10\_PEOPLE\_IMPLEMENTATION\_MISSION\_PLAN.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/MISSIONS/P3-PEOPLE-001D-M01\_REPORT.md

\- server/domain/people/



Ne lire ailleurs que si une dépendance concrète et démontrable l'exige.



\## PRÉCONDITION



Vérifier factuellement le résultat M01.



Si les éléments nécessaires de M01 sont absents ou incohérents :



STOP

NO GO — P3-PEOPLE-001D-M02



Ne pas réparer M01 silencieusement.



\## ÉTAPE 1 — EXISTENCE D'UNE BASE PEOPLE



Avant toute migration, déterminer factuellement s'il existe une base PEOPLE contenant des données hors du stockage nouvellement créé par M01.



Rechercher uniquement les éléments nécessaires permettant d'identifier :



\- base PEOPLE existante ;

\- chemin/configuration de cette base ;

\- données PEOPLE persistées existantes ;

\- éventuel stockage legacy réellement utilisé.



Ne pas confondre avec :



\- Runtime ;

\- CEREBRAU ;

\- Work ;

\- fixtures ;

\- projections ;

\- données frontend.



\### Si aucune base PEOPLE legacy n'existe



Le constater explicitement.



Ne créer aucune migration legacy fictive.



\### Si une base PEOPLE legacy existe



Ne la modifier directement que si son emplacement et sa migration entrent explicitement dans le périmètre autorisé.



Sinon :



STOP

NO GO — P3-PEOPLE-001D-M02



et documenter précisément le blocage.



\## PÉRIMÈTRE D'IMPLÉMENTATION



Implémenter uniquement ce qui manque pour :



1\. versionner le schéma PEOPLE ;

2\. enregistrer les migrations appliquées ;

3\. associer version et checksum ;

4\. détecter un checksum divergent ;

5\. refuser une version inconnue ;

6\. garantir l'idempotence des migrations ;

7\. effectuer les contrôles pré/post migration ;

8\. vérifier foreign keys ;

9\. vérifier quick\_check / integrity\_check lorsque applicable ;

10\. détecter une incohérence head/events/receipt ;

11\. restaurer/reconstruire l'état PEOPLE de façon déterministe ;

12\. prouver le comportement après interruption ;

13\. fournir un mécanisme de backup/restore approprié au MVP si requis par l'architecture validée ;

14\. fail closed lorsqu'une intégrité suffisante ne peut pas être démontrée.



\## REUSE -> COMPLETE -> BUILD



Réutiliser prioritairement :



\- people-persistence-schema.ts

\- people-persistence-sqlite-adapter.ts

\- people-persistence-history.ts

\- les mécanismes M01

\- node:sqlite



Créer :



people-persistence-migrations.ts



uniquement si les migrations ne peuvent pas rester clairement et proprement dans le module de schéma existant.



Aucun ORM.



Aucune nouvelle infrastructure générique.



\## FICHIERS AUTORISÉS



Écriture fonctionnelle uniquement sous :



server/domain/people/



et uniquement pour les responsabilités M02.



Le rapport M02 est autorisé sous :



Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/MISSIONS/



\## INTERDICTIONS



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

\- aucune certification existante ;

\- Work ;

\- Mission Engine ;

\- API ;

\- BFF ;

\- OFFER ;

\- CEREBRAU ;

\- NOVA Runtime.



Ne développer aucune fonctionnalité M03.



Ne refactorer M01 que lorsqu'une correction est strictement indispensable à M02 et directement prouvée par un test M02.



Toute extension substantielle de M01 impose STOP et NO GO.



\## TESTS OBLIGATOIRES



Prouver au minimum :



1\. initialisation base vide ;

2\. migration initiale ;

3\. migration idempotente ;

4\. version correcte ;

5\. checksum correct ;

6\. checksum divergent rejeté ;

7\. version inconnue rejetée ;

8\. interruption de migration injectée ;

9\. rollback de migration ;

10\. foreign\_key\_check ;

11\. quick\_check ;

12\. integrity\_check si applicable ;

13\. corruption head/event détectée ;

14\. corruption receipt détectée ;

15\. redémarrage ;

16\. rehydration après redémarrage ;

17\. backup/restore si prévu par l'architecture ;

18\. état restauré équivalent à l'état attendu ;

19\. absence de perte d'identité ;

20\. absence de perte d'historique.



\## VALIDATIONS



Exécuter :



\- tests ciblés M02 ;

\- tests de persistance M01 affectés ;

\- tests PEOPLE affectés ;

\- typecheck applicable ;

\- git diff --check.



Ne lancer des suites globales que si nécessaires à un gate réellement applicable.



\## ÉCONOMIE DE TOKENS



Ne pas refaire l'analyse architecturale.



Ne pas produire d'explication longue du code.



Ne pas explorer le dépôt sans besoin concret.



Réutiliser les décisions du dossier d'architecture et les preuves M01.



\## RAPPORT UNIQUE



Créer :



Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/MISSIONS/P3-PEOPLE-001D-M02\_REPORT.md



Le rapport doit contenir :



\- état de la précondition M01 ;

\- résultat de la recherche de base PEOPLE existante ;

\- fichiers créés/modifiés ;

\- migrations réellement implémentées ;

\- mécanismes integrity/recovery ;

\- tests exécutés ;

\- résultats réels ;

\- éventuels contrôles impossibles ;

\- risques résiduels ;

\- git diff --check ;

\- verdict terminal.



\## VERDICT



Terminer exactement par :



GO — P3-PEOPLE-001D-M02



ou



NO GO — P3-PEOPLE-001D-M02



GO interdit si :



\- version/checksum ne sont pas prouvés ;

\- une migration peut laisser un état partiel ;

\- une corruption critique passe silencieusement ;

\- recovery n'est pas déterministe ;

\- une base PEOPLE legacy identifiée reste non traitée sans décision explicite ;

\- les tests obligatoires applicables échouent.



Ne pas commencer M03.

