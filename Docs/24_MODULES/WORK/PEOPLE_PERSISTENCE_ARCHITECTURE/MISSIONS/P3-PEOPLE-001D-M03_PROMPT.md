\# P3-PEOPLE-001D-M03



\## MISSION



P3-PEOPLE-001D-M03 — CERTIFICATION FINALE DU LOT P3-PEOPLE-001D



Mission exclusivement de CERTIFICATION.



M01 = GO.

M02 = GO.



Ne développer aucune nouvelle fonctionnalité.

Ne refactorer aucun composant.

Ne commencer aucun lot PEOPLE suivant.



\## OBJECTIF UNIQUE



Déterminer factuellement si P3-PEOPLE-001D peut recevoir la certification finale GO sur la base des preuves réellement présentes dans le dépôt.



Le verdict doit être fondé exclusivement sur des preuves exécutées et vérifiées.



\## SOURCES PRINCIPALES



Lire uniquement ce qui est nécessaire dans :



\- Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/MISSIONS/P3-PEOPLE-001D-M01\_REPORT.md

\- Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/MISSIONS/P3-PEOPLE-001D-M02\_REPORT.md

\- server/domain/people/

\- Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001D.certification.json

\- server/nova-core/people-lot-machine-contract.ts

\- server/nova-core/people-lot-runtime-execution-contract.adapter.ts



Ne refaire aucun audit global du dépôt.



\## PRÉCONDITIONS



Vérifier :



1\. M01 existe et se termine par GO.

2\. M02 existe et se termine par GO.

3\. Les fichiers de persistance PEOPLE nécessaires sont présents.

4\. Aucun élément M01/M02 requis n'a disparu.

5\. Aucun conflit ou incohérence évidente n'est présent dans le worktree sur les fichiers PEOPLE concernés.



Si une précondition échoue :



NO GO — P3-PEOPLE-001D-M03



Ne pas réparer silencieusement.



\## INTERDICTION DE DÉVELOPPEMENT



Aucun nouveau code fonctionnel n'est autorisé.



Ne pas modifier :



\- server/domain/people/ sauf test de certification strictement indispensable ;

\- server/runtime/ ;

\- server/nova-core/ ;

\- server/nova-bff/ ;

\- tools/ ;

\- apps/ ;

\- client/ ;

\- Work ;

\- Mission Engine ;

\- API ;

\- BFF ;

\- OFFER ;

\- CEREBRAU ;

\- Runtime.



Si un défaut fonctionnel exige une correction de code :



STOP.



Documenter le défaut.



Verdict :



NO GO — P3-PEOPLE-001D-M03



\## MATRICE DE CERTIFICATION



Vérifier factuellement au minimum les exigences suivantes.



\### A — Source canonique



Prouver que PEOPLE possède une source persistante canonique propre.



\### B — Agrégats



Prouver la persistance et la reconstitution de :



\- BusinessPerson

\- WorkPeople



\### C — Atomicité



Prouver :



\- état ;

\- événements ;

\- causalité ;

\- receipt ;

\- révision ;



dans une seule transaction sans état partiel observable.



\### D — Concurrence



Prouver :



\- expectedRevision ;

\- CAS ;

\- stale revision rejetée ;

\- absence de last-write-wins implicite ;

\- comportement à deux connexions.



\### E — Unicité



Prouver durablement :



\- Owner actif unique par Work ;

\- contraintes d'assignments/rôles/périodes requises par le contrat.



\### F — Histoire



Prouver :



\- append-only ;

\- historique complet ;

\- replay ;

\- rehydration ;

\- redémarrage.



\### G — Idempotence et causalité



Prouver :



\- replay exact ;

\- replay divergent rejeté ;

\- causation durable ;

\- receipts cohérents ;

\- événements multiples d'une même commande cohérents.



\### H — Migration



Prouver :



\- schéma versionné ;

\- checksum ;

\- migration idempotente ;

\- version inconnue rejetée ;

\- checksum divergent rejeté ;

\- rollback sur interruption.



\### I — Intégrité et recovery



