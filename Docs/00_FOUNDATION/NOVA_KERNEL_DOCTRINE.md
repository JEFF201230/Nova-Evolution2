\# NOVA KERNEL DOCTRINE



\---



PROGRAM\_ID : NOVA-FOUNDATION



DOCUMENT\_ID : NOVA-000



VERSION : 1.0



STATUS : FOUNDATION



AUTHORITY : CEREBREAU ARCHITECTURE



\---



\# 1. OBJECTIF



Le Kernel NOVA constitue le noyau minimal de la plateforme.



Il fournit les primitives nécessaires au fonctionnement de l'Operating System.



Le Kernel n'a aucune connaissance métier.



Il ne connaît ni VEEDDA, ni Budget, ni Ledger, ni CSE.



Toutes les applications reposent sur le Kernel.



\---



\# 2. PRINCIPES FONDAMENTAUX



Le Kernel doit être :



\- minimal

\- stable

\- générique

\- indépendant

\- extensible

\- testable

\- déterministe



Le Kernel ne contient aucune logique métier.



\---



\# 3. RESPONSABILITÉS



Le Kernel est responsable de :



\- Runtime

\- Scheduler

\- Configuration

\- Dependency Injection

\- Messaging

\- Persistence

\- Storage

\- Logging

\- Resource Management

\- Clock

\- Lifecycle



Il n'est responsable de rien d'autre.



\---



\# 4. CE QUI N'APPARTIENT PAS AU KERNEL



Les composants suivants appartiennent à l'Operating System :



\- Mission Engine

\- Workflow Engine

\- Agent Engine

\- Executive Engine

\- Memory Engine

\- Context Engine

\- Rule Engine

\- Event Engine

\- Simulation Engine



Les composants suivants appartiennent à la Platform :



\- Plugin Manager

\- API

\- SDK

\- Security

\- Observability

\- Administration

\- Marketplace



Les composants suivants appartiennent aux Applications :



\- Budget

\- Ledger

\- Grand Livre

\- Document Core

\- Cockpit

\- Dashboard

\- ASC

\- AEP

\- Subventions

\- CRM

\- ERP

\- RH



\---



\# 5. RÈGLE D'OR



Le Kernel ne dépend d'aucune application.



Toutes les applications dépendent du Kernel.



\---



\# 6. ARCHITECTURE



Applications



↓



Platform



↓



Operating System



↓



Kernel



↓



Host



Le sens des dépendances est strictement descendant.



Aucune dépendance ascendante n'est autorisée.



\---



\# 7. STABILITÉ



Le Kernel constitue l'actif le plus stable de NOVA.



Toute évolution du Kernel nécessite une validation architecturale.



\---



\# 8. ÉVOLUTION



Le Kernel évolue uniquement :



\- par ajout de primitives génériques ;

\- sans casser la compatibilité ;

\- sans introduire de dépendance métier.



\---



\# 9. INTERDICTIONS



Il est interdit d'introduire dans le Kernel :



\- une règle métier ;

\- une logique VEEDDA ;

\- un plugin ;

\- une API métier ;

\- une interface utilisateur ;

\- une dépendance vers une application.



\---



\# 10. VISION



Le Kernel est conçu pour exécuter l'Operating System.



L'Operating System orchestre les plateformes.



Les plateformes hébergent les plugins.



Les plugins implémentent les applications.



Le Kernel constitue le socle technique commun de tous les produits construits sur NOVA.



\---



FIN DU DOCUMENT

