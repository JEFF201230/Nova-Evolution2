\# P3-PLANNING-001C — PLANNING AUTHORITATIVE PRODUCER — IMPLEMENTATION MISSION



\## 1. MISSION



Implémenter exclusivement :



P3-PLANNING-001C — Planning Authoritative Producer



PROGRAM : NOVA-CORE



La mission doit établir Planning Authority comme unique frontière d'acceptation métier des mutations Planning, sur le Foundation Model certifié par P3-PLANNING-001B.



Ne pas anticiper P3-PLANNING-001D ou les lots suivants.



\## 2. SOURCES AUTORITATIVES



Lire avant toute modification :



1\. `Docs/24\_MODULES/WORK/PLANNING\_DOMAIN\_BLUEPRINT.md`

2\. `Docs/24\_MODULES/WORK/PLANNING\_IMPLEMENTATION\_CONTRACT.md`

3\. `Docs/24\_MODULES/WORK/WORK\_DOMAIN\_BLUEPRINT.md`

4\. `Docs/24\_MODULES/WORK/WORK\_PHASE2\_CERTIFICATION.md`

5\. `Docs/12\_CERTIFICATION/certification-registry.json`

6\. `Docs/12\_CERTIFICATION/PLANNING/P3-PLANNING-001B.certification.json`

7\. le Foundation Model réellement présent dans `server/domain/planning/\*\*`



En cas de contradiction réelle entre ces sources, ne pas inventer de résolution : STOP et retourner NO GO avec preuve précise.



\## 3. ENTRY GATE



Vérifier avant toute écriture :



\- `P3-PLANNING-001B` est `CERTIFIED` ;

\- `NextAuthorizedLot` de `P3-PLANNING-001B` vaut `P3-PLANNING-001C` ;

\- `P3-PLANNING-001C` est le lot courant autorisé ;

\- blueprint et contrat Planning sont présents ;

\- Foundation Model `001B` est réellement présent ;

\- aucune Planning Authority concurrente n'existe ;

\- aucune seconde source de vérité Planning n'est introduite.



Si une condition obligatoire échoue : STOP et NO GO.



\## 4. OBJECTIF AUTORISÉ



Implémenter uniquement le Planning Authoritative Producer défini pour `P3-PLANNING-001C`.



La frontière doit couvrir conformément au contrat :



\- Planning Authority comme unique acceptation métier ;

\- `EstablishPlanning` ;

\- `RevisePlanning` ;

\- `WithdrawPlanning` ;

\- validation métier globale avant acceptation ;

\- événements métier Planning autorisés ;

\- provenance explicite ;

\- causalité explicite ;

\- ordre événementiel conforme au contrat ;

\- idempotence lorsque requise par le contrat ;

\- zéro effet métier en cas d'échec ;

\- erreurs métier nécessaires ;

\- tests ciblés du producteur autoritatif.



Toute mutation Planning doit passer par cette autorité.



\## 5. INVARIANTS OBLIGATOIRES



Préserver notamment :



\- `WorkReference` reste l'identité canonique de la racine Planning ;

\- un Planning au maximum par Work ;

\- au plus une version courante ;

\- versions historiques immuables ;

\- versionnement strict et non destructif ;

\- validation atomique de toute proposition ;

\- aucune mutation partielle en cas d'échec ;

\- provenance explicite ;

\- causalité explicite ;

\- événements cohérents avec la mutation acceptée ;

\- absence de doublon événementiel ;

\- ordre événementiel conforme au contrat ;

\- `MilestoneReached` n'est jamais un événement émissible par Planning ;

\- Phase reste distincte du Lifecycle Work ;

\- Progress ou Monitoring ne créent, complètent ou révisent jamais Planning ;

\- Timeline reste dérivée et non autoritative ;

\- aucune seconde source de vérité Planning.



\## 6. COMMANDES CANONIQUES



Implémenter exclusivement les trois commandes métier prévues par le contrat :



\- `EstablishPlanning`

\- `RevisePlanning`

\- `WithdrawPlanning`



Ne créer aucune commande opérationnelle supplémentaire sans exigence explicite du contrat autoritatif.



Chaque commande doit :



\- appliquer ses préconditions ;

\- valider la proposition complète avant mutation ;

\- préserver les invariants du Foundation Model ;

\- produire uniquement les événements métier autorisés ;

\- préserver provenance et causalité ;

\- garantir zéro effet en cas de rejet.



\## 7. ÉVÉNEMENTS



Implémenter uniquement les événements exigés par le contrat.



Vérifier notamment :



\- mapping complet entre mutation acceptée et événements autorisés ;

\- données minimales nécessaires ;

\- provenance ;

\- causalité ;

\- ordre racine/granulaire lorsque le contrat l'exige ;

\- absence de doublon ;

\- aucun événement technique promu en événement métier ;

\- `MilestoneReached` interdit comme événement émis par Planning.



Ne pas inventer de nouveau catalogue événementiel.



\## 8. PÉRIMÈTRE TECHNIQUE



Privilégier exclusivement :



`server/domain/planning/\*\*`



Réutiliser le Foundation Model `001B`.



Créer uniquement les fichiers strictement nécessaires à l'autorité, aux commandes/événements métier autorisés et aux tests ciblés.



Toute nécessité de modifier un fichier hors de cette frontière doit être démontrée comme strictement indispensable au lot.



Si cette nécessité implique persistence, Work, Runtime, transport, API, BFF, UI ou une autre frontière métier : STOP et NO GO au lieu d'élargir silencieusement le périmètre.