Prouver :



\- quick\_check ;

\- integrity\_check ;

\- foreign\_key\_check ;

\- corruption head détectée ;

\- corruption event détectée ;

\- corruption receipt détectée ;

\- backup ;

\- restore ;

\- reconstruction déterministe.



\### J — Suppression



Prouver l'absence de suppression métier physique lorsque le contrat l'interdit.



\### K — Frontières



Prouver qu'aucun stockage Runtime, CEREBRAU, Work, BFF, frontend ou projection n'est utilisé comme source canonique PEOPLE.



\## TESTS OBLIGATOIRES



Exécuter et rapporter les commandes exactes et leurs résultats réels.



\### PEOPLE



Exécuter tous les tests PEOPLE :



node --import tsx --test server/domain/people/\*.test.ts



\### Typecheck PEOPLE



Exécuter le typecheck strict applicable à server/domain/people/.



\### Work



Exécuter les tests Work pertinents permettant de vérifier qu'aucune régression PEOPLE n'a cassé Work.



Ne modifier aucun fichier Work.



\### Runtime



Exécuter les tests Runtime pertinents déjà présents et applicables.



Ne modifier aucun fichier Runtime.



\### Core / NOVA



Exécuter les validations Core/NOVA applicables au contrat PEOPLE et à ses bridges lorsque les commandes existent dans le dépôt.



Ne modifier aucun fichier server/nova-core/.



\### CEREBRAU



Exécuter les contrôles CEREBRAU existants applicables à PEOPLE/certification lorsque ces contrôles sont directement exécutables.



Ne modifier aucun outil.



Si un contrôle attendu n'est pas exécutable, documenter exactement pourquoi.



Ne déclarer aucun PASS fictif.



\### Git



Exécuter :



git diff --check



et examiner :



git status --short



Les changements préexistants hors mission doivent être explicitement distingués.



\## CERTIFICATION JSON



Le fichier :



Docs/12\_CERTIFICATION/PEOPLE/P3-PEOPLE-001D.certification.json



peut être modifié UNIQUEMENT si toutes les preuves requises conduisent réellement à GO.



En cas de GO :



\- conserver le schéma existant ;

\- compléter uniquement les Evidence / Tests / statut / décision prévus par ce schéma ;

\- référencer les preuves réelles M01/M02/M03 ;

\- ne jamais inventer une preuve.



En cas de NO GO :



ne pas transformer artificiellement la certification en GO.



Documenter les blocages dans le rapport M03.



\## RAPPORT UNIQUE



Créer :



Docs/24\_MODULES/WORK/PEOPLE\_PERSISTENCE\_ARCHITECTURE/MISSIONS/P3-PEOPLE-001D-M03\_CERTIFICATION\_REPORT.md



Le rapport doit contenir :



1\. préconditions M01/M02 ;

2\. matrice A à K ;

3\. commandes exécutées ;

4\. résultats réels ;

5\. tests PASS/FAIL ;

6\. contrôles impossibles ;

7\. changements effectués ;

8\. risques résiduels ;

9\. état du fichier de certification ;

10\. décision finale.



\## CRITÈRE GO



GO autorisé uniquement si :



\- M01 = GO ;

\- M02 = GO ;

\- toutes les exigences contractuelles P3-PEOPLE-001D applicables sont prouvées ;

\- tests PEOPLE PASS ;

\- typecheck PASS ;

\- non-régression Work applicable PASS ;

\- Runtime applicable PASS ;

\- Core/NOVA applicable PASS ;

\- contrôles CEREBRAU applicables PASS ou explicitement démontrés non requis par le gate ;

\- git diff --check PASS ;

\- aucune régression critique ;

\- aucune preuve requise ne manque.



\## VERDICT TERMINAL



Terminer exactement par :



GO — P3-PEOPLE-001D-M03 — P3-PEOPLE-001D CERTIFIED



ou



NO GO — P3-PEOPLE-001D-M03 — P3-PEOPLE-001D NOT CERTIFIED



Ne pas ouvrir P3-PEOPLE-001E.

