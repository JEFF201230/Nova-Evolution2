\# P3-PLANNING-001B — PLANNING FOUNDATION MODEL — IMPLEMENTATION MISSION



\## 1. MISSION



Implémenter exclusivement :



P3-PLANNING-001B — Planning Foundation Model



PROGRAM : NOVA-CORE



La mission doit matérialiser le noyau métier interne Planning défini par le contrat autoritatif existant.



Ne pas anticiper P3-PLANNING-001C ou les lots suivants.



\## 2. SOURCES AUTORITATIVES



Lire avant toute modification :



1\. `Docs/24\_MODULES/WORK/PLANNING\_DOMAIN\_BLUEPRINT.md`

2\. `Docs/24\_MODULES/WORK/PLANNING\_IMPLEMENTATION\_CONTRACT.md`

3\. `Docs/24\_MODULES/WORK/WORK\_DOMAIN\_BLUEPRINT.md`

4\. `Docs/24\_MODULES/WORK/WORK\_PHASE2\_CERTIFICATION.md`

5\. `Docs/12\_CERTIFICATION/certification-registry.json`



En cas de contradiction réelle entre ces sources, ne pas inventer de résolution : retourner NO GO avec preuve précise.



\## 3. ENTRY GATE



Vérifier avant toute écriture :



\- `P3-PLANNING-001A` est `CERTIFIED` ;

\- `NextAuthorizedLot` de `P3-PLANNING-001A` vaut `P3-PLANNING-001B` ;

\- le blueprint Planning est présent ;

\- le contrat Planning est présent ;

\- aucune implémentation Planning concurrente n'existe déjà ;

\- aucune seconde source de vérité Planning n'est introduite.



Si une condition obligatoire échoue : STOP et NO GO.



\## 4. OBJECTIF AUTORISÉ



Implémenter uniquement le Planning Foundation Model nécessaire à `P3-PLANNING-001B`.



Le noyau doit couvrir, conformément au contrat :



\- racine Planning identifiée par `WorkReference` ;

\- `PlanningVersion` immuable ;

\- zéro ou une version courante ;

\- conservation des versions historiques ;

\- `Phase` ;

\- `Milestone` ;

\- `Constraint` ;

\- `Dependency` ;

\- `Schedule` ;

\- `Priority` ;

\- `PlanningProvenance` ;

\- `CausalityId` ;

\- références Planning typées nécessaires ;

\- invariants structurels et temporels ;

\- erreurs métier internes nécessaires ;

\- tests ciblés du Foundation Model.



La Timeline reste une représentation dérivée et ne devient jamais une source autoritative.



\## 5. INVARIANTS OBLIGATOIRES



Préserver notamment :



\- un Planning au maximum par Work ;

\- au plus une version courante ;

\- versions historiques immuables ;

\- versionnement strict et non destructif ;

\- `WorkReference` canonique ;

\- Phase distincte du Lifecycle Work ;

\- Milestone sans durée implicite ;

\- Dependency orientée ;

\- absence de cycle global dans le graphe ;

\- Schedule composé uniquement de temps métier explicitement qualifié ;

\- aucune promotion d'un timestamp technique en temps métier ;

\- Priority sans valeur implicite ou par défaut ;

\- Constraint qualifiée avec source, portée et période d'effet ;

\- provenance obligatoire lorsque le contrat l'exige ;

\- aucune seconde source de vérité ;

\- aucune donnée Planning produite par Progress ;

\- aucune autorité parallèle via Timeline.



\## 6. PÉRIMÈTRE TECHNIQUE



Privilégier exclusivement :



`server/domain/planning/\*\*`



Créer ce répertoire uniquement si nécessaire.



Les tests ciblés Planning peuvent être placés dans cette même frontière.



Toute nécessité de modifier un fichier hors de cette frontière doit être démontrée comme strictement indispensable au lot.



Si cette nécessité implique Work, Runtime, transport, API, BFF, UI, persistence ou une autre frontière métier : STOP et NO GO au lieu d'élargir silencieusement le périmètre.



\## 7. INTERDICTIONS



Ne pas implémenter :



\- Planning Authority ;

\- producteur opérationnel Planning ;

\- persistence Planning ;

\- repository durable ;

\- migration ;

\- Commands opérationnelles ;

\- exposition de Queries opérationnelles ;

\- intégration Work/Planning ;

\- API ;

\- route HTTP ;