\## 9. INTERDICTIONS



Ne pas implémenter :



\- persistence Planning ;

\- repository durable ;

\- migration ;

\- recovery durable ;

\- accès applicatif Planning `001E` ;

\- intégration Work/Planning `001F` ;

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

\- Monitoring ;

\- Action ;

\- Intelligence ;

\- Synthesis ;

\- Confidence ;

\- Timeline comme source autoritative ;

\- `MilestoneReached` comme événement émissible ;

\- logique appartenant à `P3-PLANNING-001D` ou ultérieur.



Ne pas modifier le runtime NOVA/CEREBRAU pour faire passer le lot.



Ne pas modifier le blueprint ou le contrat pour adapter les règles à l'implémentation.



\## 10. PRINCIPE MVP



Appliquer :



Réutiliser → Compléter → Construire.



Réutiliser obligatoirement le Foundation Model certifié de `001B`.



Implémenter le minimum nécessaire pour satisfaire complètement `001C`.



Pas de framework générique.



Pas d'abstraction spéculative.



Pas de fonctionnalité V2.



Pas de duplication.



\## 11. TESTS



Créer les tests ciblés nécessaires pour démontrer au minimum :



\- `EstablishPlanning` : succès, préconditions, erreurs et événements ;

\- `RevisePlanning` : succès, préconditions, erreurs et événements ;

\- `WithdrawPlanning` : succès, préconditions, erreurs et événements ;

\- producteur Planning unique ;

\- validation globale avant mutation ;

\- zéro effet en échec ;

\- provenance ;

\- causalité ;

\- ordre événementiel ;

\- absence de doublon ;

\- idempotence selon les exigences du contrat ;

\- conservation de l'historique ;

\- invariants du Foundation Model préservés ;

\- `MilestoneReached` interdit ;

\- aucune persistence ;

\- aucune intégration Work ;

\- aucune exposition publique ;

\- aucune fonctionnalité `001D+`.



Exécuter également les tests Foundation `001B`.



Exécuter les validations de non-régression applicables au dépôt.



Exécuter :



`git diff --check`



Aucune validation obligatoire échouée ne peut être déclarée PASS.



\## 12. NON-RÉGRESSION



Vérifier que l'implémentation :



\- ne modifie pas PEOPLE ;

\- ne transfère aucun ownership Work vers Planning ;

\- ne modifie pas Objective, Lifecycle ou Progress ;

\- ne modifie pas le runtime NOVA/CEREBRAU ;

\- ne crée aucune persistence ;

\- ne crée aucune exposition publique ;

\- ne crée aucune seconde source Planning ;

\- ne transforme pas Timeline en autorité ;

\- n'affaiblit aucun invariant certifié de `001B`.



\## 13. DISCIPLINE D'EXÉCUTION



Avant modification :



1\. inspecter l'état réel du dépôt ;

2\. vérifier la certification réelle de `001B` ;

3\. vérifier l'autorisation réelle de `001C` ;

4\. lire intégralement les sources autoritatives ;

5\. auditer le Foundation Model réellement implémenté ;

6\. rechercher toute autorité Planning existante ou concurrente ;

7\. déterminer la liste minimale exacte des fichiers à créer ou modifier.



Pendant l'exécution :



\- rester strictement dans `001C` ;

\- réutiliser `001B` ;

\- ne pas corriger les dettes étrangères au lot ;

\- ne pas refactoriser sans nécessité directe ;

\- ne pas anticiper `001D+`.



\## 14. RAPPORT FINAL



Le rapport final doit identifier clairement :



\- MissionId ;

\- lot ;

\- sources consultées ;

\- entry gate ;

\- état initial réel du Foundation Model ;

\- fichiers créés ;

\- fichiers modifiés ;

\- commandes implémentées ;

\- événements implémentés ;

\- invariants démontrés ;

\- tests exécutés ;

\- résultats exacts ;

\- non-régressions ;

\- blockers éventuels ;

\- changements hors périmètre ;

\- décision GO / NO GO.



Distinguer explicitement :



\- FAITS PROUVÉS ;

\- INCONNUES ;

\- BLOCKERS.



\## 15. CRITÈRES GO



GO uniquement si :



\- entry gate PASS ;

\- `001B` certifié et préservé ;

\- Planning Authority constitue l'unique frontière d'acceptation métier ;

\- les trois commandes canoniques sont conformes au contrat ;

\- événements conformes ;

\- provenance et causalité conformes ;

\- validation globale conforme ;

\- zéro effet en échec démontré ;

\- tests ciblés PASS ;

\- tests Foundation PASS ;

\- validations applicables PASS ;

\- `git diff --check` PASS ;

\- aucune régression bloquante ;

\- aucune frontière interdite franchie ;

\- aucune persistence introduite ;

\- aucune fonctionnalité `001D+` anticipée.



Sinon : NO GO.



\## 16. VERDICT TERMINAL



Si toutes les conditions passent, terminer exactement par :



GO — P3-PLANNING-001C — PLANNING AUTHORITATIVE PRODUCER IMPLEMENTED



Sinon terminer exactement par :



NO GO — P3-PLANNING-001C — PLANNING AUTHORITATIVE PRODUCER NOT IMPLEMENTED



Ne pas commencer `P3-PLANNING-001D`.



Ne pas créer ses artefacts.



Ne pas certifier automatiquement `001C` au-delà de ce que permet le mécanisme de gouvernance NOVA.

