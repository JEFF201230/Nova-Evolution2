\# PROGRAM-BFF-LOT-003 — RUNTIME GATEWAY



\## MISSION



Implémenter exclusivement le \*\*Gateway interne\*\* entre le Secure BFF et le Runtime.



Le Runtime reste inaccessible depuis React.



Le seul point autorisé est :



```text

React

&#x20;   ↓

Secure BFF

&#x20;   ↓

Runtime Gateway

&#x20;   ↓

ProgramProductionEntrypoint

```



\---



\# PRÉREQUIS



Le lot suivant doit être validé :



```text

BFF\_LOT\_002\_READY

```



Si ce prérequis n'est pas démontré :



```text

BFF\_LOT\_003\_BLOCKED

```



\---



\# OBJECTIFS



Implémenter uniquement :



\* RuntimeGateway ;

\* RuntimeGatewayPort ;

\* RuntimeGatewayAdapter ;

\* RuntimeRequestMapper ;

\* RuntimeResponseMapper ;

\* Correlation ID propagation ;

\* timeout de communication ;

\* gestion des erreurs Runtime ;

\* mapping DTO BFF ↔ Runtime ;

\* validation stricte des contrats.



\---



\# ROUTES HTTP



Aucune nouvelle route publique.



Le Gateway est exclusivement interne.



\---



\# INTERDICTIONS



Ne pas :



\* modifier `apps/nova-web` ;

\* connecter React ;

\* modifier `ProgramProductionEntrypoint` ;

\* modifier Human Approval ;

\* modifier Evidence ;

\* modifier Certification ;

\* modifier Kernel ;

\* modifier NOVA Core ;

\* ajouter un package.



\---



\# TESTS OBLIGATOIRES



Tester :



\* appel Gateway valide ;

\* timeout ;

\* Runtime indisponible ;

\* erreur Runtime ;

\* Correlation ID propagé ;

\* mapping Request ;

\* mapping Response ;

\* DTO invalides ;

\* erreurs HTTP transformées ;

\* non-régression complète.



Exécuter :



\* compilation ;

\* lint ;

\* tests BFF ;

\* Kernel ;

\* Runtime ;

\* NOVA Core ;

\* smoke test.



\---



\# LIVRABLES



Créer uniquement :



```text

PROGRAM\_BFF\_LOT\_003\_IMPLEMENTATION\_REPORT.md

PROGRAM\_BFF\_LOT\_003\_SECURITY\_REPORT.md

PROGRAM\_BFF\_LOT\_003\_TEST\_REPORT.md

PROGRAM\_BFF\_LOT\_003\_GO\_NO\_GO.md

```



\---



\# CRITÈRES DE GO



Le Gateway doit :



\* être totalement interne ;

\* appeler exclusivement `ProgramProductionEntrypoint` ;

\* ne créer aucune route HTTP supplémentaire ;

\* préserver toutes les garanties du Runtime ;

\* conserver les empreintes protégées inchangées ;

\* ne provoquer aucune régression.



\---



\# DÉCISION AUTORISÉE



Uniquement :



```text

BFF\_LOT\_003\_READY

```



ou



```text

BFF\_LOT\_003\_BLOCKED

```



Aucune autre décision n'est autorisée.