\- BFF ;

\- Frontend ;

\- UI ;

\- dashboard ;

\- scheduler ;

\- queue ;

\- timer ;

\- orchestration Runtime ;

\- Progress ;

\- Action ;

\- Intelligence ;

\- Synthesis ;

\- Confidence ;

\- `MilestoneReached` comme événement émissible ;

\- logique appartenant à `P3-PLANNING-001C` ou ultérieur.



Ne pas modifier CEREBRAU/NOVA runtime pour faire passer le lot.



Ne pas modifier le contrat ou le blueprint pour adapter les règles à l'implémentation.



\## 8. PRINCIPE MVP



Appliquer :



Réutiliser → Compléter → Construire.



Implémenter le minimum nécessaire pour satisfaire complètement le contrat de `001B`.



Pas de framework générique.



Pas d'abstraction spéculative.



Pas de fonctionnalité V2.



Pas de duplication.



\## 9. TESTS



Créer les tests ciblés nécessaires pour démontrer au minimum :



\- identité WorkReference ;

\- unicité du Planning par Work ;

\- zéro ou une version courante ;

\- immutabilité des versions historiques ;

\- ordre strict des versions ;

\- Phase distincte du Lifecycle ;

\- Milestone sans durée implicite ;

\- validation des références ;

\- Dependency sans auto-référence ;

\- graphe acyclique ;

\- Schedule avec temps métier explicite ;

\- rejet des valeurs temporelles invalides selon le contrat ;

\- Priority sans défaut implicite ;

\- Constraint qualifiée ;

\- provenance ;

\- invariants globaux du Foundation Model ;

\- absence d'autorité/persistence/intégration anticipée.



Exécuter les validations applicables au périmètre réellement modifié.



Exécuter également :



`git diff --check`



Aucune validation obligatoire échouée ne peut être déclarée PASS.



\## 10. NON-RÉGRESSION



Vérifier que l'implémentation :



\- ne modifie pas PEOPLE ;

\- ne modifie pas Work métier hors nécessité explicitement autorisée ;

\- ne modifie pas le runtime NOVA/CEREBRAU ;

\- ne crée aucune persistence ;

\- ne crée aucune exposition publique ;

\- ne crée aucune seconde source Planning ;

\- n'affaiblit aucun invariant certifié.



\## 11. DISCIPLINE D'EXÉCUTION



Avant modification :



1\. inspecter l'état réel du dépôt ;

2\. rechercher toute implémentation Planning existante ;

3\. lire les sources autoritatives ;

4\. déterminer la liste minimale de fichiers à créer ou modifier.



Pendant l'exécution :



\- rester strictement dans `001B` ;

\- ne pas corriger des dettes étrangères au lot ;

\- ne pas refactoriser des composants sans nécessité directe ;

\- ne pas anticiper `001C+`.



\## 12. RAPPORT FINAL



Le rapport final doit identifier clairement :



\- mission ;

\- lot ;

\- sources consultées ;

\- entry gate ;

\- fichiers créés ;

\- fichiers modifiés ;

\- invariants implémentés ;

\- tests exécutés ;

\- résultats exacts ;

\- non-régressions ;

\- éventuels blockers ;

\- changements hors périmètre : aucun attendu ;

\- décision GO / NO GO.



Le rapport doit distinguer :



\- faits prouvés ;

\- éventuelles inconnues ;

\- éventuels blockers.



\## 13. CRITÈRES GO



GO uniquement si :



\- entry gate PASS ;

\- Foundation Model conforme au contrat ;

\- invariants obligatoires implémentés ;

\- tests ciblés PASS ;

\- validations applicables PASS ;

\- `git diff --check` PASS ;

\- aucune régression bloquante ;

\- aucune frontière interdite franchie ;

\- aucune fonctionnalité `001C+` anticipée.



Sinon : NO GO.



\## 14. VERDICT TERMINAL



Si toutes les conditions passent, terminer exactement par :



GO — P3-PLANNING-001B — PLANNING FOUNDATION MODEL IMPLEMENTED



Sinon terminer exactement par :



NO GO — P3-PLANNING-001B — PLANNING FOUNDATION MODEL NOT IMPLEMENTED



Ne pas commencer `P3-PLANNING-001C`.



Ne pas créer ses artefacts.



Ne pas certifier automatiquement `001B` au-delà de ce que permet le mécanisme de gouvernance NOVA.

