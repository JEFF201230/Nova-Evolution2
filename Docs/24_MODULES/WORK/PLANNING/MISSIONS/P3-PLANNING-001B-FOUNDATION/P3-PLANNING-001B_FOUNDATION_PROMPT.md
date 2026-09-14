\# P3-PLANNING-001B — PLANNING FOUNDATION MODEL



\## MISSION



Implémenter et certifier uniquement :



P3-PLANNING-001B — Planning Foundation Model



Mission strictement ciblée DELTA-ONLY.



Ne pas réauditer globalement NOVA.

Ne pas réauditer PEOPLE.

Ne pas relire récursivement tout le dépôt.

Réutiliser les preuves certifiées existantes sauf contradiction matérielle directement détectée.



\## SOURCES CANONIQUES AUTORISÉES



Lire prioritairement et uniquement les sections nécessaires de :



\- Docs/24\_MODULES/WORK/PLANNING\_DOMAIN\_BLUEPRINT.md

\- Docs/24\_MODULES/WORK/PLANNING\_IMPLEMENTATION\_CONTRACT.md

\- Docs/12\_CERTIFICATION/certification-registry.json



Le registre doit confirmer :



\- P3-PLANNING-001A = CERTIFIED

\- NextAuthorizedLot = P3-PLANNING-001B



Utiliser PEOPLE uniquement comme précédent architectural ciblé si nécessaire.

Ne pas rouvrir sa certification.



\## OBJECTIF



Matérialiser uniquement le noyau métier interne Planning défini par 001B :



\- frontière de l'agrégat Planning d'un Work ;

\- Planning Version ;

\- Phase ;

\- Milestone ;

\- Constraint ;

\- Value Objects nécessaires ;

\- Dependency ;

\- Schedule ;

\- Priority ;

\- PlanningProvenance ;

\- erreurs métier ;

\- validation des invariants structurels et temporels ;

\- tests ciblés Foundation.



Aucun producteur opérationnel n'est autorisé dans ce lot.



\## INVARIANTS OBLIGATOIRES



Démontrer au minimum :



1\. WorkReference unique ;

2\. au plus un Planning courant par Work ;

3\. provenance obligatoire ;

4\. temps exclusivement métier, sans promotion d'un timestamp technique ;

5\. Milestone sans durée implicite ;

6\. Phase distincte du Lifecycle Work ;

7\. graphe Dependency acyclique ;

8\. Priority sans valeur par défaut ;

9\. Constraint explicitement qualifiée ;

10\. historique/versionnement immuable.



Timeline reste une représentation dérivée et ne devient jamais une autorité parallèle.



\## PÉRIMÈTRE DE FICHIERS



Avant toute écriture :



1\. inspecter uniquement les précédents structurels strictement nécessaires ;

2\. déterminer la liste exacte minimale des fichiers nécessaires sous :



server/domain/planning/



3\. déclarer cette liste dans le rapport ;

4\. ne modifier aucun fichier métier hors de cette liste sans blocker démontré.



La structure minimale attendue peut comprendre, si le contrat le justifie :



\- planning.aggregate.ts

\- planning-version.entity.ts

\- phase.entity.ts

\- milestone.entity.ts

\- constraint.entity.ts

\- planning.value-objects.ts

\- planning.errors.ts

\- planning-foundation.test.ts

\- index.ts



Cette liste n'autorise pas la création automatique de composants inutiles.

Réutiliser → compléter → construire.



\## INTERDICTIONS ABSOLUES



Ne pas implémenter dans 001B :



\- Planning Authority ;

\- producteur opérationnel ;

\- EstablishPlanning ;

\- RevisePlanning ;

\- WithdrawPlanning ;

\- émission d'événements opérationnels ;

\- MilestoneReached ;

\- persistence ;

\- migration ;

\- repository durable ;

\- Queries opérationnelles ;

\- intégration Work/Planning ;

\- API ;

\- BFF ;

\- Frontend ;

\- transport ;

\- scheduler ;

\- queue ;

\- timer ;

\- logique Runtime ;

\- Progress ;

\- Timeline autoritative.



Ne pas modifier :



\- PEOPLE ;

\- CEREBRAU ;

\- NovaCore Governance ;

\- le mécanisme générique Domain Orchestration ;



sauf si une contradiction bloquante directement causée par 001B est prouvée.



\## VALIDATION



Exécuter uniquement les validations proportionnées au delta.



Obligatoire :



\- tests ciblés Planning Foundation ;

\- typecheck strict applicable aux fichiers Planning ;

\- git diff --check sur les fichiers du lot ;

\- contrôle qu'aucun fichier interdit n'a été modifié.



Ne pas lancer de suite applicative lourde sans nécessité démontrée.



La suite CEREBRAU Domain Orchestration est actuellement une baseline certifiée à 51/51 PASS.

Ne la réauditer que si 001B modifie une dépendance pouvant matériellement l'affecter.



\## CERTIFICATION



Ne certifier P3-PLANNING-001B que si :



\- tous les invariants obligatoires sont démontrés ;

\- le noyau Foundation est conforme au contrat ;

\- aucun composant d'un lot ultérieur n'est anticipé ;

\- aucune seconde source de vérité n'est créée ;

\- aucun ownership n'est ambigu ;

\- aucun fichier hors périmètre n'est modifié ;

\- tests ciblés PASS ;

\- typecheck applicable PASS ;

\- git diff --check PASS ;

\- aucune régression matérielle n'est découverte.



Si GO, créer uniquement l'artefact de certification requis par le mécanisme canonique existant et mettre à jour le registre conformément au contrat.



Ne pas commencer P3-PLANNING-001C.



\## RAPPORT FINAL



Créer un rapport unique :



Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001B-FOUNDATION/P3-PLANNING-001B\_FOUNDATION\_REPORT.md



Le rapport doit contenir uniquement :



1\. sources réellement consultées ;

2\. fichiers créés/modifiés ;

3\. modèle Foundation implémenté ;

4\. invariants démontrés ;

5\. tests exécutés et résultats ;

6\. contrôles de non-régression ;

7\. blockers éventuels ;

8\. décision GO / NO GO ;

9\. état du registre si mutation autorisée ;

10\. prochain lot éventuellement autorisable.



Éviter toute narration d'audit inutile.



\## VERDICT TERMINAL



Si toutes les conditions passent, terminer exactement par :



GO — P3-PLANNING-001B — PLANNING FOUNDATION MODEL CERTIFIED



Sinon terminer exactement par :



NO GO — P3-PLANNING-001B — PLANNING FOUNDATION MODEL NOT CERTIFIED

